'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './ui';

const cols = [
  ['Customers', [['Find a pro', '/pros'], ['How it works', '/how-it-works'], ['Pricing and fees', '/how-it-works#fees'], ['Help center', '/how-it-works#faq']]],
  ['Pros', [['Become a pro', '/become-a-pro'], ['Pro dashboard', '/pro'], ['Payouts', '/pro/payouts'], ['Pro resources', '/how-it-works']]],
  ['Company', [['About Handwell', '/how-it-works'], ['Trust and safety', '/how-it-works#trust'], ['Terms', '/how-it-works'], ['Privacy', '/how-it-works']]],
] as const;

export function Footer() {
  const path = usePathname();
  if (/^\/(sign-in|sign-up|admin)/.test(path) || path === '/pro' || path.startsWith('/pro/')) return null;
  return (
    <footer className="bg-pine-dark text-sage-mid">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-16 md:px-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-12">
          <div className="col-span-2 space-y-3.5 md:col-span-1">
            <Logo light />
            <p className="max-w-xs">Trusted home help, booked in a minute.</p>
          </div>
          {cols.map(([title, links]) => (
            <div key={title} className="space-y-3">
              <h2 className="font-sans text-sm font-semibold text-white">{title}</h2>
              <ul className="space-y-3 text-sm">
                {links.map(([label, href]) => <li key={label}><Link href={href} className="hover:text-white">{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-white/15 pt-6 text-sm">
          © 2026 Handwell. A demo project by Ifeanyi Emmanuel. Not a real business: no real bookings or payments are made.
        </div>
      </div>
    </footer>
  );
}
