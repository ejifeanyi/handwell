import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { SignJWT } from 'jose';

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), upsert: vi.fn() },
  category: { findMany: vi.fn() },
  proProfile: { findMany: vi.fn(), findFirst: vi.fn() },
  review: { findMany: vi.fn() },
  $queryRaw: vi.fn(),
}));
vi.mock('../src/lib/prisma.js', () => ({ prisma: db }));
vi.mock('../src/lib/stripe.js', () => ({ stripe: {} }));

import { createApp } from '../src/app.js';

const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);
const token = (sub: string, email = 'a@b.com') =>
  new SignJWT({ email, user_metadata: { full_name: 'Test User' } }).setProtectedHeader({ alg: 'HS256' }).setSubject(sub).setExpirationTime('1h').sign(secret);

const app = createApp();
beforeEach(() => vi.clearAllMocks());

describe('public routes', () => {
  it('health responds', async () => {
    expect((await request(app).get('/health')).body).toEqual({ ok: true });
  });
  it('lists categories with pro counts', async () => {
    db.category.findMany.mockResolvedValue([{ id: '1', slug: 'cleaning', name: 'Cleaning', icon: 'sparkle', _count: { pros: 4 } }]);
    const r = await request(app).get('/api/categories');
    expect(r.status).toBe(200);
    expect(r.body.categories[0]).toMatchObject({ slug: 'cleaning', proCount: 4 });
  });
  it('sorts pros by rating and computes the from-price', async () => {
    const p = (slug: string, r: number, prices: number[]) => ({
      id: slug, slug, headline: 'h', city: 'Columbus', ratingAvg: r, reviewCount: 5,
      user: { name: slug }, category: { slug: 'c', name: 'C' }, services: prices.map((priceCents) => ({ priceCents })),
    });
    db.proProfile.findMany.mockResolvedValue([p('low', 4.2, [9000, 5000]), p('high', 4.9, [12000])]);
    const r = await request(app).get('/api/pros');
    expect(r.body.items.map((i: { slug: string }) => i.slug)).toEqual(['high', 'low']);
    expect(r.body.items[1].fromPriceCents).toBe(5000);
  });
  it('rejects bad query input', async () => {
    const r = await request(app).get('/api/pros?sort=nope');
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe('validation');
  });
  it('404s unknown routes in the same error shape', async () => {
    const r = await request(app).get('/nothing');
    expect(r.status).toBe(404);
    expect(r.body.error.code).toBe('not_found');
  });
});

describe('auth', () => {
  it('requires a token for bookings', async () => {
    expect((await request(app).get('/api/bookings')).status).toBe(401);
  });
  it('rejects a bad token', async () => {
    expect((await request(app).get('/api/bookings').set('Authorization', 'Bearer nope')).status).toBe(401);
  });
  it('creates the user row on first sync', async () => {
    db.user.findUnique.mockResolvedValue(null);
    db.user.upsert.mockResolvedValue({ id: 'u1', email: 'a@b.com', name: 'Test User', role: 'CUSTOMER', proProfile: null });
    const r = await request(app).post('/api/auth/sync').set('Authorization', `Bearer ${await token('u1')}`);
    expect(r.status).toBe(200);
    expect(r.body.user.role).toBe('CUSTOMER');
  });
  it('blocks customers from admin routes', async () => {
    db.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', name: 'T', role: 'CUSTOMER' });
    const r = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${await token('u1')}`);
    expect(r.status).toBe(403);
  });
});
