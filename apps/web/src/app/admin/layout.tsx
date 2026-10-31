import type { ReactNode } from 'react';
import { DashShell } from '@/components/DashShell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <DashShell title="Admin" nav={[
    { href: '/admin', label: 'Overview', icon: 'grid' },
    { href: '/admin/approvals', label: 'Approvals', icon: 'inbox' },
    { href: '/admin/pros', label: 'Pros', icon: 'users' },
    { href: '/admin/bookings', label: 'Bookings', icon: 'calendar' },
    { href: '/admin/revenue', label: 'Revenue', icon: 'chart' },
  ]}>{children}</DashShell>;
}
