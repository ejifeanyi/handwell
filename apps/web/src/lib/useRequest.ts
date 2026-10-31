'use client';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from './api';
import { useAuth } from './auth';
import type { Role } from './types';

/** Fetches an authenticated endpoint. Sends signed-out visitors to sign in and wrong-role users home. */
export function useRequest<T>(path: string | null, role?: Role) {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const here = usePathname();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    if (!path || !token) return;
    try { setData(await api<T>(path, { token })); setError(null); }
    catch (e) { setError((e as Error).message); }
    setBusy(false);
  }, [path, token]);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace(`/sign-in?next=${encodeURIComponent(here)}`); return; }
    if (role && user.role !== role) { router.replace('/'); return; }
    load();
  }, [loading, user, role, router, here, load]);

  return { data, error, busy: busy || loading, reload: load, user, token };
}

/** Runs a POST/PUT action with the current token. */
export function useAction() {
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  async function run<T>(key: string, path: string, method = 'POST', body?: unknown): Promise<T | null> {
    setPending(key); setError(null);
    try { return await api<T>(path, { method, body, token }); }
    catch (e) { setError((e as Error).message); return null; }
    finally { setPending(null); }
  }
  return { run, error, pending, setError };
}
