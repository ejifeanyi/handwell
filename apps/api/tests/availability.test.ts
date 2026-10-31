import { describe, expect, it } from 'vitest';
import { isSlotOpen, openSlots } from '../src/services/availability.js';
import { zonedToUtc } from '../src/services/time.js';

const tz = 'America/New_York';
// Mondays 9:00-13:00 local
const windows = [{ weekday: 1, startMinute: 540, endMinute: 780 }];
const now = new Date('2026-11-01T12:00:00Z'); // Sunday
const base = { windows, busy: [], timezone: tz, durationMin: 120, from: new Date('2026-11-02T00:00:00Z'), days: 7, now, leadHours: 12 };

describe('zonedToUtc', () => {
  it('converts New York wall time across the November DST change', () => {
    expect(zonedToUtc(2026, 11, 2, 540, tz).toISOString()).toBe('2026-11-02T14:00:00.000Z'); // EST (UTC-5)
    expect(zonedToUtc(2026, 10, 26, 540, tz).toISOString()).toBe('2026-10-26T13:00:00.000Z'); // EDT (UTC-4)
  });
});

describe('openSlots', () => {
  it('offers hourly starts that fit the service duration', () => {
    const slots = openSlots(base)['2026-11-02'];
    expect(slots).toEqual(['2026-11-02T14:00:00.000Z', '2026-11-02T15:00:00.000Z', '2026-11-02T16:00:00.000Z']);
  });
  it('skips times overlapping an existing booking', () => {
    const busy = [{ startsAt: new Date('2026-11-02T15:00:00Z'), endsAt: new Date('2026-11-02T17:00:00Z') }];
    expect(openSlots({ ...base, busy })['2026-11-02']).toBeUndefined();
  });
  it('respects the lead time', () => {
    const late = new Date('2026-11-02T10:00:00Z');
    expect(openSlots({ ...base, now: late })['2026-11-02']).toBeUndefined();
  });
  it('has nothing on days with no hours', () => {
    expect(Object.keys(openSlots(base))).toEqual(['2026-11-02']);
  });
  it('confirms a specific slot is open', () => {
    expect(isSlotOpen(base, new Date('2026-11-02T14:00:00Z'))).toBe(true);
    expect(isSlotOpen(base, new Date('2026-11-02T17:00:00Z'))).toBe(false);
  });
});
