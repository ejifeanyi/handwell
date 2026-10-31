import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { Logo } from './ui';

export function AuthShell({ title, blurb, children, side = 'Home help you can count on' }: { title: string; blurb: string; children: ReactNode; side?: string }) {
  return (
    <div className="grid min-h-screen md:grid-cols-[620px_1fr]">
      <div className="hidden flex-col justify-between bg-pine p-16 md:flex">
        <Logo light />
        <div className="space-y-6">
          <h2 className="max-w-md text-h1 !text-white">{side}</h2>
          <ul className="space-y-3 text-lg text-sage-mid">
            {['Every pro is background checked', 'Your payment is held until the job is done', 'Real reviews from real bookings'].map((t) => <li key={t} className="flex items-center gap-3"><Icon name="check" size={20} />{t}</li>)}
          </ul>
        </div>
        <p className="max-w-md text-sm text-sage-mid">A demo project by Ifeanyi Emmanuel. No real bookings or payments are made.</p>
      </div>
      <div className="flex items-center justify-center px-5 py-10 md:py-14">
        <div className="w-full max-w-[420px] space-y-5"><div className="mb-6 md:hidden"><Logo /></div>
          <h1 className="text-h1">{title}</h1><p className="text-ink-soft">{blurb}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
