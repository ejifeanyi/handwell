import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const common = { standardHeaders: true, legacyHeaders: false, skip: () => env.NODE_ENV === 'test' };
const body = (message: string) => ({ error: { code: 'rate_limited', message } });

/** Everything under /api: generous, stops scraping and accidental loops. */
export const apiLimiter = rateLimit({ ...common, windowMs: 60_000, limit: 120, message: body('Too many requests. Try again in a minute.') });
/** Money-moving and write endpoints: tighter. */
export const writeLimiter = rateLimit({ ...common, windowMs: 60_000, limit: 20, message: body('Too many attempts. Wait a minute and try again.') });
