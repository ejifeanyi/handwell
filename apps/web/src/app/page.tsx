import Link from 'next/link';
import { api, safe } from '@/lib/api';
import type { Category, ProSummary } from '@/lib/types';
import { Icon, isIcon } from '@/components/Icon';
import { ProCard } from '@/components/ProCard';
import { Avatar, ButtonLink, Notice, Rating } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [cats, top] = await Promise.all([
    safe(api<{ categories: Category[] }>('/categories'), { categories: [] }),
    safe(api<{ items: ProSummary[] }>('/pros?sort=top'), { items: [] }),
  ]);
  const featured = top.items.slice(0, 4);

  return (
    <>
      <section className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 pb-20 pt-14 md:grid-cols-2 md:px-20 md:pt-[72px]">
        <div className="space-y-6">
          <h1 className="text-[44px] leading-[1.06] md:text-hero">Home help from pros your neighbors already trust</h1>
          <p className="max-w-xl text-lg text-ink-soft">Book vetted cleaners, plumbers, painters and more in under a minute. Clear prices, paid securely, and you only release payment when the job is done.</p>
          <form action="/pros" className="flex max-w-xl flex-col gap-2 rounded-[18px] border border-line bg-white p-2.5 shadow-card sm:flex-row sm:items-center">
            <label className="flex flex-1 items-center gap-3 px-4 py-2">
              <Icon name="search" size={22} className="text-pine" />
              <span className="flex-1"><span className="block text-xs text-ink-soft">What do you need?</span>
                <input name="q" placeholder="House cleaning" className="w-full bg-transparent font-medium placeholder:text-ink" /></span>
            </label>
            <span className="hidden h-10 w-px bg-line sm:block" />
            <label className="flex items-center gap-3 px-4 py-2">
              <Icon name="pin" size={22} className="text-pine" />
              <span><span className="block text-xs text-ink-soft">Where?</span>
                <input name="city" defaultValue="Columbus" className="w-32 bg-transparent font-medium" /></span>
            </label>
            <button className="rounded-xl bg-clay px-7 py-4 font-semibold text-white hover:bg-clay-dark">Find a pro</button>
          </form>
          <ul className="flex flex-wrap gap-x-7 gap-y-2 text-sm">
            {['Background-checked pros', 'Secure payments', 'Rated by real customers'].map((t) => <li key={t} className="flex items-center gap-2"><Icon name="check" size={18} className="text-pine" />{t}</li>)}
          </ul>
        </div>
        <div className="relative hidden h-[520px] overflow-hidden rounded-[32px] bg-pine md:block" aria-hidden="true">
          <div className="absolute -top-24 left-[220px] h-[420px] w-[420px] rounded-full bg-pine-dark" />
          <div className="absolute -left-20 top-[290px] h-[300px] w-[300px] rounded-full bg-sage-mid/35" />
          <div className="absolute left-[110px] top-20 w-[340px] space-y-4 rounded-3xl bg-white p-6 shadow-card">
            <div className="flex items-center gap-3.5"><Avatar name="Maya Okafor" /><div><p className="text-h4 font-bold">Maya Okafor</p><p className="text-sm text-ink-soft">Deep cleaning</p></div></div>
            <Rating value={4.9} count={128} />
            <p className="flex items-center gap-2 text-sm"><Icon name="calendar" size={18} className="text-pine" />Saturday, 9:00 AM is open</p>
            <span className="inline-block rounded-xl bg-clay px-[18px] py-2.5 text-sm font-semibold text-white">Book Maya</span>
          </div>
          <div className="absolute left-[60px] top-[400px] flex items-center gap-2.5 rounded-2xl bg-success-tint px-[18px] py-3.5 text-sm font-semibold text-success"><Icon name="shield" size={22} className="text-pine" />Payment held until your job is done</div>
        </div>
      </section>

      {cats.categories.length > 0 && (
        <section className="mx-auto max-w-[1440px] space-y-8 px-5 pb-24 md:px-20">
          <h2 className="text-h2">Whatever the job, someone nearby can do it</h2>
          <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
            {cats.categories.map((c) => (
              <li key={c.id}>
                <Link href={`/pros?category=${c.slug}`} className="flex h-full flex-col gap-4 rounded-card border border-line bg-white p-6 transition-shadow hover:shadow-card">
                  <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-sage text-pine">{isIcon(c.icon) && <Icon name={c.icon} size={26} />}</span>
                  <span><span className="block text-h4 font-bold">{c.name}</span><span className="text-sm text-ink-soft">{c.proCount} pros</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-sand">
        <div className="mx-auto max-w-[1440px] space-y-12 px-5 py-24 md:px-20">
          <h2 className="text-h2">Booked in three steps</h2>
          <ol className="grid gap-10 md:grid-cols-3">
            {[['Pick a pro', 'Compare ratings, reviews and fixed starting prices from pros in your area.'], ['Choose a time', 'See real availability and book the slot that suits you. No back-and-forth messages.'], ['Pay when it is done', 'Your card is charged securely at booking. The pro is paid once the job is complete.']].map(([h, d], i) => (
              <li key={h} className="space-y-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-clay text-h4 font-bold text-white">{i + 1}</span>
                <h3 className="font-display text-h3 text-ink">{h}</h3><p className="text-ink-soft">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] space-y-8 px-5 py-24 md:px-20">
        <div className="flex items-center justify-between"><h2 className="text-h2">Top-rated pros this week</h2><ButtonLink href="/pros" variant="secondary" size="sm">See all pros</ButtonLink></div>
        {featured.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{featured.map((p) => <ProCard key={p.id} pro={p} />)}</div>
        ) : (
          <Notice tone="sand" icon="clock">We could not load pros right now. Make sure the Handwell API is running, then refresh.</Notice>
        )}
      </section>

      <section className="bg-pine text-sage-mid">
        <div className="mx-auto grid max-w-[1440px] items-center gap-16 px-5 py-20 md:grid-cols-2 md:px-20">
          <div className="space-y-5">
            <h2 className="text-h2 !text-white">Every pro is checked before they appear here</h2>
            <p className="max-w-lg text-lg">We confirm identity, review work history and read every first-month review. Pros who fall below 4.5 stars are paused until we talk.</p>
            <ButtonLink href="/how-it-works#trust" variant="light">How we vet pros</ButtonLink>
          </div>
          <ul className="space-y-4">
            {[['Identity and background checks', 'Done before a pro can take a single booking.'], ['Held payments', 'Funds move to the pro only after you confirm the job.'], ['Honest reviews', 'Only customers who booked and paid can leave one.']].map(([h, d]) => (
              <li key={h} className="flex items-center gap-4 rounded-card bg-pine-dark p-5"><Icon name="shield" size={28} className="shrink-0" /><div><p className="text-h4 font-bold text-white">{h}</p><p className="text-sm">{d}</p></div></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1440px] flex-col items-center gap-5 px-5 py-24 text-center md:px-20">
        <h2 className="text-h1">Good at what you do? Get booked.</h2>
        <p className="max-w-2xl text-lg text-ink-soft">Set your prices, pick your hours and get paid straight to your bank. Handwell keeps 15% of each job and nothing else.</p>
        <ButtonLink href="/become-a-pro">Become a pro</ButtonLink>
      </section>
    </>
  );
}
