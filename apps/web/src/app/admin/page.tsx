'use client';
import Link from 'next/link';
import { useRequest } from '@/lib/useRequest';
import { usd } from '@/lib/format';
import { Stat } from '@/components/DashShell';
import { Notice, Loading } from '@/components/ui';
import type { Stats } from './types';

export default function AdminHome() {
  const { data, error, busy } = useRequest<Stats>('/admin/stats', 'ADMIN');
  return (
    <>
      <h1 className="text-h1">Marketplace overview</h1>
      {error && <Notice tone="danger" icon="clock">{error}</Notice>}
      {busy ? <Loading /> : data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Total bookings value" value={usd(data.gmvCents)} />
            <Stat label="Handwell revenue (15%)" value={usd(data.feesCents)} />
            <Stat label="Bookings" value={String(data.bookings)} hint={`${data.completed} completed`} />
            <Stat label="Active pros" value={String(data.activePros)} />
          </div>
          {data.pendingPros > 0 && <Notice tone="amber" icon="inbox">{data.pendingPros} pro application{data.pendingPros > 1 ? 's' : ''} waiting. <Link href="/admin/approvals" className="font-semibold underline">Review now</Link></Notice>}
        </>
      )}
    </>
  );
}
