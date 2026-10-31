'use client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Fades public pages in on navigation. Dashboards animate only their content area (see DashShell), so the sidebar stays put. */
export function PageFade({ children }: { children: ReactNode }) {
  const path = usePathname();
  if (path === '/pro' || path.startsWith('/pro/') || path.startsWith('/admin')) return <>{children}</>;
  return <div key={path} className="page-in">{children}</div>;
}
