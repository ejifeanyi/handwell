import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';
import { Icon } from './Icon';
import { initials } from '@/lib/format';

const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';
const variants = {
  primary: 'bg-clay text-white hover:bg-clay-dark',
  secondary: 'border-[1.5px] border-pine text-pine hover:bg-sage',
  light: 'bg-white text-pine hover:bg-sage',
  pine: 'bg-pine text-white hover:bg-pine-dark',
};
const sizes = { md: 'px-7 py-4 text-base', sm: 'px-[18px] py-2.5 text-sm' };
type Variant = keyof typeof variants;
type Size = keyof typeof sizes;
const cls = (v: Variant, s: Size, extra = '') => `${base} ${variants[v]} ${sizes[s]} ${extra}`;

export function Button({ variant = 'primary', size = 'md', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={cls(variant, size, className)} {...p} />;
}
export function ButtonLink({ variant = 'primary', size = 'md', className = '', ...p }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={cls(variant, size, className)} {...p} />;
}

export function Chip({ children, active, href }: { children: ReactNode; active?: boolean; href?: string }) {
  const c = `inline-flex items-center rounded-full px-3.5 py-2 text-sm font-semibold ${active ? 'bg-pine text-white' : 'border-[1.5px] border-line bg-white text-ink hover:border-pine'}`;
  return href ? <Link href={href} className={c}>{children}</Link> : <span className={c}>{children}</span>;
}

const pills = {
  PENDING_PAYMENT: ['Pending', 'bg-amber-tint text-amber-ink'],
  CONFIRMED: ['Confirmed', 'bg-sage text-pine'],
  COMPLETED: ['Completed', 'bg-success-tint text-success'],
  CANCELLED: ['Cancelled', 'bg-danger-tint text-danger'],
} as const;
export function StatusPill({ status }: { status: keyof typeof pills }) {
  const [label, c] = pills[status];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${c}`}>{label}</span>;
}
export function Tag({ children, tone = 'sage' }: { children: ReactNode; tone?: 'sage' | 'amber' | 'success' | 'danger' }) {
  const t = { sage: 'bg-sage text-pine', amber: 'bg-amber-tint text-amber-ink', success: 'bg-success-tint text-success', danger: 'bg-danger-tint text-danger' }[tone];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${t}`}>{children}</span>;
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-sage-mid font-semibold text-pine" style={{ width: size, height: size, fontSize: size * 0.32 }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-marigold" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= Math.round(value) ? '' : 'opacity-25'}><Icon name="star" size={size} /></span>)}
    </span>
  );
}
export function Rating({ value, count }: { value: number; count: number }) {
  if (!count) return <span className="text-sm text-ink-soft">New on Handwell</span>;
  return <span className="inline-flex items-center gap-1.5"><Icon name="star" size={16} className="text-marigold" /><span className="text-sm font-semibold">{value.toFixed(1)}</span><span className="text-sm text-ink-soft">({count})</span></span>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-panel border border-line bg-white p-7 shadow-soft ${className}`}>{children}</div>;
}

export function Field({ label, error, className = '', ...p }: { label: string; error?: string } & ComponentProps<'input'>) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input className={`w-full rounded-xl border-[1.5px] bg-white px-4 py-3.5 text-base placeholder:text-ink-soft ${error ? 'border-danger' : 'border-line focus:border-pine'}`} {...p} />
      {error && <span className="mt-1.5 block text-sm text-danger">{error}</span>}
    </label>
  );
}
export function TextArea({ label, ...p }: { label: string } & ComponentProps<'textarea'>) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <textarea className="min-h-28 w-full rounded-xl border-[1.5px] border-line bg-white px-4 py-3.5 text-base placeholder:text-ink-soft focus:border-pine" {...p} />
    </label>
  );
}

export function Notice({ tone = 'sage', icon = 'shield', children }: { tone?: 'sage' | 'success' | 'sand' | 'danger' | 'amber'; icon?: Parameters<typeof Icon>[0]['name']; children: ReactNode }) {
  const t = { sage: 'bg-sage text-pine', success: 'bg-success-tint text-success', sand: 'bg-sand text-ink', danger: 'bg-danger-tint text-danger', amber: 'bg-amber-tint text-amber-ink' }[tone];
  return <div className={`flex items-start gap-3 rounded-2xl p-4 text-sm ${t}`}><Icon name={icon} size={20} className="mt-0.5 shrink-0" /><div>{children}</div></div>;
}

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Handwell home">
      <span className={`flex h-9 w-9 items-center justify-center rounded-[11px] text-white ${light ? 'bg-clay' : 'bg-pine'}`}><Icon name="house" size={20} /></span>
      <span className={`font-display text-h3 ${light ? 'text-white' : 'text-pine'}`}>Handwell</span>
    </Link>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} aria-hidden="true" />;
}
/** Placeholder shown while a page loads its data. */
export function Loading({ rows = 3, label = 'Loading' }: { rows?: number; label?: string }) {
  return (
    <div className="space-y-4" role="status" aria-label={label}>
      <Skeleton className="h-10 w-56" />
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-28 w-full !rounded-panel" />)}
    </div>
  );
}
export function Empty({ icon, title, children, action }: { icon: Parameters<typeof Icon>[0]['name']; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-panel border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage text-pine"><Icon name={icon} size={26} /></span>
      <h2 className="font-sans text-h4 text-ink">{title}</h2>
      {children && <p className="max-w-sm text-ink-soft">{children}</p>}
      {action}
    </div>
  );
}
