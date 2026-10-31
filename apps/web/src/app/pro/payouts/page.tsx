'use client';
import { useAction, useRequest } from '@/lib/useRequest';
import { usd } from '@/lib/format';
import { Stat } from '@/components/DashShell';
import { Button, Card, Notice, Loading } from '@/components/ui';

interface Earnings { paidOutCents: number; awaitingReleaseCents: number; upcomingCents: number; jobsCompleted: number; payoutsEnabled: boolean }

export default function Payouts() {
  const { data, busy } = useRequest<Earnings>('/pro/earnings', 'PRO');
  const act = useAction();
  async function connect() {
    const r = await act.run<{ url: string }>('connect', '/pro/connect/onboarding');
    if (r?.url) window.location.href = r.url;
  }
  if (busy) return <Loading />;
  return (
    <>
      <h1 className="text-h1">Payouts</h1>
      {data?.payoutsEnabled ? <Notice tone="success" icon="check">Payouts are on. Money from each completed job goes to your bank account through Stripe.</Notice> : (
        <Card className="space-y-4 !p-8">
          <h2 className="text-h3">Set up payouts</h2>
          <p className="text-ink-soft">Handwell uses Stripe to pay you securely. It takes about five minutes: confirm your identity and add a bank account.</p>
          <p className="text-sm text-ink-soft">In this demo, Stripe’s test mode accepts sample details. Use routing number 110000000 and account number 000123456789.</p>
          {act.error && <Notice tone="danger" icon="clock">{act.error}</Notice>}
          <Button disabled={act.pending === 'connect'} onClick={connect}>{act.pending === 'connect' ? 'Opening Stripe…' : 'Continue with Stripe'}</Button>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Paid out" value={usd(data?.paidOutCents ?? 0)} />
        <Stat label="Awaiting customer" value={usd(data?.awaitingReleaseCents ?? 0)} hint="Released when the customer confirms" />
        <Stat label="Upcoming" value={usd(data?.upcomingCents ?? 0)} />
      </div>
    </>
  );
}
