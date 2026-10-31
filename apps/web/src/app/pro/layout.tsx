import type { ReactNode } from 'react';
import { DashShell } from '@/components/DashShell';

export default function ProLayout({ children }: { children: ReactNode }) {
  return <DashShell title="Pro dashboard" nav={[
    { href: '/pro', label: 'Overview', icon: 'grid' },
    { href: '/pro/bookings', label: 'Bookings', icon: 'calendar' },
    { href: '/pro/availability', label: 'Availability', icon: 'clock' },
    { href: '/pro/services', label: 'Services', icon: 'tag' },
    { href: '/pro/payouts', label: 'Payouts', icon: 'bank' },
  ]}>{children}</DashShell>;
}
