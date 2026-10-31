import type { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Role } from '@prisma/client';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { forbidden, unauthorized } from '../lib/httpError.js';

const jwks = createRemoteJWKSet(new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
const secretKey = env.SUPABASE_JWT_SECRET ? new TextEncoder().encode(env.SUPABASE_JWT_SECRET) : null;

async function verify(token: string) {
  if (secretKey) {
    try {
      return (await jwtVerify(token, secretKey, { algorithms: ['HS256'] })).payload;
    } catch {
      /* fall through to JWKS for projects using asymmetric keys */
    }
  }
  return (await jwtVerify(token, jwks)).payload;
}

/** Reads the bearer token. Sets req.user when the user exists in our DB, else req.tokenClaims. */
async function attach(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return false;
  let payload;
  try {
    payload = await verify(header.slice(7));
  } catch {
    throw unauthorized('Your session has expired. Sign in again.');
  }
  const sub = String(payload.sub ?? '');
  if (!sub) throw unauthorized();
  const meta = (payload.user_metadata ?? {}) as Record<string, unknown>;
  const email = String(payload.email ?? '');
  req.tokenClaims = { sub, email, name: String(meta.full_name ?? meta.name ?? email.split('@')[0] ?? 'Member') };
  const user = await prisma.user.findUnique({ where: { id: sub } });
  if (user) req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  return true;
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  await attach(req);
  next();
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const ok = await attach(req);
  if (!ok) throw unauthorized();
  if (!req.user) throw unauthorized('Finish creating your account first');
  next();
}

/** For the sync endpoint: token must be valid, but the User row may not exist yet. */
export async function requireToken(req: Request, _res: Response, next: NextFunction) {
  const ok = await attach(req);
  if (!ok) throw unauthorized();
  next();
}

export const requireRole = (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) throw forbidden();
    next();
  };
