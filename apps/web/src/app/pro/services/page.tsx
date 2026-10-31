'use client';
import { useEffect, useState } from 'react';
import { useAction, useRequest } from '@/lib/useRequest';
import { Button, Card, Field, Notice, Loading } from '@/components/ui';
import type { MyService } from '../types';

export default function Services() {
  const { data, busy } = useRequest<{ pro: { services: (MyService & { active: boolean })[] } }>('/pro/me', 'PRO');
  const [rows, setRows] = useState<MyService[]>([]);
  const [saved, setSaved] = useState(false);
  const act = useAction();
  useEffect(() => { if (data) setRows(data.pro.services.filter((s) => s.active).map(({ id, name, description, priceCents, durationMin }) => ({ id, name, description, priceCents, durationMin }))); }, [data]);
  const set = (i: number, patch: Partial<MyService>) => { setSaved(false); setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r))); };
  async function save() { setSaved(!!(await act.run('save', '/pro/services', 'PUT', { services: rows }))); }

  if (busy) return <Loading />;
  return (
    <>
      <h1 className="text-h1">Services</h1>
      <p className="text-ink-soft">Fixed prices customers see on your profile. You keep 85% of each job.</p>
      {rows.map((r, i) => (
        <Card key={r.id ?? `new${i}`} className="grid gap-4 !p-6 md:grid-cols-2">
          <Field label="Name" value={r.name} onChange={(e) => set(i, { name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (USD)" type="number" min={10} step={1} value={r.priceCents / 100} onChange={(e) => set(i, { priceCents: Math.round(Number(e.target.value) * 100) })} />
            <Field label="Minutes" type="number" min={30} step={15} value={r.durationMin} onChange={(e) => set(i, { durationMin: Number(e.target.value) })} />
          </div>
          <Field className="md:col-span-2" label="Description" value={r.description} onChange={(e) => set(i, { description: e.target.value })} />
          <div className="md:col-span-2"><Button size="sm" variant="secondary" disabled={rows.length === 1} onClick={() => { setSaved(false); setRows(rows.filter((_, j) => j !== i)); }}>Remove service</Button></div>
        </Card>
      ))}
      <Button variant="secondary" size="sm" disabled={rows.length >= 8} onClick={() => { setSaved(false); setRows([...rows, { name: '', description: '', priceCents: 10000, durationMin: 60 }]); }}>Add a service</Button>
      {act.error && <Notice tone="danger" icon="clock">{act.error}</Notice>}
      {saved && <Notice tone="success" icon="check">Services saved.</Notice>}
      <div><Button onClick={save} disabled={act.pending === 'save'}>{act.pending === 'save' ? 'Saving…' : 'Save services'}</Button></div>
    </>
  );
}
