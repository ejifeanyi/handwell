import type { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; name: string; role: Role };
      /** Set when a valid token exists but no User row yet (first sign-in). */
      tokenClaims?: { sub: string; email: string; name: string };
    }
  }
}
export {};
