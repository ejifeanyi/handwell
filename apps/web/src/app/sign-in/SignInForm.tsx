'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button, Chip, Field, Notice } from '@/components/ui';

const DEMO_PASSWORD = 'Handwell-demo-1';
const demos = [['Customer', 'customer@handwell.dev'], ['Pro', 'pro@handwell.dev'], ['Admin', 'admin@handwell.dev']] as const;

export function SignInForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get('next') ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(null);
    try { await signIn(email, password); router.push(next.startsWith('/') ? next : '/'); }
    catch (err) { setError((err as Error).message); setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <Notice tone="danger" icon="lock">{error}</Notice>}
      <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button className="w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
      <div className="space-y-3 rounded-card bg-sand p-5">
        <p className="text-sm font-semibold">Demo accounts for the walkthrough</p>
        <div className="flex gap-2">
          {demos.map(([label, mail]) => (
            <button key={label} type="button" onClick={() => { setEmail(mail); setPassword(DEMO_PASSWORD); }}><Chip>{label}</Chip></button>
          ))}
        </div>
        <p className="text-xs text-ink-soft">Tap a role to fill in its login. Password for all three: {DEMO_PASSWORD}</p>
      </div>
      <p className="text-center text-ink-soft">New to Handwell? <Link href="/sign-up" className="font-medium text-clay">Create an account</Link></p>
    </form>
  );
}
