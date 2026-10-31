export type Role = 'CUSTOMER' | 'PRO' | 'ADMIN';
export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface SessionUser {
  id: string; email: string; name: string; role: Role;
  pro: { id: string; slug: string; status: 'PENDING' | 'APPROVED' | 'SUSPENDED'; payoutsEnabled?: boolean } | null;
}
export interface Category { id: string; slug: string; name: string; icon: string; proCount: number }
export interface ProSummary {
  id: string; slug: string; name: string; headline: string; city: string;
  category: { slug: string; name: string }; ratingAvg: number; reviewCount: number; fromPriceCents: number | null;
}
export interface Service { id: string; name: string; description: string; priceCents: number; durationMin: number }
export interface ProDetail extends Omit<ProSummary, 'fromPriceCents'> { bio: string; yearsExperience: number; services: Service[] }
export interface Review { id: string; rating: number; body: string; author: string; createdAt: string }
export interface Booking {
  id: string; startsAt: string; endsAt: string; address: string; notes: string | null;
  priceCents: number; feeCents: number; status: BookingStatus; completedAt: string | null; payoutReleasedAt: string | null;
  service: { name: string }; pro: { slug: string; timezone: string; user: { name: string } };
  review: { rating: number; body: string } | null;
}
export type Slots = Record<string, string[]>;
