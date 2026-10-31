import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { stripe } from '../lib/stripe.js';
import { parse } from '../lib/parse.js';
import { env } from '../config/env.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { conflict, notFound } from '../lib/httpError.js';
import { splitFee } from '../lib/money.js';

export const pro = Router();

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const applyBody = z.object({
  categorySlug: z.string(),
  headline: z.string().trim().min(10).max(120),
  bio: z.string().trim().min(40, 'Tell customers a little more about your work').max(2000),
  city: z.string().trim().min(2).max(80),
  yearsExperience: z.number().int().min(0).max(60),
  timezone: z.string().default('America/New_York'),
  services: z.array(z.object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().min(10).max(400),
    priceCents: z.number().int().min(1000).max(500_000),
    durationMin: z.number().int().min(30).max(720),
  })).min(1).max(8),
  windows: z.array(z.object({
    weekday: z.number().int().min(0).max(6),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(1).max(1440),
  }).refine((w) => w.endMinute > w.startMinute, 'End time must be after start time')).min(1).max(21),
});

/** A signed-in customer applies to become a pro. An admin approves before they appear in search. */
pro.post('/pro/apply', requireAuth, writeLimiter, async (req, res) => {
  const b = parse(applyBody, req.body);
  const user = req.user!;
  if (await prisma.proProfile.findUnique({ where: { userId: user.id } })) throw conflict('You already have a pro profile', 'duplicate');
  const category = await prisma.category.findUnique({ where: { slug: b.categorySlug } });
  if (!category) throw notFound('Pick a category from the list');
  const base = slugify(user.name) || 'pro';
  let slug = base;
  for (let i = 2; await prisma.proProfile.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
  const created = await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { role: 'PRO' } });
    return tx.proProfile.create({
      data: {
        userId: user.id, slug, categoryId: category.id, headline: b.headline, bio: b.bio, city: b.city,
        yearsExperience: b.yearsExperience, timezone: b.timezone,
        services: { create: b.services }, windows: { create: b.windows },
      },
    });
  });
  res.status(201).json({ pro: created });
});

pro.use('/pro', requireAuth, requireRole('PRO'));

pro.get('/pro/me', async (req, res) => {
  const p = await prisma.proProfile.findUnique({
    where: { userId: req.user!.id },
    include: { services: true, windows: true, category: true },
  });
  if (!p) throw notFound();
  res.json({ pro: p });
});

const windowsBody = z.object({
  windows: z.array(z.object({
    weekday: z.number().int().min(0).max(6),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(1).max(1440),
  }).refine((w) => w.endMinute > w.startMinute, 'End time must be after start time')).max(21),
});

/** Replaces the pro's weekly availability. */
pro.put('/pro/availability', writeLimiter, async (req, res) => {
  const b = parse(windowsBody, req.body);
  const p = await prisma.proProfile.findUnique({ where: { userId: req.user!.id } });
  if (!p) throw notFound();
  await prisma.$transaction([
    prisma.availabilityWindow.deleteMany({ where: { proId: p.id } }),
    prisma.availabilityWindow.createMany({ data: b.windows.map((w) => ({ ...w, proId: p.id })) }),
  ]);
  res.json({ windows: await prisma.availabilityWindow.findMany({ where: { proId: p.id } }) });
});

const servicesBody = z.object({
  services: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().min(10).max(400),
    priceCents: z.number().int().min(1000).max(500_000),
    durationMin: z.number().int().min(30).max(720),
  })).min(1).max(8),
});

/** Saves the pro's service list. Services left out are switched off rather than deleted so past bookings keep their record. */
pro.put('/pro/services', writeLimiter, async (req, res) => {
  const b = parse(servicesBody, req.body);
  const p = await prisma.proProfile.findUnique({ where: { userId: req.user!.id }, include: { services: true } });
  if (!p) throw notFound();
  const owned = new Set(p.services.map((s) => s.id));
  const keep = new Set(b.services.map((s) => s.id).filter((id): id is string => !!id && owned.has(id)));
  await prisma.$transaction([
    prisma.service.updateMany({ where: { proId: p.id, id: { notIn: [...keep] } }, data: { active: false } }),
    ...b.services.map((s) => {
      const { id, ...data } = s;
      return id && owned.has(id)
        ? prisma.service.update({ where: { id }, data: { ...data, active: true } })
        : prisma.service.create({ data: { ...data, proId: p.id } });
    }),
  ]);
  res.json({ services: await prisma.service.findMany({ where: { proId: p.id, active: true } }) });
});

pro.get('/pro/bookings', async (req, res) => {
  const p = await prisma.proProfile.findUnique({ where: { userId: req.user!.id } });
  if (!p) throw notFound();
  const rows = await prisma.booking.findMany({
    where: { proId: p.id, status: { not: 'PENDING_PAYMENT' } },
    orderBy: { startsAt: 'asc' },
    include: { service: { select: { name: true } }, customer: { select: { name: true } } },
  });
  res.json({ bookings: rows });
});

pro.post('/pro/bookings/:id/complete', writeLimiter, async (req, res) => {
  const p = await prisma.proProfile.findUnique({ where: { userId: req.user!.id } });
  const row = await prisma.booking.findUnique({ where: { id: String(req.params.id) } });
  if (!p || !row || row.proId !== p.id) throw notFound();
  if (row.status !== 'CONFIRMED') throw conflict('Only confirmed jobs can be marked complete', 'bad_state');
  const updated = await prisma.booking.update({ where: { id: row.id }, data: { status: 'COMPLETED', completedAt: new Date() } });
  res.json({ booking: updated });
});

/** Earnings summary: what's been paid out, what's waiting on the customer, and what's booked ahead. */
pro.get('/pro/earnings', async (req, res) => {
  const p = await prisma.proProfile.findUnique({ where: { userId: req.user!.id } });
  if (!p) throw notFound();
  const rows = await prisma.booking.findMany({ where: { proId: p.id, status: { in: ['CONFIRMED', 'COMPLETED'] } } });
  const share = (priceCents: number) => splitFee(priceCents, env.PLATFORM_FEE_BPS).proCents;
  const sum = (list: typeof rows) => list.reduce((t, b) => t + share(b.priceCents), 0);
  res.json({
    paidOutCents: sum(rows.filter((b) => b.payoutTransferId)),
    awaitingReleaseCents: sum(rows.filter((b) => b.status === 'COMPLETED' && !b.payoutTransferId)),
    upcomingCents: sum(rows.filter((b) => b.status === 'CONFIRMED')),
    jobsCompleted: rows.filter((b) => b.status === 'COMPLETED').length,
    payoutsEnabled: p.payoutsEnabled,
  });
});

/** Starts (or resumes) Stripe Connect Express onboarding so the pro can receive payouts. */
pro.post('/pro/connect/onboarding', writeLimiter, async (req, res) => {
  const p = await prisma.proProfile.findUnique({ where: { userId: req.user!.id } });
  if (!p) throw notFound();
  let accountId = p.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express', country: 'US', email: req.user!.email,
      capabilities: { transfers: { requested: true } },
      business_type: 'individual',
      metadata: { proId: p.id },
    });
    accountId = account.id;
    await prisma.proProfile.update({ where: { id: p.id }, data: { stripeAccountId: accountId } });
  }
  const link = await stripe.accountLinks.create({
    account: accountId, type: 'account_onboarding',
    refresh_url: `${env.APP_URL}/pro/payouts?refresh=1`,
    return_url: `${env.APP_URL}/pro/payouts?done=1`,
  });
  res.json({ url: link.url });
});
