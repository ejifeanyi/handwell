import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { parse } from '../lib/parse.js';
import { notFound } from '../lib/httpError.js';
import { openSlots } from '../services/availability.js';
import { busyRanges } from '../services/bookingService.js';

export const catalog = Router();

catalog.get('/categories', async (_req, res) => {
  const cats = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { pros: { where: { status: 'APPROVED' } } } } },
  });
  res.json({ categories: cats.map((c) => ({ id: c.id, slug: c.slug, name: c.name, icon: c.icon, proCount: c._count.pros })) });
});

const listQuery = z.object({
  category: z.string().optional(),
  q: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  sort: z.enum(['top', 'price_asc', 'price_desc', 'reviews']).default('top'),
  page: z.coerce.number().int().min(1).default(1),
});
const PAGE = 12;

catalog.get('/pros', async (req, res) => {
  const q = parse(listQuery, req.query);
  const where = {
    status: 'APPROVED' as const,
    ...(q.category ? { category: { slug: q.category } } : {}),
    ...(q.city ? { city: { equals: q.city, mode: 'insensitive' as const } } : {}),
    ...(q.q
      ? { OR: [
          { user: { name: { contains: q.q, mode: 'insensitive' as const } } },
          { headline: { contains: q.q, mode: 'insensitive' as const } },
          { category: { name: { contains: q.q, mode: 'insensitive' as const } } },
        ] }
      : {}),
  };
  const rows = await prisma.proProfile.findMany({
    where,
    include: { user: { select: { name: true } }, category: true, services: { where: { active: true }, select: { priceCents: true } } },
  });
  const items = rows.map((p) => ({
    id: p.id, slug: p.slug, name: p.user.name, headline: p.headline, city: p.city,
    category: { slug: p.category.slug, name: p.category.name },
    ratingAvg: p.ratingAvg, reviewCount: p.reviewCount,
    fromPriceCents: p.services.length ? Math.min(...p.services.map((s) => s.priceCents)) : null,
  }));
  items.sort((a, b) => {
    if (q.sort === 'price_asc') return (a.fromPriceCents ?? 1e9) - (b.fromPriceCents ?? 1e9);
    if (q.sort === 'price_desc') return (b.fromPriceCents ?? 0) - (a.fromPriceCents ?? 0);
    if (q.sort === 'reviews') return b.reviewCount - a.reviewCount;
    return b.ratingAvg - a.ratingAvg || b.reviewCount - a.reviewCount;
  });
  const total = items.length;
  res.json({ total, page: q.page, pageSize: PAGE, items: items.slice((q.page - 1) * PAGE, q.page * PAGE) });
});

catalog.get('/pros/:slug', async (req, res) => {
  const pro = await prisma.proProfile.findFirst({
    where: { slug: String(req.params.slug), status: 'APPROVED' },
    include: {
      user: { select: { name: true } },
      category: true,
      services: { where: { active: true }, orderBy: { priceCents: 'asc' } },
    },
  });
  if (!pro) throw notFound('We could not find that pro');
  const reviews = await prisma.review.findMany({
    where: { proId: pro.id }, orderBy: { createdAt: 'desc' }, take: 20,
    include: { customer: { select: { name: true } } },
  });
  res.json({
    pro: {
      id: pro.id, slug: pro.slug, name: pro.user.name, headline: pro.headline, bio: pro.bio, city: pro.city,
      yearsExperience: pro.yearsExperience, ratingAvg: pro.ratingAvg, reviewCount: pro.reviewCount,
      category: { slug: pro.category.slug, name: pro.category.name },
      services: pro.services.map((s) => ({ id: s.id, name: s.name, description: s.description, priceCents: s.priceCents, durationMin: s.durationMin })),
    },
    reviews: reviews.map((r) => ({ id: r.id, rating: r.rating, body: r.body, author: r.customer.name.split(' ')[0], createdAt: r.createdAt })),
  });
});

const availQuery = z.object({
  serviceId: z.string().uuid(),
  from: z.coerce.date().optional(),
  days: z.coerce.number().int().min(1).max(28).default(14),
});

catalog.get('/pros/:slug/availability', async (req, res) => {
  const q = parse(availQuery, req.query);
  const pro = await prisma.proProfile.findFirst({
    where: { slug: String(req.params.slug), status: 'APPROVED' },
    include: { windows: true, services: { where: { id: q.serviceId, active: true } } },
  });
  const service = pro?.services[0];
  if (!pro || !service) throw notFound('We could not find that service');
  const from = q.from ?? new Date();
  const to = new Date(from.getTime() + (q.days + 1) * 86_400_000);
  const busy = await busyRanges(pro.id, new Date(from.getTime() - 86_400_000), to);
  const slots = openSlots({ windows: pro.windows, busy, timezone: pro.timezone, durationMin: service.durationMin, from, days: q.days });
  res.json({ timezone: pro.timezone, slots });
});
