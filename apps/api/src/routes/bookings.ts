import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { stripe } from '../lib/stripe.js';
import { parse } from '../lib/parse.js';
import { splitFee } from '../lib/money.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { conflict, forbidden, notFound } from '../lib/httpError.js';
import { isSlotOpen } from '../services/availability.js';
import { busyRanges, releasePayout } from '../services/bookingService.js';

export const bookings = Router();
bookings.use('/bookings', requireAuth);

const createBody = z.object({
  serviceId: z.string().uuid(),
  startsAt: z.coerce.date(),
  address: z.string().trim().min(5, 'Enter the address for the job').max(200),
  notes: z.string().trim().max(1000).optional(),
});

const HOLD_MINUTES = 30;

bookings.post('/bookings', writeLimiter, async (req, res) => {
  const b = parse(createBody, req.body);
  const user = req.user!;
  const service = await prisma.service.findFirst({
    where: { id: b.serviceId, active: true, pro: { status: 'APPROVED' } },
    include: { pro: { include: { windows: true, user: { select: { name: true } } } } },
  });
  if (!service) throw notFound('That service is no longer available');
  const pro = service.pro;
  if (pro.userId === user.id) throw forbidden('You cannot book your own service');

  const endsAt = new Date(b.startsAt.getTime() + service.durationMin * 60_000);
  const busy = await busyRanges(pro.id, new Date(b.startsAt.getTime() - 86_400_000), new Date(endsAt.getTime() + 86_400_000));
  const open = isSlotOpen({ windows: pro.windows, busy, timezone: pro.timezone, durationMin: service.durationMin, from: b.startsAt, days: 1 }, b.startsAt);
  if (!open) throw conflict('That time was just taken. Pick another time.', 'slot_taken');

  const { feeCents } = splitFee(service.priceCents, env.PLATFORM_FEE_BPS);
  const booking = await prisma.booking.create({
    data: {
      customerId: user.id, proId: pro.id, serviceId: service.id,
      startsAt: b.startsAt, endsAt, address: b.address, notes: b.notes,
      priceCents: service.priceCents, feeCents,
      expiresAt: new Date(Date.now() + HOLD_MINUTES * 60_000),
    },
  });

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      customer_email: user.email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: service.priceCents,
          product_data: { name: `${service.name} with ${pro.user.name}`, description: b.startsAt.toISOString() },
        },
      }],
      payment_intent_data: { transfer_group: `booking_${booking.id}`, metadata: { bookingId: booking.id } },
      metadata: { bookingId: booking.id },
      expires_at: Math.floor(Date.now() / 1000) + HOLD_MINUTES * 60,
      success_url: `${env.APP_URL}/bookings/${booking.id}?paid=1`,
      cancel_url: `${env.APP_URL}/pros/${pro.slug}?cancelled=1`,
    },
    { idempotencyKey: `checkout_${booking.id}` },
  );
  await prisma.booking.update({ where: { id: booking.id }, data: { checkoutSessionId: session.id } });
  res.status(201).json({ bookingId: booking.id, checkoutUrl: session.url });
});

const bookingInclude = {
  service: { select: { name: true } },
  pro: { select: { slug: true, timezone: true, user: { select: { name: true } } } },
  review: { select: { rating: true, body: true } },
} as const;

bookings.get('/bookings', async (req, res) => {
  const rows = await prisma.booking.findMany({
    where: { customerId: req.user!.id, status: { not: 'PENDING_PAYMENT' } },
    orderBy: { startsAt: 'desc' }, include: bookingInclude,
  });
  res.json({ bookings: rows });
});

bookings.get('/bookings/:id', async (req, res) => {
  const row = await prisma.booking.findUnique({ where: { id: String(req.params.id) }, include: bookingInclude });
  if (!row || row.customerId !== req.user!.id) throw notFound();
  res.json({ booking: row });
});

/** Customer cancels a paid booking more than 24h out; the payment is refunded in full. */
bookings.post('/bookings/:id/cancel', writeLimiter, async (req, res) => {
  const row = await prisma.booking.findUnique({ where: { id: String(req.params.id) } });
  if (!row || row.customerId !== req.user!.id) throw notFound();
  if (row.status !== 'CONFIRMED') throw conflict('Only confirmed bookings can be cancelled', 'bad_state');
  if (row.startsAt.getTime() - Date.now() < 24 * 3_600_000) {
    throw conflict('Bookings can be cancelled up to 24 hours before the start time', 'too_late');
  }
  if (row.paymentIntentId) {
    await stripe.refunds.create({ payment_intent: row.paymentIntentId }, { idempotencyKey: `refund_${row.id}` });
  }
  const updated = await prisma.booking.update({ where: { id: row.id }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
  res.json({ booking: updated });
});

/** Customer confirms the job is done and releases the pro's payout. */
bookings.post('/bookings/:id/release', writeLimiter, async (req, res) => {
  const row = await prisma.booking.findUnique({ where: { id: String(req.params.id) }, include: { pro: true } });
  if (!row || row.customerId !== req.user!.id) throw notFound();
  const updated = await releasePayout(row);
  res.json({ booking: updated });
});

const reviewBody = z.object({ rating: z.number().int().min(1).max(5), body: z.string().trim().min(10, 'Write at least a sentence').max(1500) });

bookings.post('/bookings/:id/review', writeLimiter, async (req, res) => {
  const r = parse(reviewBody, req.body);
  const row = await prisma.booking.findUnique({ where: { id: String(req.params.id) }, include: { review: true } });
  if (!row || row.customerId !== req.user!.id) throw notFound();
  if (row.status !== 'COMPLETED') throw conflict('You can review a job once it is complete', 'bad_state');
  if (row.review) throw conflict('You already reviewed this job', 'duplicate');
  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({ data: { bookingId: row.id, customerId: row.customerId, proId: row.proId, rating: r.rating, body: r.body } });
    const agg = await tx.review.aggregate({ where: { proId: row.proId }, _avg: { rating: true }, _count: true });
    await tx.proProfile.update({ where: { id: row.proId }, data: { ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10, reviewCount: agg._count } });
    return created;
  });
  res.status(201).json({ review });
});
