'use client';
import Link from 'next/link';
import { useRequest } from '@/lib/useRequest';
import { formatWhen, usd } from '@/lib/format';
import { Stat } from '@/components/DashShell';
import { Card, Notice, StatusPill } from '@/components/ui';
import type { ProBooking } from './types';

interface Earnings { paidOutCents: number; awaitingReleaseCents: number; upcomingCents: number; jobsCompleted: number; payoutsEnabled: boolean }

export default function ProOverview() {
  const e = useRequest<Earnings>('/pro/earnings', 'PRO');
  const b = useRequest<{ bookings: ProBooking[] }>('/pro/bookings', 'PRO');
  const next = (b.data?.bookings ?? []).filter((x) => x.status === 'CONFIRMED').slice(0, 4);
  return (
    <>
      <h1 className="text-h1">Welcome back</h1>
      {e.data && !e.data.payoutsEnabled && <Notice tone="amber" icon="bank">Set up payouts so Handwell can pay you after each job. <Link href="/pro/payouts" className="font-semibold underline">Set up payouts</Link></Notice>}
      {e.error && <Notice tone="danger" icon="clock">{e.error}</Notice>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Paid out" value={usd(e.data?.paidOutCents ?? 0)} />
        <Stat label="Awaiting customer confirmation" value={usd(e.data?.awaitingReleaseCents ?? 0)} />
        <Stat label="Upcoming (your 85%)" value={usd(e.data?.upcomingCents ?? 0)} />
        <Stat label="Jobs completed" value={String(e.data?.jobsCompleted ?? 0)} />
      </div>
      <Card className="space-y-2 !p-7">
        <div className="flex items-center justify-between"><h2 className="text-h3">Upcoming jobs</h2><Link href="/pro/bookings" className="text-sm font-semibold text-clay">View all</Link></div>
        {next.length === 0 ? <p className="py-4 text-ink-soft">No upcoming jobs yet.</p> : next.map((x) => (
          <div key={x.id} className="flex items-center justify-between gap-4 border-t border-line py-4 first:border-t-0">
            <div><p className="font-semibold">{x.service.name}</p><p className="text-sm text-ink-soft">{x.customer.name} · {formatWhen(x.startsAt)}</p></div><StatusPill status={x.status} />
          </div>
        ))}
      </Card>
    </>
  );
}
