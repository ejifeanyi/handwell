import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { ProDetail, Review } from '@/lib/types';
import { formatDuration, initials, usd } from '@/lib/format';
import { BookingCard } from '@/components/BookingCard';
import { Icon } from '@/components/Icon';
import { Avatar, Card, Rating, Stars } from '@/components/ui';

export const dynamic = 'force-dynamic';

async function load(slug: string) {
  try { return await api<{ pro: ProDetail; reviews: Review[] }>(`/pros/${slug}`); }
  catch (e) { if (e instanceof ApiError && e.status === 404) notFound(); throw e; }
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try { const { pro } = await api<{ pro: ProDetail }>(`/pros/${slug}`); return { title: `${pro.name}, ${pro.category.name}` }; } catch { return { title: 'Pro profile' }; }
}

export default async function ProProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { pro, reviews } = await load(slug);
  const first = pro.name.split(' ')[0];

  return (
    <div className="mx-auto grid max-w-[1440px] items-start gap-x-12 gap-y-7 px-5 pb-24 pt-8 md:px-20 md:pt-10 lg:grid-cols-[1fr_400px]">
      <div className="space-y-7 lg:col-start-1">
        <p className="text-sm text-ink-soft"><Link href="/" className="hover:underline">Home</Link> / <Link href={`/pros?category=${pro.category.slug}`} className="hover:underline">{pro.category.name}</Link> / {pro.name}</p>

        <Card className="flex flex-col items-start gap-5 !p-6 sm:flex-row sm:items-center sm:gap-7 md:!p-8">
          <span className="flex h-24 w-24 shrink-0 sm:h-[140px] sm:w-[140px] items-center justify-center rounded-full bg-sage font-display text-h2 text-pine/45 sm:text-h1" aria-hidden="true">{initials(pro.name)}</span>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-h2">{pro.name}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage py-1.5 pl-2.5 pr-3 text-xs text-pine"><Icon name="shield" size={16} />Background checked</span>
            </div>
            <p className="max-w-xl text-lg text-ink-soft">{pro.headline}</p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm">
              <Rating value={pro.ratingAvg} count={pro.reviewCount} />
              <span className="flex items-center gap-2"><Icon name="pin" size={18} className="text-ink-soft" />{pro.city}, OH</span>
              <span className="flex items-center gap-2"><Icon name="briefcase" size={18} className="text-ink-soft" />{pro.yearsExperience} years experience</span>
            </div>
          </div>
        </Card>

      </div>

      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <BookingCard slug={pro.slug} proName={pro.name} services={pro.services} />
      </div>

      <div className="space-y-7 lg:col-start-1 lg:row-start-2">
        <Card className="space-y-3.5 !p-6 md:!p-8"><h2 className="text-h3">About {first}</h2><p>{pro.bio}</p></Card>

        <Card className="!p-6 md:!p-8">
          <h2 className="mb-2 text-h3">Services and prices</h2>
          <ul>
            {pro.services.map((s) => (
              <li key={s.id} className="flex items-center gap-4 border-t border-line py-5 first:border-t-0 sm:gap-6">
                <div className="flex-1 space-y-1"><h3 className="font-sans text-h4 text-ink">{s.name}</h3><p className="text-sm text-ink-soft">{s.description}</p><p className="text-xs text-ink-soft">{formatDuration(s.durationMin)}</p></div>
                <span className="text-h4 font-bold">{usd(s.priceCents)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-6 !p-6 md:!p-8">
          <h2 className="text-h3">Reviews</h2>
          {pro.reviewCount ? (
            <div className="flex items-center gap-6"><span className="font-display text-numeric text-pine">{pro.ratingAvg.toFixed(1)}</span><div className="space-y-1"><Stars value={pro.ratingAvg} size={20} /><p className="text-sm text-ink-soft">Based on {pro.reviewCount} reviews from verified bookings</p></div></div>
          ) : <p className="text-ink-soft">{first} is new on Handwell and has no reviews yet.</p>}
          <ul>
            {reviews.map((r) => (
              <li key={r.id} className="space-y-2.5 border-t border-line py-5">
                <div className="flex items-center gap-3"><Avatar name={r.author} size={40} /><div><p className="text-sm font-semibold">{r.author}</p><p className="text-xs text-ink-soft">{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p></div></div>
                <Stars value={r.rating} /><p>{r.body}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

    </div>
  );
}
