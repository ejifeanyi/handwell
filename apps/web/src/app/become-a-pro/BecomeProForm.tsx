'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAction, useRequest } from '@/lib/useRequest';
import { useAuth } from '@/lib/auth';
import type { Category } from '@/lib/types';
import { Select } from '@/components/Select';
import { Button, ButtonLink, Card, Field, Notice, TextArea, Loading } from '@/components/ui';

export function BecomeProForm() {
  const { user, busy } = useRequest<unknown>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [done, setDone] = useState(false);
  const [f, setF] = useState({ categorySlug: '', headline: '', bio: '', city: 'Columbus', years: '3', service: '', description: '', price: '120', minutes: '60' });
  const act = useAction();
  const { refresh } = useAuth();
  useEffect(() => { api<{ categories: Category[] }>('/categories').then((r) => { setCats(r.categories); setF((x) => ({ ...x, categorySlug: r.categories[0]?.slug ?? '' })); }).catch(() => {}); }, []);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await act.run('apply', '/pro/apply', 'POST', {
      categorySlug: f.categorySlug, headline: f.headline, bio: f.bio, city: f.city, yearsExperience: Number(f.years),
      services: [{ name: f.service, description: f.description, priceCents: Math.round(Number(f.price) * 100), durationMin: Number(f.minutes) }],
      windows: [1, 2, 3, 4, 5].map((weekday) => ({ weekday, startMinute: 540, endMinute: 1020 })),
    });
    if (r) { await refresh(); setDone(true); }
  }

  if (busy && !user) return <Loading />;
  if (done) return (
    <div className="mx-auto max-w-xl space-y-5 px-5 py-20 text-center"><h1 className="text-h1">Application received</h1><p className="text-ink-soft">We review applications within one business day. You’ll appear in search once approved.</p><ButtonLink href="/pro">Go to your dashboard</ButtonLink></div>
  );
  return (
    <form onSubmit={submit} className="mx-auto max-w-[720px] space-y-6 px-5 pb-24 pt-14">
      <h1 className="text-h1">Become a Handwell pro</h1>
      <p className="text-ink-soft">Get booked by neighbors, set your own prices and keep 85% of every job. You can add more services and change your hours after applying.</p>
      <Card className="space-y-5 !p-8">
        <Select label="What do you do?" value={f.categorySlug} onChange={(v) => setF({ ...f, categorySlug: v })} options={cats.map((c) => ({ value: c.slug, label: c.name }))} />
        <Field label="Headline" required minLength={10} placeholder="Licensed plumber, 12 years in Columbus" value={f.headline} onChange={set('headline')} />
        <TextArea label="About you" required minLength={40} placeholder="Tell customers about your experience and how you work." value={f.bio} onChange={set('bio')} />
        <div className="grid grid-cols-2 gap-4"><Field label="City" required value={f.city} onChange={set('city')} /><Field label="Years of experience" type="number" min={0} value={f.years} onChange={set('years')} /></div>
      </Card>
      <Card className="space-y-5 !p-8">
        <h2 className="text-h3">Your first service</h2>
        <Field label="Service name" required placeholder="Faucet repair" value={f.service} onChange={set('service')} />
        <Field label="Description" required minLength={10} value={f.description} onChange={set('description')} />
        <div className="grid grid-cols-2 gap-4"><Field label="Price (USD)" type="number" min={10} value={f.price} onChange={set('price')} /><Field label="Minutes" type="number" min={30} step={15} value={f.minutes} onChange={set('minutes')} /></div>
        <p className="text-xs text-ink-soft">We’ll start you with Monday to Friday, 9am to 5pm. Change it any time.</p>
      </Card>
      {act.error && <Notice tone="danger" icon="clock">{act.error}</Notice>}
      <Button disabled={act.pending === 'apply'}>{act.pending === 'apply' ? 'Sending…' : 'Submit application'}</Button>
    </form>
  );
}
