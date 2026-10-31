'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';
import { supabase } from './supabase';
import type { SessionUser } from './types';

interface AuthState {
  user: SessionUser | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (accessToken: string | null) => {
    setToken(accessToken);
    if (!accessToken) { setUser(null); setLoading(false); return; }
    try {
      const { user } = await api<{ user: SessionUser }>('/auth/sync', { method: 'POST', token: accessToken });
      setUser(user);
    } catch { setUser(null); }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => load(data.session?.access_token ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { load(session?.access_token ?? null); });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const value = useMemo<AuthState>(() => ({
    user, token, loading,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message === 'Invalid login credentials' ? 'That email and password do not match.' : error.message);
    },
    async signUp(name, email, password) {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) throw new Error(error.message);
      if (!data.session) throw new Error('Check your email to confirm your account, then sign in.');
    },
    async signOut() { await supabase.auth.signOut(); },
    async refresh() { const { data } = await supabase.auth.getSession(); await load(data.session?.access_token ?? null); },
  }), [user, token, loading, load]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
