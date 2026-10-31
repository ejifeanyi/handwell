'use client';
import { useAction, useRequest } from '@/lib/useRequest';
import { usd } from '@/lib/format';
import { Button, Card, Notice, Loading, Empty } from '@/components/ui';
import type { AdminPro } from '../types';

export default function Approvals() {
  const { data, error, busy, reload } = useRequest<{ pros: AdminPro[] }>('/admin/pros?status=PENDING', 'ADMIN');
  const act = useAction();
  async function decide(id: string, kind: 'approve' | 'suspend') { if (await act.run(id + kind, `/admin/pros/${id}/${kind}`)) reload(); }
  const list = data?.pros ?? [];
  return (
    <>
      <h1 className="text-h1">Pro approvals</h1>
      {(error || act.error) && <Notice tone="danger" icon="clock">{error ?? act.error}</Notice>}
      {busy ? <Loading /> : list.length === 0 ? <Empty icon="inbox" title="All caught up">New pro applications show up here for review.</Empty> : list.map((p) => (
        <Card key={p.id} className="space-y-4 !p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-h3">{p.user.name}</h2><p className="text-sm text-ink-soft">{p.category.name} · {p.city} · {p.yearsExperience} yrs · {p.user.email}</p></div>
            <div className="flex gap-2"><Button size="sm" disabled={!!act.pending} onClick={() => decide(p.id, 'approve')}>Approve</Button><Button size="sm" variant="secondary" disabled={!!act.pending} onClick={() => decide(p.id, 'suspend')}>Reject</Button></div>
          </div>
          <p className="font-semibold">{p.headline}</p><p className="text-ink-soft">{p.bio}</p>
          <p className="text-sm">{p.services.map((s) => `${s.name} ${usd(s.priceCents)}`).join(' · ')}</p>
        </Card>
      ))}
    </>
  );
}
