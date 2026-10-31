import type { z } from 'zod';
import { badRequest } from './httpError.js';

export function parse<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const r = schema.safeParse(data);
  if (!r.success) {
    const first = r.error.issues[0];
    throw badRequest(first ? `${first.path.join('.') || 'input'}: ${first.message}` : 'Invalid input', 'validation');
  }
  return r.data;
}
