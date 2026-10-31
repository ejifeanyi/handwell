'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button, Field, Notice } from '@/components/ui';

export function SignUpForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(null);
    try { await signUp(f.name, f.email, f.password); router.push('/'); }
    catch (err) { setError((err as Error).message); setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <Notice tone="amber" icon="lock">{error}</Notice>}
      <Field label="Full name" autoComplete="name" required value={f.name} onChange={set('name')} />
      <Field label="Email" type="email" autoComplete="email" required value={f.email} onChange={set('email')} />
      <Field label="Password" type="password" autoComplete="new-password" required minLength={8} placeholder="8 or more characters" value={f.password} onChange={set('password')} />
      <Button className="w-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</Button>
      <p className="text-xs text-ink-soft">By creating an account you agree to the Terms and Privacy Policy.</p>
      <p className="text-center text-ink-soft">Already have an account? <Link href="/sign-in" className="font-medium text-clay">Sign in</Link></p>
    </form>
  );
}
