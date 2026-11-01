'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import type { Role } from '@/lib/types';
import { Avatar, ButtonLink, Logo } from './ui';
import { Icon } from './Icon';

const navFor = (role: Role | null): [string, string][] => {
  if (role === 'PRO') return [['/pro', 'Dashboard'], ['/pro/bookings', 'Bookings'], ['/pro/payouts', 'Payouts']];
  if (role === 'ADMIN') return [['/admin', 'Overview'], ['/admin/approvals', 'Approvals'], ['/admin/bookings', 'Bookings']];
  if (role === 'CUSTOMER') return [['/pros', 'Find a pro'], ['/bookings', 'My bookings'], ['/how-it-works', 'Help']];
  return [['/pros', 'Find a pro'], ['/how-it-works', 'How it works'], ['/become-a-pro', 'Become a pro']];
};

export function Header() {
  const { user, loading, signOut } = useAuth();
  const path = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setMenu(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); setMobile(false); } };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, []);
  useEffect(() => { setMenu(false); setMobile(false); }, [path]);

  if (path.startsWith('/sign-in') || path.startsWith('/sign-up')) return null;

  const items = navFor(user?.role ?? null);
  const active = (href: string) => path === href || (href !== '/pro' && href !== '/admin' && path.startsWith(href + '/'));
  const linkCls = (href: string) => `relative py-2 text-[15px] transition-colors ${active(href) ? 'font-semibold text-pine after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-clay' : 'font-medium text-ink hover:text-pine'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-linen/90 backdrop-blur supports-[backdrop-filter]:bg-linen/80">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-5 md:h-20 md:px-20">
        <Logo />
        <nav className="hidden items-center gap-10 md:flex" aria-label="Main">
          {items.map(([href, label]) => <Link key={href} href={href} className={linkCls(href)} aria-current={active(href) ? 'page' : undefined}>{label}</Link>)}
        </nav>
        <div className="flex items-center gap-3 sm:gap-5">
          {loading ? <span className="h-10 w-24" /> : user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setMenu((o) => !o)} aria-expanded={menu} aria-haspopup="menu" className="flex items-center gap-2.5 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-3 transition-shadow hover:shadow-soft">
                <Avatar name={user.name} size={32} />
                <span className="hidden text-sm font-semibold sm:inline">{user.name}</span>
                <Icon name="chevron" size={18} className={`text-ink-soft transition-transform ${menu ? 'rotate-180' : ''}`} />
              </button>
              {menu && (
                <div role="menu" className="page-in absolute right-0 top-14 z-20 w-60 rounded-2xl border border-line bg-white p-2 shadow-card">
                  <div className="border-b border-line px-3 pb-3 pt-2"><p className="text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-ink-soft">{user.email}</p></div>
                  <div className="pt-2">
                    <MenuLink href="/account">Account</MenuLink>
                    {user.role === 'CUSTOMER' && <MenuLink href="/bookings">My bookings</MenuLink>}
                    {user.role === 'PRO' && <><MenuLink href="/pro">Pro dashboard</MenuLink><MenuLink href="/bookings">My bookings</MenuLink></>}
                    {user.role === 'ADMIN' && <MenuLink href="/admin">Admin dashboard</MenuLink>}
                    {user.role === 'CUSTOMER' && <MenuLink href="/become-a-pro">Become a pro</MenuLink>}
                    <button role="menuitem" onClick={async () => { await signOut(); router.push('/'); }} className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger-tint">Sign out</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="hidden font-medium hover:text-pine sm:inline">Sign in</Link>
              <ButtonLink href="/sign-up" size="sm">Sign up</ButtonLink>
            </>
          )}
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white md:hidden" aria-label={mobile ? 'Close menu' : 'Open menu'} aria-expanded={mobile} aria-controls="mobile-nav" onClick={() => setMobile((o) => !o)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">{mobile ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
          </button>
        </div>
      </div>
      {mobile && (
        <nav id="mobile-nav" aria-label="Mobile" className="page-in border-t border-line bg-linen px-5 pb-5 pt-2 md:hidden">
          <ul>
            {items.map(([href, label]) => (
              <li key={href}><Link href={href} className={`flex items-center justify-between border-b border-line py-4 text-lg ${active(href) ? 'font-semibold text-pine' : 'font-medium'}`}>{label}<Icon name="right" size={18} className="text-ink-soft" /></Link></li>
            ))}
            {user && <li><Link href="/account" className="flex items-center justify-between border-b border-line py-4 text-lg font-medium">Account<Icon name="right" size={18} className="text-ink-soft" /></Link></li>}
            {!user && !loading && <li><Link href="/sign-in" className="flex items-center justify-between py-4 text-lg font-medium">Sign in<Icon name="right" size={18} className="text-ink-soft" /></Link></li>}
          </ul>
        </nav>
      )}
    </header>
  );
}
function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link role="menuitem" href={href} className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-sage">{children}</Link>;
}
