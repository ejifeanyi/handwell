'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAction, useRequest } from '@/lib/useRequest';
import { formatDuration, formatWhen, usd } from '@/lib/format';
import type { ProDetail } from '@/lib/types';
import { Avatar, Button, Card, Field, Notice, TextArea, Loading } from '@/components/ui';
import { Icon } from '@/components/Icon';

export function CheckoutForm() {
  const q = useSearchParams();
  const slug = q.get('pro') ?? '', serviceId = q.get('service') ?? '', start = q.get('start') ?? '';
  const { user, busy } = useRequest<unknown>(null);
  const [pro, setPro] = useState<ProDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const act = useAction();

  useEffect(() => { if (slug) api<{ pro: ProDetail }>(`/pros/${slug}`).then((r) => setPro(r.pro)).catch((e: Error) => setLoadError(e.message)); }, [slug]);
  const service = pro?.services.find((s) => s.id === serviceId);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    const r = await act.run<{ checkoutUrl: string }>('pay', '/bookings', 'POST', { serviceId, startsAt: start, address, notes: notes || undefined });
    if (r?.checkoutUrl) window.location.href = r.checkoutUrl;
  }

  if (busy && !user) return <Loading />;
  if (loadError || !slug || !start) return <div className="mx-auto max-w-xl p-20"><Notice tone="danger" icon="clock">{loadError ?? 'This booking link is incomplete. Pick a time on the pro’s page.'}</Notice></div>;
  if (!pro || !service) return <Loading />;

  return (
    <div className="mx-auto grid max-w-[1100px] items-start gap-8 px-5 pb-24 pt-8 md:px-10 md:pt-12 lg:grid-cols-[1fr_380px] lg:gap-10">
      <form onSubmit={pay} className="space-y-6">
        <div className="space-y-2"><h1 className="text-h1">Confirm your booking</h1><p className="text-ink-soft">Step 2 of 2. Tell {pro.name.split(' ')[0]} where to go, then pay securely with Stripe.</p></div>
        <Card className="space-y-5 !p-8">
          <h2 className="text-h3">Where should {pro.name.split(' ')[0]} come?</h2>
          <Field label="Street address" autoComplete="street-address" required minLength={5} placeholder="123 Main St, Columbus, OH" value={address} onChange={(e) => setAddress(e.target.value)} />
          <TextArea label="Notes for your pro (optional)" placeholder="Gate code, parking, what needs attention…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Card>
        {act.error && <Notice tone="danger" icon="clock">{act.error}</Notice>}
        <Button className="w-full" disabled={act.pending === 'pay'}>{act.pending === 'pay' ? 'Taking you to payment…' : `Pay ${usd(service.priceCents)} securely`}</Button>
        <p className="flex items-center gap-2 text-sm text-ink-soft"><Icon name="lock" size={16} />Payment is handled by Stripe. In this demo use card 4242 4242 4242 4242, any future date and any CVC.</p>
      </form>
      <Card className="order-first space-y-4 !p-6 lg:sticky lg:top-28 lg:order-none">
        <h2 className="text-h4">Booking summary</h2>
        <div className="flex items-center gap-3 rounded-2xl bg-sage/50 p-3"><Avatar name={pro.name} size={44} /><div><p className="font-semibold">{service.name}</p><p className="text-sm text-ink-soft">with {pro.name}, {formatDuration(service.durationMin)}</p></div></div>
        <p className="flex items-center gap-2 text-sm"><Icon name="calendar" size={18} className="text-ink-soft" />{formatWhen(start)}</p>
        <div className="flex justify-between border-t border-line pt-4 text-h4 font-bold"><span>Total</span><span>{usd(service.priceCents)}</span></div>
        <p className="text-xs text-ink-soft">No extra fees. Free cancellation up to 24 hours before.</p>
      </Card>
    </div>
  );
}
