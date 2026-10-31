import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { parse } from '../lib/parse.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { notFound } from '../lib/httpError.js';
import { releasePayout } from '../services/bookingService.js';

export const admin = Router();
admin.use('/admin', requireAuth, requireRole('ADMIN'));

admin.get('/admin/stats', async (_req, res) => {
  const paid = await prisma.booking.findMany({ where: { status: { in: ['CONFIRMED', 'COMPLETED'] } }, select: { priceCents: true, feeCents: true, status: true, createdAt: true } });
  const [pros, pending] = await Promise.all([
    prisma.proProfile.count({ where: { status: 'APPROVED' } }),
    prisma.proProfile.count({ where: { status: 'PENDING' } }),
  ]);
  const day = 86_400_000;
  const byDay: Record<string, number> = {};
  for (const b of paid) {
    const k = b.createdAt.toISOString().slice(0, 10);
    byDay[k] = (byDay[k] ?? 0) + b.priceCents;
  }
  res.json({
    gmvCents: paid.reduce((t, b) => t + b.priceCents, 0),
    feesCents: paid.reduce((t, b) => t + b.feeCents, 0),
    bookings: paid.length,
    completed: paid.filter((b) => b.status === 'COMPLETED').length,
    activePros: pros,
    pendingPros: pending,
    last30Days: Array.from({ length: 30 }, (_, i) => {
      const k = new Date(Date.now() - (29 - i) * day).toISOString().slice(0, 10);
      return { date: k, gmvCents: byDay[k] ?? 0 };
    }),
  });
});

admin.get('/admin/pros', async (req, res) => {
  const status = parse(z.enum(['PENDING', 'APPROVED', 'SUSPENDED']).optional(), req.query.status);
  const rows = await prisma.proProfile.findMany({
    where: status ? { status } : {}, orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } }, category: { select: { name: true } }, services: true },
  });
  res.json({ pros: rows });
});

for (const [action, status] of [['approve', 'APPROVED'], ['suspend', 'SUSPENDED']] as const) {
  admin.post(`/admin/pros/:id/${action}`, writeLimiter, async (req, res) => {
    const p = await prisma.proProfile.findUnique({ where: { id: String(req.params.id) } });
    if (!p) throw notFound();
    res.json({ pro: await prisma.proProfile.update({ where: { id: p.id }, data: { status } }) });
  });
}

admin.get('/admin/bookings', async (_req, res) => {
  const rows = await prisma.booking.findMany({
    where: { status: { not: 'PENDING_PAYMENT' } }, orderBy: { createdAt: 'desc' }, take: 100,
    include: { customer: { select: { name: true } }, pro: { select: { user: { select: { name: true } } } }, service: { select: { name: true } } },
  });
  res.json({ bookings: rows });
});

/** Escape hatch: release a payout if a customer never confirms. */
admin.post('/admin/bookings/:id/release', writeLimiter, async (req, res) => {
  const row = await prisma.booking.findUnique({ where: { id: String(req.params.id) }, include: { pro: true } });
  if (!row) throw notFound();
  res.json({ booking: await releasePayout(row) });
});
