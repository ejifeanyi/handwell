import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const health = Router();
health.get('/health', (_req, res) => res.json({ ok: true }));
health.get('/health/db', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true });
});
