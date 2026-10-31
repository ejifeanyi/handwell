'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Avatar, Button, ButtonLink, Card, Field, Loading, Notice, Tag } from '@/components/ui';
import { Icon, type IconName } from '@/components/Icon';

const roleLabel = { CUSTOMER: 'Customer', PRO: 'Pro', ADMIN: 'Admin' } as const;

export default function Account() {
  const { user, loading, signOut, updateName, changePassword } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { if (!loading && !user) router.replace('/sign-in?next=/account'); }, [loading, user, router]);
  useEffect(() => { if (user) setName(user.name); }, [user]);

  if (!user) return <div className="mx-auto max-w-[760px] px-5 py-12"><Loading rows={2} /></div>;

  async function run(key: string, fn: () => Promise<void>, ok: string) {
    setBusy(key); setMsg(null);
    try { await fn(); setMsg({ tone: 'success', text: ok }); }
    catch (e) { setMsg({ tone: 'danger', text: (e as Error).message }); }
    setBusy(null);
  }

  const links: { href: string; icon: IconName; title: string; hint: string }[] = [
    { href: '/bookings', icon: 'calendar', title: 'My bookings', hint: 'Upcoming and past jobs you booked' },
    ...(user.role === 'PRO' ? [{ href: '/pro', icon: 'grid' as const, title: 'Pro dashboard', hint: 'Bookings, availability, services and payouts' }] : []),
    ...(user.role === 'ADMIN' ? [{ href: '/admin', icon: 'grid' as const, title: 'Admin dashboard', hint: 'Approvals, pros, bookings and revenue' }] : []),
    ...(user.role === 'CUSTOMER' ? [{ href: '/become-a-pro', icon: 'briefcase' as const, title: 'Become a pro', hint: 'Get booked by neighbors and keep 85% of each job' }] : []),
  ];

  return (
    <div className="mx-auto max-w-[760px] space-y-6 px-5 pb-24 pt-8 md:pt-12">
      <div className="flex items-center gap-4">
        <Avatar name={user.name} size={64} />
        <div className="min-w-0"><h1 className="text-h2">{user.name}</h1><p className="flex flex-wrap items-center gap-2 text-ink-soft"><span className="truncate">{user.email}</span><Tag>{roleLabel[user.role]}</Tag></p></div>
      </div>

      {msg && <Notice tone={msg.tone} icon={msg.tone === 'success' ? 'check' : 'lock'}>{msg.text}</Notice>}

      {user.role === 'PRO' && user.pro && user.pro.status !== 'APPROVED' && (
        <Notice tone="amber" icon="clock">Your pro application is {user.pro.status === 'PENDING' ? 'waiting for review. You will appear in search once approved.' : 'suspended. Contact support to learn more.'}</Notice>
      )}

      <Card className="!p-0">
        <ul>
          {links.map((l) => (
            <li key={l.href} className="border-t border-line first:border-t-0">
              <Link href={l.href} className="flex items-center gap-4 p-5 transition-colors hover:bg-sage/40 sm:p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage text-pine"><Icon name={l.icon} size={22} /></span>
                <span className="min-w-0 flex-1"><span className="block font-semibold">{l.title}</span><span className="block text-sm text-ink-soft">{l.hint}</span></span>
                <Icon name="right" size={18} className="text-ink-soft" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-5 !p-6 md:!p-8">
        <h2 className="text-h3">Profile</h2>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run('name', () => updateName(name), 'Name updated.'); }}>
          <Field label="Full name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} autoComplete="name" />
          <Field label="Email" value={user.email} readOnly disabled />
          <Button size="sm" disabled={busy === 'name' || name.trim() === user.name}>{busy === 'name' ? 'Saving…' : 'Save changes'}</Button>
        </form>
      </Card>

      <Card className="space-y-5 !p-6 md:!p-8">
        <h2 className="text-h3">Password</h2>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run('pw', async () => { await changePassword(pw); setPw(''); }, 'Password changed.'); }}>
          <Field label="New password" type="password" autoComplete="new-password" minLength={8} placeholder="8 or more characters" value={pw} onChange={(e) => setPw(e.target.value)} required />
          <Button size="sm" variant="secondary" disabled={busy === 'pw' || pw.length < 8}>{busy === 'pw' ? 'Updating…' : 'Change password'}</Button>
        </form>
        <p className="text-xs text-ink-soft">The demo logins share one password. Changing it here affects anyone using this demo account.</p>
      </Card>

      <div className="flex justify-between gap-3">
        <ButtonLink href="/" variant="secondary" size="sm">Back home</ButtonLink>
        <Button size="sm" variant="secondary" className="!border-danger !text-danger hover:!bg-danger-tint" onClick={async () => { await signOut(); router.push('/'); }}>Sign out</Button>
      </div>
    </div>
  );
}
