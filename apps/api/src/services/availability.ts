import { localDate, zonedToUtc } from './time.js';

export type Window = { weekday: number; startMinute: number; endMinute: number };
export type Busy = { startsAt: Date; endsAt: Date };

export interface SlotOptions {
  windows: Window[];
  busy: Busy[];
  timezone: string;
  durationMin: number;
  from: Date;
  days: number;
  now?: Date;
  /** Customers can't book closer than this to now. */
  leadHours?: number;
  stepMin?: number;
}

/** Open start times (UTC ISO strings) for a pro, grouped by their local date (YYYY-MM-DD). */
export function openSlots(o: SlotOptions): Record<string, string[]> {
  const now = o.now ?? new Date();
  const earliest = now.getTime() + (o.leadHours ?? 12) * 3_600_000;
  const step = o.stepMin ?? 60;
  const out: Record<string, string[]> = {};
  const start = localDate(o.from.getTime(), o.timezone);

  for (let i = 0; i < o.days; i++) {
    // Walk calendar days using noon UTC to avoid DST edge cases, then read the local date.
    const probe = Date.UTC(start.y, start.m - 1, start.d + i, 12);
    const day = localDate(probe, o.timezone);
    const key = `${day.y}-${String(day.m).padStart(2, '0')}-${String(day.d).padStart(2, '0')}`;
    const slots: string[] = [];
    for (const w of o.windows.filter((w) => w.weekday === day.weekday)) {
      for (let min = w.startMinute; min + o.durationMin <= w.endMinute; min += step) {
        const s = zonedToUtc(day.y, day.m, day.d, min, o.timezone);
        const e = new Date(s.getTime() + o.durationMin * 60_000);
        if (s.getTime() < earliest) continue;
        if (o.busy.some((b) => s < b.endsAt && e > b.startsAt)) continue;
        slots.push(s.toISOString());
      }
    }
    if (slots.length) out[key] = slots.sort();
  }
  return out;
}

export function isSlotOpen(o: SlotOptions, startsAt: Date): boolean {
  const day = localDate(startsAt.getTime(), o.timezone);
  const from = zonedToUtc(day.y, day.m, day.d, 0, o.timezone);
  const slots = openSlots({ ...o, from, days: 1 });
  return Object.values(slots).some((list) => list.includes(startsAt.toISOString()));
}
