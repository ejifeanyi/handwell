import Link from 'next/link';
import type { ProSummary } from '@/lib/types';
import { initials, usd } from '@/lib/format';
import { Icon } from './Icon';
import { Rating } from './ui';

const tints = ['bg-sage', 'bg-amber-tint', 'bg-clay-tint', 'bg-success-tint', 'bg-sand'];
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function ProCard({ pro }: { pro: ProSummary }) {
  const tint = tints[hash(pro.slug) % tints.length];
  return (
    <Link href={`/pros/${pro.slug}`} className="group flex overflow-hidden rounded-card border border-line bg-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card sm:flex-col">
      <div className={`relative flex w-28 shrink-0 items-center justify-center sm:h-36 sm:w-full ${tint}`} aria-hidden="true">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 font-display text-h3 text-pine shadow-soft transition-transform duration-200 group-hover:scale-105 sm:h-20 sm:w-20">{initials(pro.name)}</span>
        <span className="absolute left-3 top-3 hidden rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-pine sm:inline-flex">{pro.category.name}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5 sm:pt-4">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-sans text-h4 text-ink">{pro.name}</h3>
          <Icon name="shield" size={18} className="shrink-0 text-pine" aria-label="Background checked" />
        </div>
        <p className="line-clamp-2 text-sm text-ink-soft">{pro.headline}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <Rating value={pro.ratingAvg} count={pro.reviewCount} />
          <span className="flex items-center gap-1 text-ink-soft"><Icon name="pin" size={14} />{pro.city}</span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
          <span className="text-sm text-ink-soft">{pro.fromPriceCents ? <>From <span className="text-h4 font-bold text-ink">{usd(pro.fromPriceCents)}</span></> : 'Price on request'}</span>
          <span className="rounded-xl bg-clay px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-clay-dark">Book</span>
        </div>
      </div>
    </Link>
  );
}
