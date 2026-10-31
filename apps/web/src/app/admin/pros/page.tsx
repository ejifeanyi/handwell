'use client';
import { useAction, useRequest } from '@/lib/useRequest';
import { Button, Card, Notice, Tag, Loading } from '@/components/ui';
import type { AdminPro } from '../types';

export default function AllPros() {
  const { data, error, busy, reload } = useRequest<{ pros: AdminPro[] }>('/admin/pros', 'ADMIN');
  const act = useAction();
  async function set(id: string, kind: 'approve' | 'suspend') { if (await act.run(id + kind, `/admin/pros/${id}/${kind}`)) reload(); }
  return (
    <>
      <h1 className="text-h1">Pros</h1>
      {(error || act.error) && <Notice tone="danger" icon="clock">{error ?? act.error}</Notice>}
      {busy ? <Loading /> : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-line text-ink-soft"><tr>{['Name', 'Category', 'City', 'Status', ''].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{(data?.pros ?? []).map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-5 py-4"><p className="font-semibold">{p.user.name}</p><p className="text-xs text-ink-soft">{p.user.email}</p></td>
                <td className="px-5 py-4">{p.category.name}</td><td className="px-5 py-4">{p.city}</td>
                <td className="px-5 py-4"><Tag tone={p.status === 'APPROVED' ? 'success' : p.status === 'PENDING' ? 'amber' : 'danger'}>{p.status.toLowerCase()}</Tag></td>
                <td className="px-5 py-4">{p.status === 'APPROVED' ? <Button size="sm" variant="secondary" disabled={!!act.pending} onClick={() => set(p.id, 'suspend')}>Suspend</Button> : <Button size="sm" disabled={!!act.pending} onClick={() => set(p.id, 'approve')}>Approve</Button>}</td>
              </tr>))}</tbody>
          </table>
        </Card>
      )}
    </>
  );
}
