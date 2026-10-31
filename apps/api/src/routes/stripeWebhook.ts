import { Router, raw } from 'express';
import type Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { stripe } from '../lib/stripe.js';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

export const stripeWebhook = Router();

// Needs the raw body for signature checks, so this router is mounted before express.json().
stripeWebhook.post('/webhooks/stripe', raw({ type: 'application/json' }), async (req, res) => {
  // Stripe gives each endpoint its own signing secret (one for your account, one for Connect events), so accept a comma-separated list.
  let event: Stripe.Event | null = null;
  for (const secret of env.STRIPE_WEBHOOK_SECRET.split(',').map((x) => x.trim()).filter(Boolean)) {
    try { event = stripe.webhooks.constructEvent(req.body, String(req.headers['stripe-signature']), secret); break; } catch { /* try the next secret */ }
  }
  if (!event) return res.status(400).json({ error: { code: 'bad_signature', message: 'Invalid signature' } });

  // Insert-first makes retries and concurrent deliveries safe: only one wins the unique key.
  try {
    await prisma.webhookEvent.create({ data: { id: event.id, type: event.type } });
  } catch {
    return res.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        const bookingId = s.metadata?.bookingId;
        if (bookingId) {
          await prisma.booking.updateMany({
            where: { id: bookingId, status: 'PENDING_PAYMENT' },
            data: { status: 'CONFIRMED', expiresAt: null, paymentIntentId: typeof s.payment_intent === 'string' ? s.payment_intent : null },
          });
        }
        break;
      }
      case 'checkout.session.expired': {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.metadata?.bookingId) {
          await prisma.booking.updateMany({ where: { id: s.metadata.bookingId, status: 'PENDING_PAYMENT' }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
        }
        break;
      }
      case 'account.updated': {
        const a = event.data.object as Stripe.Account;
        await prisma.proProfile.updateMany({ where: { stripeAccountId: a.id }, data: { payoutsEnabled: a.payouts_enabled === true && a.details_submitted === true } });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    // Let Stripe retry: remove the marker so the next delivery is processed.
    await prisma.webhookEvent.delete({ where: { id: event.id } }).catch(() => undefined);
    logger.error({ err, eventId: event.id }, 'webhook handler failed');
    return res.status(500).json({ error: { code: 'handler_failed', message: 'Handler failed' } });
  }
  res.json({ received: true });
});
