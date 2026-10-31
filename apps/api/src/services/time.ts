/** Offset (ms) of a IANA zone from UTC at the given instant. */
export function tzOffsetMs(ts: number, tz: string): number {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p: Record<string, number> = {};
  for (const part of f.formatToParts(new Date(ts))) if (part.type !== 'literal') p[part.type] = Number(part.value);
  const asUtc = Date.UTC(p.year!, p.month! - 1, p.day!, p.hour!, p.minute!, p.second!);
  return asUtc - Math.floor(ts / 1000) * 1000;
}

/** Convert a wall-clock time in `tz` (Y-M-D plus minutes after midnight) to a UTC Date. DST-safe. */
export function zonedToUtc(y: number, m: number, d: number, minuteOfDay: number, tz: string): Date {
  const guess = Date.UTC(y, m - 1, d, 0, minuteOfDay);
  let ts = guess - tzOffsetMs(guess, tz);
  ts = guess - tzOffsetMs(ts, tz);
  return new Date(ts);
}

/** Local calendar date (y, m, d, weekday) of an instant in `tz`. */
export function localDate(ts: number, tz: string) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' });
  const p: Record<string, string> = {};
  for (const part of f.formatToParts(new Date(ts))) p[part.type] = part.value;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return { y: Number(p.year), m: Number(p.month), d: Number(p.day), weekday: days.indexOf(p.weekday!) };
}
