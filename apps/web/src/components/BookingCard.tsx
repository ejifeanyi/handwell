'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDuration, formatTime, usd } from '@/lib/format';
import type { Service, Slots } from '@/lib/types';
import { Button, Notice } from './ui';
import { Icon } from './Icon';
import { Calendar } from './Calendar';
import { Select } from './Select';

const dayParts = (key: string) => {
  const d = new Date(`${key}T12:00:00`);
  return { dow: d.toLocaleDateString('en-US', { weekday: 'short' }), num: d.getDate(), label: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) };
};

export function BookingCard({ slug, proName, services }: { slug: string; proName: string; services: Service[] }) {
  const router = useRouter();
  const { user } = useAuth();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [slots, setSlots] = useState<Slots | null>(null);
  const [tz, setTz] = useState('America/New_York');
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const service = services.find((s) => s.id === serviceId);

  useEffect(() => {
    if (!serviceId) return;
    let live = true;
    setSlots(null); setDay(null); setTime(null); setError(null);
    api<{ timezone: string; slots: Slots }>(`/pros/${slug}/availability?serviceId=${serviceId}&days=28`)
      .then((r) => { if (!live) return; setSlots(r.slots); setTz(r.timezone); setDay(Object.keys(r.slots)[0] ?? null); })
      .catch((e: Error) => live && setError(e.message));
    return () => { live = false; };
  }, [slug, serviceId]);

  const days = useMemo(() => Object.keys(slots ?? {}), [slots]);
  const times = day && slots ? slots[day] ?? [] : [];

  function next() {
    if (!service || !time) return;
    const target = `/checkout?pro=${slug}&service=${service.id}&start=${encodeURIComponent(time)}`;
    router.push(user ? target : `/sign-in?next=${encodeURIComponent(target)}`);
  }

  if (!service) return null;
  return (
    <aside className="space-y-5 rounded-panel border border-line bg-white p-7 shadow-card lg:sticky lg:top-6" aria-label={`Book ${proName}`}>
      <div className="flex items-end gap-2"><span className="font-display text-numeric text-pine">{usd(service.priceCents)}</span><span className="pb-1 text-sm text-ink-soft">{service.name}, {formatDuration(service.durationMin)}</span></div>

      {services.length > 1 && (
        <Select label="Service" value={serviceId} onChange={setServiceId} options={services.map((o) => ({ value: o.id, label: o.name, hint: usd(o.priceCents) }))} />
      )}

      {error ? <Notice tone="danger" icon="clock">{error}</Notice> : !slots ? <p className="text-sm text-ink-soft" role="status">Checking availability…</p> : days.length === 0 ? (
        <Notice tone="sand" icon="calendar">{proName} has no open times in the next two weeks. Check back soon or choose another pro.</Notice>
      ) : (
        <>
          <div><p className="mb-2 text-sm font-semibold">Pick a day</p><Calendar available={days} value={day} onChange={(k) => { setDay(k); setTime(null); }} /></div>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Pick a time{day ? <span className="font-normal text-ink-soft"> on {dayParts(day).label}</span> : null}</legend>
            <div className="grid grid-cols-3 gap-2">
              {times.map((t) => { const on = t === time; return (
                <button key={t} type="button" onClick={() => setTime(t)} aria-pressed={on}
                  className={`rounded-xl py-3 text-sm font-semibold ${on ? 'bg-clay text-white' : 'border-[1.5px] border-line bg-white'}`}>{formatTime(t, tz)}</button>); })}
            </div>
          </fieldset>
        </>
      )}

      <Button className="w-full" disabled={!time} onClick={next}>Continue to book</Button>
      <div className="flex items-start gap-2.5 rounded-[14px] bg-success-tint p-3.5 text-sm text-success"><Icon name="shield" size={22} className="shrink-0 text-pine" />Your payment is held securely and released to {proName.split(' ')[0]} only after the job is done.</div>
      <p className="text-xs text-ink-soft">Free cancellation up to 24 hours before your booking.</p>
    </aside>
  );
}
