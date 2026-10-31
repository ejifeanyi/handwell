'use client';
import { useRequest } from '@/lib/useRequest';
import { usd } from '@/lib/format';
import { Stat } from '@/components/DashShell';
import { Card, Notice, Loading } from '@/components/ui';
import type { Stats } from '../types';

export default function Revenue() {
  const { data, error, busy } = useRequest<Stats>('/admin/stats', 'ADMIN');
  const days = data?.last30Days ?? [];
  const max = Math.max(10000, Math.ceil(Math.max(...days.map((d) => d.gmvCents)) / 10000) * 10000);
  return (
    <>
      <h1 className="text-h1">Revenue</h1>
      {error && <Notice tone="danger" icon="clock">{error}</Notice>}
      {busy ? <Loading /> : data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Booked value" value={usd(data.gmvCents)} />
            <Stat label="Handwell fees (15%)" value={usd(data.feesCents)} />
            <Stat label="Paid to pros (85%)" value={usd(data.gmvCents - data.feesCents)} />
          </div>
          <Card className="space-y-4 !p-7">
            <h2 className="text-h3">Booked value, last 30 days</h2>
            <div className="flex gap-3">
              <div className="flex h-52 flex-col justify-between pb-0.5 text-right text-xs text-ink-soft" aria-hidden="true">{[max, max * 0.5, 0].map((v) => <span key={v}>{usd(Math.round(v))}</span>)}</div>
              <div className="relative flex-1">
                <div className="absolute inset-0 flex flex-col justify-between" aria-hidden="true">{[0, 1, 2].map((i) => <div key={i} className="border-t border-dashed border-line" />)}</div>
                <div className="relative flex h-52 items-end gap-1" role="img" aria-label={`Bar chart of daily booked value over 30 days, peak ${usd(max)}`}>
                  {days.map((d) => <div key={d.date} title={`${d.date}: ${usd(d.gmvCents)}`} className="flex-1 rounded-t bg-pine/80 transition-colors hover:bg-clay" style={{ height: `${Math.max(2, (d.gmvCents / max) * 100)}%` }} />)}
                </div>
                <div className="mt-2 flex justify-between text-xs text-ink-soft"><span>{days[0]?.date}</span><span>{days.at(-1)?.date}</span></div>
              </div>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
