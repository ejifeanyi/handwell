'use client';
import { useMemo, useState } from 'react';
import { Icon } from './Icon';

const key = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const dows = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const dowNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Month calendar. Only dates in `available` can be picked; everything else is dimmed. */
export function Calendar({ available, value, onChange }: { available: string[]; value: string | null; onChange: (k: string) => void }) {
  const set = useMemo(() => new Set(available), [available]);
  const first = available[0] ?? key(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const last = available.at(-1) ?? first;
  const startMonth = Number(first.slice(0, 4)) * 12 + Number(first.slice(5, 7)) - 1;
  const endMonth = Number(last.slice(0, 4)) * 12 + Number(last.slice(5, 7)) - 1;
  const initial = value ? Number(value.slice(0, 4)) * 12 + Number(value.slice(5, 7)) - 1 : startMonth;
  const [cursor, setCursor] = useState(initial);
  const y = Math.floor(cursor / 12), m = cursor % 12;
  const lead = new Date(y, m, 1).getDay();
  const count = new Date(y, m + 1, 0).getDate();
  const now = new Date();
  const todayKey = key(now.getFullYear(), now.getMonth(), now.getDate());
  const cells = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold" aria-live="polite">{new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous month" disabled={cursor <= startMonth} onClick={() => setCursor(cursor - 1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand disabled:opacity-30 disabled:hover:bg-transparent"><Icon name="left" size={18} /></button>
          <button type="button" aria-label="Next month" disabled={cursor >= endMonth} onClick={() => setCursor(cursor + 1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand disabled:opacity-30 disabled:hover:bg-transparent"><Icon name="right" size={18} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center" role="grid" aria-label="Choose a day">
        {dows.map((d, i) => <span key={i} role="columnheader" aria-label={dowNames[i]} className="pb-1 text-xs font-semibold text-ink-soft">{d}</span>)}
        {cells.map((d, i) => {
          if (d === null) return <span key={`b${i}`} />;
          const k = key(y, m, d);
          const ok = set.has(k), on = k === value;
          return (
            <button key={k} type="button" disabled={!ok} onClick={() => onChange(k)} aria-pressed={on}
              aria-label={new Date(y, m, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + (ok ? '' : ', unavailable')}
              className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors ${on ? 'bg-pine font-bold text-white' : ok ? 'bg-sage/60 font-semibold text-pine hover:bg-sage' : 'text-ink-soft/50'}`}>
              {d}
              {k === todayKey && !on && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-clay" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-ink-soft"><span className="h-3 w-3 rounded-full bg-sage" aria-hidden="true" />Available</p>
    </div>
  );
}
