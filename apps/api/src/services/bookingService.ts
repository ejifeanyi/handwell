import type { Booking } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { stripe } from '../lib/stripe.js';
import { conflict } from '../lib/httpError.js';
import { splitFee } from '../lib/money.js';
import { env } from '../config/env.js';
import type { Busy } from './availability.js';

/** Time ranges that block new bookings: paid jobs, plus unpaid holds that haven't expired. */
export async function busyRanges(proId: string, from: Date, to: Date): Promise<Busy[]> {
  const rows = await prisma.booking.findMany({
    where: {
      proId,
      startsAt: { lt: to },
      endsAt: { gt: from },
      OR: [
        { status: { in: ['CONFIRMED', 'COMPLETED'] } },
        { status: 'PENDING_PAYMENT', expiresAt: { gt: new Date() } },
      ],
    },
    select: { startsAt: true, endsAt: true },
  });
  return rows;
}

/**
 * Pays the pro their share. The customer's money has been sitting in the platform balance since checkout;
 * this moves it to the pro's connected account. Safe to call twice: Stripe dedupes on the idempotency key
 * and we skip when a transfer is already recorded.
 */
export async function releasePayout(booking: Booking & { pro: { stripeAccountId: string | null; payoutsEnabled: boolean } }) {
  if (booking.payoutTransferId) return booking;
  if (booking.status !== 'COMPLETED') throw conflict('The job must be marked complete first', 'not_completed');
  if (!booking.pro.stripeAccountId || !booking.pro.payoutsEnabled) {
    throw conflict('This pro has not finished setting up payouts yet', 'payouts_not_ready');
  }
  const { proCents } = splitFee(booking.priceCents, env.PLATFORM_FEE_BPS);
  const transfer = await stripe.transfers.create(
    {
      amount: proCents,
      currency: 'usd',
      destination: booking.pro.stripeAccountId,
      transfer_group: `booking_${booking.id}`,
      metadata: { bookingId: booking.id },
    },
    { idempotencyKey: `payout_${booking.id}` },
  );
  return prisma.booking.update({
    where: { id: booking.id },
    data: { payoutTransferId: transfer.id, payoutReleasedAt: new Date() },
  });
}
