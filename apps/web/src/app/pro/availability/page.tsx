'use client';
import { useEffect, useState } from 'react';
import { useAction, useRequest } from '@/lib/useRequest';
import { Button, Card, Notice, Loading } from '@/components/ui';
import { Select } from '@/components/Select';
import type { Window } from '../types';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const label = (m: number) => { const h = Math.floor(m / 60) % 24, mm = m % 60; return `${h % 12 || 12}:${String(mm).padStart(2, '0')} ${h < 12 || m === 1440 ? 'AM' : 'PM'}`; };
const times = Array.from({ length: 49 }, (_, i) => ({ value: String(i * 30), label: label(i * 30) }));

export default function Availability() {
  const { data, busy } = useRequest<{ pro: { windows: Window[]; timezone: string } }>('/pro/me', 'PRO');
  const [rows, setRows] = useState<Window[]>([]);
  const [saved, setSaved] = useState(false);
  const act = useAction();
  useEffect(() => { if (data) setRows(data.pro.windows.map(({ weekday, startMinute, endMinute }) => ({ weekday, startMinute, endMinute }))); }, [data]);

  const set = (i: number, patch: Partial<Window>) => { setSaved(false); setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r))); };
  async function save() { setSaved(!!(await act.run('save', '/pro/availability', 'PUT', { windows: rows }))); }

  if (busy) return <Loading />;
  return (
    <>
      <h1 className="text-h1">Availability</h1>
      <p className="text-ink-soft">Customers can book you during these hours ({data?.pro.timezone}). Existing bookings always block their time.</p>
      <Card className="space-y-3 !p-7">
        {rows.length === 0 && <p className="text-ink-soft">No hours set. Customers can’t book you until you add some.</p>}
        {rows.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3">
            <Select size="sm" className="w-40" ariaLabel="Day" value={String(r.weekday)} onChange={(v) => set(i, { weekday: Number(v) })} options={days.map((d, n) => ({ value: String(n), label: d }))} />
            <Select size="sm" className="w-32" ariaLabel="Start time" value={String(r.startMinute)} onChange={(v) => set(i, { startMinute: Number(v) })} options={times} />
            <span className="text-ink-soft">to</span>
            <Select size="sm" className="w-32" ariaLabel="End time" value={String(r.endMinute)} onChange={(v) => set(i, { endMinute: Number(v) })} options={times} />
            <Button size="sm" variant="secondary" onClick={() => { setSaved(false); setRows(rows.filter((_, j) => j !== i)); }}>Remove</Button>
          </div>
        ))}
        <Button size="sm" variant="secondary" onClick={() => { setSaved(false); setRows([...rows, { weekday: 1, startMinute: 540, endMinute: 1020 }]); }}>Add hours</Button>
      </Card>
      {act.error && <Notice tone="danger" icon="clock">{act.error}</Notice>}
      {saved && <Notice tone="success" icon="check">Availability saved.</Notice>}
      <Button onClick={save} disabled={act.pending === 'save' || rows.length === 0}>{act.pending === 'save' ? 'Saving…' : 'Save availability'}</Button>
    </>
  );
}
