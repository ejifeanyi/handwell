'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAction, useRequest } from '@/lib/useRequest';
import type { Booking } from '@/lib/types';
import { Button, Card, Notice, TextArea, Loading } from '@/components/ui';
import { Icon } from '@/components/Icon';

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, busy } = useRequest<{ booking: Booking }>(`/bookings/${id}`);
  const act = useAction();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { act.setError('Choose a star rating'); return; }
    if (await act.run('review', `/bookings/${id}/review`, 'POST', { rating, body })) router.push('/bookings');
  }
  if (busy || !data) return <Loading />;
  const b = data.booking;
  return (
    <form onSubmit={submit} className="mx-auto max-w-[620px] space-y-6 px-5 pb-24 pt-14">
      <h1 className="text-h1">How was {b.pro.user.name.split(' ')[0]}?</h1>
      <p className="text-ink-soft">{b.service.name}. Your review helps other neighbors choose.</p>
      <Card className="space-y-6 !p-8">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Your rating</legend>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`} aria-pressed={rating === n}>
                <Icon name="star" size={36} className={n <= rating ? 'text-marigold' : 'text-line'} />
              </button>
            ))}
          </div>
        </fieldset>
        <TextArea label="Tell us about it" required minLength={10} placeholder="On time, careful and fair on price…" value={body} onChange={(e) => setBody(e.target.value)} />
      </Card>
      {act.error && <Notice tone="danger" icon="clock">{act.error}</Notice>}
      <Button disabled={act.pending === 'review'}>{act.pending === 'review' ? 'Posting…' : 'Post review'}</Button>
    </form>
  );
}
