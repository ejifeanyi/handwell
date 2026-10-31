export const usd = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);

export const usdExact = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

export function formatWhen(iso: string, tz = 'America/New_York') {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    .format(new Date(iso)).replace(/, (\d)/, ' at $1');
}
export const formatTime = (iso: string, tz = 'America/New_York') =>
  new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(new Date(iso));

export function formatDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = min / 60;
  return Number.isInteger(h) ? `${h} ${h === 1 ? 'hour' : 'hours'}` : `${h.toFixed(1)} hours`;
}
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');
