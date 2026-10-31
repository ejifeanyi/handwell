import type { BookingStatus } from '@/lib/types';
export interface ProBooking {
  id: string; startsAt: string; address: string; notes: string | null; priceCents: number; status: BookingStatus;
  payoutTransferId: string | null; service: { name: string }; customer: { name: string };
}
export interface Window { weekday: number; startMinute: number; endMinute: number }
export interface MyService { id?: string; name: string; description: string; priceCents: number; durationMin: number }
