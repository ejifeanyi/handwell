'use client';
import Link from 'next/link';
import { useRequest, useAction } from '@/lib/useRequest';
import { usdExact } from '@/lib/format';
import type { Booking } from '@/lib/types';
import { Button, ButtonLink, Card, Empty, Notice, Stars, StatusPill, Loading } from '@/components/ui';
import { Icon } from '@/components/Icon';

export default function MyBookings() {
  const { data, error, busy, reload } = useRequest<{ bookings: Booking[] }>('/bookings');
  const act = useAction();

  async function go(id: string, kind: 'cancel' | 'release') {
    if (kind === 'cancel' && !confirm('Cancel this booking? You will be refunded in full.')) return;
    if (await act.run(`${kind}${id}`, `/bookings/${id}/${kind}`)) reload();
  }

  const list = data?.bookings ?? [];
  const upcoming = list.filter((b) => b.status === 'CONFIRMED' || (b.status === 'COMPLETED' && !b.payoutReleasedAt));
  const past = list.filter((b) => !upcoming.includes(b));

  const row = (b: Booking) => {
    const hours = (new Date(b.startsAt).getTime() - Date.now()) / 3_600_000;
    const d = new Date(b.startsAt);
    const tz = b.pro.timezone;
    const mon = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short' }).format(d);
    const day = new Intl.DateTimeFormat('en-US', { timeZone: tz, day: 'numeric' }).format(d);
    const when = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long', hour: 'numeric', minute: '2-digit' }).format(d);
    return (
      <Card key={b.id} className="flex gap-4 !p-5 transition-shadow hover:shadow-card sm:gap-5 sm:!p-6">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-sage text-pine sm:h-[72px] sm:w-[72px]" aria-hidden="true">
          <span className="text-xs font-semibold uppercase tracking-wide">{mon}</span><span className="font-display text-h3 leading-none">{day}</span>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0"><Link href={`/pros/${b.pro.slug}`} className="block truncate text-h4 font-bold hover:underline">{b.service.name}</Link><p className="text-ink-soft">with {b.pro.user.name}</p></div>
            <StatusPill status={b.status} />
          </div>
          <div className="space-y-1 text-sm text-ink-soft">
            <p className="flex items-center gap-2"><Icon name="clock" size={16} className="shrink-0" />{when}</p>
            <p className="flex items-center gap-2"><Icon name="pin" size={16} className="shrink-0" /><span className="truncate">{b.address}</span></p>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3">
            <span className="font-bold">{usdExact(b.priceCents)}</span>
            <span className="ml-auto flex flex-wrap items-center gap-2">
              {b.status === 'CONFIRMED' && hours > 24 && <Button size="sm" variant="secondary" disabled={!!act.pending} onClick={() => go(b.id, 'cancel')}>Cancel</Button>}
              {b.status === 'COMPLETED' && !b.payoutReleasedAt && <Button size="sm" disabled={!!act.pending} onClick={() => go(b.id, 'release')}>{act.pending === `release${b.id}` ? 'Releasing…' : 'Confirm job done and pay pro'}</Button>}
              {b.status === 'COMPLETED' && b.payoutReleasedAt && !b.review && <ButtonLink size="sm" variant="secondary" href={`/bookings/${b.id}/review`}>Leave a review</ButtonLink>}
              {b.review && <span className="flex items-center gap-1.5 text-sm text-ink-soft"><Stars value={b.review.rating} size={14} />Reviewed</span>}
            </span>
          </div>
          {b.status === 'CONFIRMED' && hours <= 24 && hours > 0 && <p className="text-xs text-ink-soft">Free cancellation has ended for this booking.</p>}
        </div>
      </Card>
    );
  };

  return (
    <div className="mx-auto max-w-[860px] space-y-8 px-5 pb-24 pt-12">
      <h1 className="text-h1">My bookings</h1>
      {act.error && <Notice tone="danger" icon="clock">{act.error}</Notice>}
      {error && <Notice tone="danger" icon="clock">{error}</Notice>}
      {busy ? <Loading /> : list.length === 0 ? (
        <Empty icon="calendar" title="No bookings yet" action={<ButtonLink href="/pros">Find a pro</ButtonLink>}>When you book a pro, it shows up here so you can track, cancel and review it.</Empty>
      ) : (
        <>
          {upcoming.length > 0 && <section className="space-y-4"><h2 className="text-h3">Upcoming and in progress</h2>{upcoming.map(row)}</section>}
          {past.length > 0 && <section className="space-y-4"><h2 className="text-h3 text-ink-soft">Past</h2>{past.map(row)}</section>}
        </>
      )}
    </div>
  );
}
