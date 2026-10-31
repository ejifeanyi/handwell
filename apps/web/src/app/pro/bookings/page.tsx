'use client';
import { useAction, useRequest } from '@/lib/useRequest';
import { formatWhen, usdExact } from '@/lib/format';
import { Button, Card, Notice, StatusPill, Loading, Empty } from '@/components/ui';
import type { ProBooking } from '../types';

export default function ProBookings() {
  const { data, error, busy, reload } = useRequest<{ bookings: ProBooking[] }>('/pro/bookings', 'PRO');
  const act = useAction();
  async function complete(id: string) { if (await act.run(id, `/pro/bookings/${id}/complete`)) reload(); }
  const list = data?.bookings ?? [];
  return (
    <>
      <h1 className="text-h1">Bookings</h1>
      {(error || act.error) && <Notice tone="danger" icon="clock">{error ?? act.error}</Notice>}
      {busy ? <Loading /> : list.length === 0 ? <Empty icon="calendar" title="No bookings yet">Once customers book you, jobs show up here.</Empty> : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-ink-soft"><tr>{['When', 'Customer', 'Service', 'Address', 'Total', 'Status', ''].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-4">{formatWhen(b.startsAt)}</td><td className="px-5 py-4">{b.customer.name}</td><td className="px-5 py-4">{b.service.name}</td>
                  <td className="px-5 py-4">{b.address}</td><td className="px-5 py-4">{usdExact(b.priceCents)}</td>
                  <td className="px-5 py-4"><StatusPill status={b.status} /></td>
                  <td className="px-5 py-4">{b.status === 'CONFIRMED' && new Date(b.startsAt) <= new Date() && <Button size="sm" disabled={!!act.pending} onClick={() => complete(b.id)}>Mark done</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
