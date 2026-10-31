'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export type NavItem = { href: string; label: string; icon: IconName };

export function DashShell({ title, nav, children, badge }: { title: string; nav: NavItem[]; children: ReactNode; badge?: Record<string, number> }) {
  const path = usePathname();
  return (
    <div className="mx-auto grid max-w-[1440px] gap-8 px-5 pb-24 pt-10 md:px-10 lg:grid-cols-[240px_1fr]">
      <nav aria-label={title} className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-28 lg:flex-col lg:self-start lg:overflow-visible">
        <p className="mb-2 hidden px-3 text-xs font-semibold uppercase tracking-wide text-ink-soft lg:block">{title}</p>
        {nav.map((n) => {
          const on = n.href === path || (n.href.split('/').length > 2 && path.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} aria-current={on ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold ${on ? 'bg-pine text-white' : 'text-ink hover:bg-sand'}`}>
              <Icon name={n.icon} size={20} />{n.label}
              {badge?.[n.href] ? <span className="ml-auto rounded-full bg-clay px-2 py-0.5 text-xs text-white">{badge[n.href]}</span> : null}
            </Link>
          );
        })}
      </nav>
      <div key={path} className="page-in min-w-0 space-y-6 pb-8">{children}</div>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border border-line bg-white p-5">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="font-display text-numeric text-pine">{value}</p>
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
