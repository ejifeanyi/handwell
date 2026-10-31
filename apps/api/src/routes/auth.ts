import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { parse } from '../lib/parse.js';
import { requireAuth, requireToken } from '../middleware/auth.js';
import { unauthorized } from '../lib/httpError.js';

export const auth = Router();

/** Called after sign-in. Creates our User row the first time we see a Supabase user. */
auth.post('/auth/sync', requireToken, async (req, res) => {
  const c = req.tokenClaims;
  if (!c) throw unauthorized();
  const user = await prisma.user.upsert({
    where: { id: c.sub },
    update: {},
    create: { id: c.sub, email: c.email, name: c.name, role: 'CUSTOMER' },
    include: { proProfile: { select: { id: true, slug: true, status: true } } },
  });
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, pro: user.proProfile } });
});

auth.get('/me', requireToken, async (req, res) => {
  if (!req.user) throw unauthorized('Finish creating your account first');
  const pro = await prisma.proProfile.findUnique({ where: { userId: req.user.id }, select: { id: true, slug: true, status: true, payoutsEnabled: true } });
  res.json({ user: { ...req.user, pro } });
});

/** Lets a signed-in user change their display name. */
auth.patch('/me', requireAuth, async (req, res) => {
  const b = parse(z.object({ name: z.string().trim().min(2, 'Enter your full name').max(80) }), req.body);
  const user = await prisma.user.update({ where: { id: req.user!.id }, data: { name: b.name }, include: { proProfile: { select: { id: true, slug: true, status: true, payoutsEnabled: true } } } });
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, pro: user.proProfile } });
});
