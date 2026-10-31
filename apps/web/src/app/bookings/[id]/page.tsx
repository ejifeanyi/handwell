'use client';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRequest } from '@/lib/useRequest';
import { formatWhen, usdExact } from '@/lib/format';
import type { Booking } from '@/lib/types';
import { ButtonLink, Card, Notice, StatusPill, Loading } from '@/components/ui';
import { Icon } from '@/components/Icon';

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const paid = useSearchParams().get('paid') === '1';
  const { data, error, busy, reload } = useRequest<{ booking: Booking }>(`/bookings/${id}`);
  const status = data?.booking.status;

  // The Stripe webhook may land a moment after the redirect, so poll briefly while still pending.
  useEffect(() => {
    if (!paid || status !== 'PENDING_PAYMENT') return;
    const t = setInterval(reload, 2000);
    return () => clearInterval(t);
  }, [paid, status, reload]);

  if (busy) return <Loading />;
  if (error || !data) return <div className="mx-auto max-w-xl p-20"><Notice tone="danger" icon="clock">{error ?? 'Booking not found.'}</Notice></div>;
  const b = data.booking;
  const confirmed = b.status === 'CONFIRMED' || b.status === 'COMPLETED';

  return (
    <div className="mx-auto max-w-[640px] space-y-6 px-5 pb-24 pt-16 text-center">
      <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${confirmed ? 'bg-success-tint text-success' : 'bg-amber-tint text-amber-ink'}`}><Icon name={confirmed ? 'check' : 'clock'} size={32} /></span>
      <h1 className="text-h1">{confirmed ? 'You’re booked' : b.status === 'CANCELLED' ? 'Booking cancelled' : 'Finishing your payment…'}</h1>
      {b.status === 'PENDING_PAYMENT' && <p className="text-ink-soft" role="status">We’re waiting for Stripe to confirm your payment. This usually takes a few seconds.</p>}
      <Card className="space-y-4 text-left !p-7">
        <div className="flex items-center justify-between"><h2 className="text-h4">{b.service.name}</h2><StatusPill status={b.status} /></div>
        <p>with {b.pro.user.name}</p>
        <p className="flex items-center gap-2 text-sm"><Icon name="calendar" size={18} className="text-ink-soft" />{formatWhen(b.startsAt, b.pro.timezone)}</p>
        <p className="flex items-center gap-2 text-sm"><Icon name="pin" size={18} className="text-ink-soft" />{b.address}</p>
        <p className="flex justify-between border-t border-line pt-4 font-bold"><span>Paid</span><span>{usdExact(b.priceCents)}</span></p>
      </Card>
      {b.status === 'CONFIRMED' && <Notice tone="sage" icon="shield">Your payment is held by Handwell. Once the job is done, confirm it on your bookings page to release payment to {b.pro.user.name.split(' ')[0]}.</Notice>}
      <div className="flex justify-center gap-3"><ButtonLink href="/bookings">My bookings</ButtonLink><ButtonLink href="/" variant="secondary">Back home</ButtonLink></div>
      <p className="text-sm text-ink-soft"><Link href="/how-it-works#faq" className="underline">How payment protection works</Link></p>
    </div>
  );
}
