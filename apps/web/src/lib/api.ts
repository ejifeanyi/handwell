const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

interface Opts { method?: string; body?: unknown; token?: string | null }

export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method: opts.method ?? 'GET',
      headers: { 'Content-Type': 'application/json', ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(0, 'offline', 'We could not reach Handwell right now. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data?.error?.code ?? 'error', data?.error?.message ?? 'Something went wrong. Try again.');
  return data as T;
}

/** Server-side reads that should never take a page down: returns the fallback if the API is unreachable. */
export async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch { return fallback; }
}
