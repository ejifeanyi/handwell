'use client';
import { useAction, useRequest } from '@/lib/useRequest';
import { formatWhen, usdExact } from '@/lib/format';
import { Button, Card, Notice, StatusPill, Loading } from '@/components/ui';
import type { AdminBooking } from '../types';

export default function AdminBookings() {
  const { data, error, busy, reload } = useRequest<{ bookings: AdminBooking[] }>('/admin/bookings', 'ADMIN');
  const act = useAction();
  async function release(id: string) { if (await act.run(id, `/admin/bookings/${id}/release`)) reload(); }
  return (
    <>
      <h1 className="text-h1">Bookings</h1>
      {(error || act.error) && <Notice tone="danger" icon="clock">{error ?? act.error}</Notice>}
      {busy ? <Loading /> : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-line text-ink-soft"><tr>{['When', 'Customer', 'Pro', 'Service', 'Total', 'Fee', 'Status', 'Payout'].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{(data?.bookings ?? []).map((b) => (
              <tr key={b.id} className="border-b border-line last:border-0">
                <td className="px-5 py-4">{formatWhen(b.startsAt)}</td><td className="px-5 py-4">{b.customer.name}</td><td className="px-5 py-4">{b.pro.user.name}</td><td className="px-5 py-4">{b.service.name}</td>
                <td className="px-5 py-4">{usdExact(b.priceCents)}</td><td className="px-5 py-4">{usdExact(b.feeCents)}</td><td className="px-5 py-4"><StatusPill status={b.status} /></td>
                <td className="px-5 py-4">{b.payoutTransferId ? 'Released' : b.status === 'COMPLETED' ? <Button size="sm" disabled={!!act.pending} onClick={() => release(b.id)}>Release</Button> : '—'}</td>
              </tr>))}</tbody>
          </table>
        </Card>
      )}
    </>
  );
}
