import Link from 'next/link';
import { api, safe } from '@/lib/api';
import type { Category, ProSummary } from '@/lib/types';
import { Chip, Notice } from '@/components/ui';
import { ProCard } from '@/components/ProCard';
import { Icon } from '@/components/Icon';
import { SortMenu } from '@/components/SortMenu';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Find a pro' };

type SP = Promise<{ category?: string; q?: string; city?: string; sort?: string; page?: string }>;

export default async function Pros({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ['category', 'q', 'city', 'sort', 'page'] as const) if (sp[k]) qs.set(k, sp[k]!);
  const [res, cats] = await Promise.all([
    safe(api<{ total: number; page: number; pageSize: number; items: ProSummary[] }>(`/pros?${qs}`), null),
    safe(api<{ categories: Category[] }>('/categories'), { categories: [] }),
  ]);
  const cat = cats.categories.find((c) => c.slug === sp.category);
  const city = sp.city || 'Columbus';
  const page = Number(sp.page ?? 1);
  const pages = res ? Math.max(1, Math.ceil(res.total / res.pageSize)) : 1;
  const href = (over: Record<string, string | undefined>) => {
    const n = new URLSearchParams(qs); for (const [k, v] of Object.entries(over)) v ? n.set(k, v) : n.delete(k); return `/pros?${n}`;
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 px-5 pb-20 pt-12 md:px-20">
      <div className="space-y-6">
        <p className="text-sm text-ink-soft"><Link href="/" className="hover:underline">Home</Link> / {cat?.name ?? 'All pros'}</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-h1">{sp.q ? `“${sp.q}” in ${city}` : cat ? `${cat.name} in ${city}` : `Home pros in ${city}`}</h1>
            <p className="text-lg text-ink-soft">{res ? `${res.total} vetted ${res.total === 1 ? 'pro' : 'pros'} available` : 'Loading pros'}</p>
          </div>
          <SortMenu value={sp.sort ?? 'top'} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Chip active={!sp.category} href={href({ category: undefined, page: undefined })}>All pros</Chip>
          {cats.categories.map((c) => <Chip key={c.id} active={sp.category === c.slug} href={href({ category: c.slug, page: undefined })}>{c.name}</Chip>)}
        </div>
      </div>

      {!res ? (
        <Notice tone="sand" icon="clock">We could not load pros right now. Make sure the Handwell API is running, then refresh.</Notice>
      ) : res.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-panel border border-line bg-white px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage text-pine"><Icon name="search" size={30} /></span>
          <h2 className="text-h3">No pros match that search</h2>
          <p className="text-ink-soft">Try a different service or clear your filters.</p>
          <Link href="/pros" className="font-semibold text-clay">Clear filters</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{res.items.map((p) => <ProCard key={p.id} pro={p} />)}</div>
      )}

      {pages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 && <Link href={href({ page: String(page - 1) })} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white" aria-label="Previous page"><Icon name="left" /></Link>}
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={href({ page: String(n) })} aria-current={n === page ? 'page' : undefined} className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold ${n === page ? 'bg-pine text-white' : 'border border-line bg-white'}`}>{n}</Link>
          ))}
          {page < pages && <Link href={href({ page: String(page + 1) })} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white" aria-label="Next page"><Icon name="right" /></Link>}
        </nav>
      )}
    </div>
  );
}
