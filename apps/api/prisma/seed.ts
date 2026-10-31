/**
 * Seeds Handwell with demo data: 6 categories, 24 approved pros, services, weekly hours,
 * a few pending applications, past jobs with reviews, and three demo logins.
 * Safe to re-run: it wipes the app tables first (this is demo data, never run against real data).
 *
 * Demo logins need SUPABASE_SERVICE_ROLE_KEY so the script can create the Supabase auth users.
 * Without it the rows are still created, but nobody can sign in as them.
 */
import { PrismaClient, type Role } from '@prisma/client';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();
const PASSWORD = 'Handwell-demo-1';
const FEE_BPS = Number(process.env.PLATFORM_FEE_BPS ?? 1500);

// Small deterministic RNG so every reseed looks the same.
let seedState = 42;
const rnd = () => ((seedState = (seedState * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)]!;

async function authUser(email: string, name: string): Promise<string> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return randomUUID();
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST', headers,
    body: JSON.stringify({ email, password: PASSWORD, email_confirm: true, user_metadata: { full_name: name } }),
  });
  if (res.ok) return ((await res.json()) as { id: string }).id;
  // Already exists: look it up.
  const list = await fetch(`${url}/auth/v1/admin/users?per_page=200`, { headers });
  const users = ((await list.json()) as { users: { id: string; email: string }[] }).users;
  const found = users.find((u) => u.email === email);
  if (!found) throw new Error(`Could not create or find auth user ${email}: ${res.status}`);
  return found.id;
}

const categories = [
  { slug: 'cleaning', name: 'Cleaning', icon: 'sparkle' },
  { slug: 'plumbing', name: 'Plumbing', icon: 'wrench' },
  { slug: 'electrical', name: 'Electrical', icon: 'bolt' },
  { slug: 'painting', name: 'Painting', icon: 'brush' },
  { slug: 'lawn-garden', name: 'Lawn and garden', icon: 'leaf' },
  { slug: 'moving', name: 'Moving help', icon: 'box' },
];

type Svc = [name: string, description: string, dollars: number, minutes: number];
const serviceSets: Record<string, Svc[]> = {
  cleaning: [
    ['Standard home clean', 'Kitchen, bathrooms, floors, dusting and trash for homes up to 2,000 sq ft.', 85, 120],
    ['Deep clean', 'Baseboards, inside appliances, grout and the spots a regular clean skips.', 160, 240],
    ['Move-out clean', 'Empty-home clean to get your deposit back.', 220, 300],
  ],
  plumbing: [
    ['Leak or clog repair', 'Find and fix a leaking fixture or clear a stubborn drain.', 110, 90],
    ['Fixture install', 'Faucet, toilet or disposal installed and tested.', 150, 120],
    ['Water heater service', 'Flush, inspect and repair common tank problems.', 190, 150],
  ],
  electrical: [
    ['Outlet and switch repair', 'Replace or fix up to three outlets or switches.', 120, 90],
    ['Light fixture install', 'Ceiling lights, fans or outdoor lighting installed safely.', 140, 120],
    ['Panel safety check', 'Inspect your breaker panel and report anything that needs attention.', 175, 120],
  ],
  painting: [
    ['Single room paint', 'Walls and trim for one room, with prep and cleanup.', 240, 360],
    ['Accent wall or trim', 'A fresh accent wall or full trim refresh.', 130, 180],
    ['Whole-floor interior paint', 'Walls throughout one floor of your home.', 780, 720],
  ],
  'lawn-garden': [
    ['Lawn mow and edge', 'Mow, edge and blow clean for yards up to a quarter acre.', 60, 60],
    ['Garden bed refresh', 'Weeding, mulch and trimming for up to three beds.', 120, 150],
    ['Seasonal yard cleanup', 'Leaves, brush and debris cleared and hauled away.', 210, 240],
  ],
  moving: [
    ['Two-person help, 2 hours', 'Two movers to load or unload a truck or pod.', 140, 120],
    ['Apartment move', 'Two movers and a truck for a one-bedroom move across town.', 380, 240],
    ['Furniture rearranging', 'Heavy lifting and room layout changes inside your home.', 95, 90],
  ],
};

const firsts = ['Maya', 'Diego', 'Tessa', 'Jamal', 'Priya', 'Lucas', 'Aaliyah', 'Marcus', 'Elena', 'Omar', 'Hannah', 'Terrence', 'Sofia', 'Andre', 'Grace', 'Victor', 'Naomi', 'Caleb', 'Imani', 'Rafael', 'Lena', 'Darius', 'Chloe', 'Samuel'];
const lasts = ['Okafor', 'Ramirez', 'Brooks', 'Whitfield', 'Nair', 'Meyer', 'Johnson', 'Hill', 'Castillo', 'Haddad', 'Park', 'Coleman', 'Rossi', 'Baptiste', 'Liu', 'Adeyemi', 'Foster', 'Dunn', 'Carter', 'Mendoza', 'Hartmann', 'Greene', 'Bennett', 'Walker'];
const headlines: Record<string, string[]> = {
  cleaning: ['Spotless homes, every time', 'Detail-first home cleaning', 'Eco-friendly cleaning for busy families'],
  plumbing: ['Licensed plumber, same-week visits', 'Leaks, clogs and installs done right', 'Honest plumbing with upfront pricing'],
  electrical: ['Licensed electrician for home upgrades', 'Safe, tidy electrical work', 'Lighting, outlets and panel checks'],
  painting: ['Clean lines and careful prep', 'Interior painting that lasts', 'Color advice and flawless finishes'],
  'lawn-garden': ['Lawns and beds that look cared for', 'Reliable weekly yard care', 'Seasonal cleanups, hauled away'],
  moving: ['Careful hands for heavy things', 'Local moves without the stress', 'Strong, friendly moving help'],
};
const reviewBodies = [
  'Showed up on time, explained the price before starting, and left everything tidy. Would book again.',
  'Really professional and easy to work with. The result was better than I expected.',
  'Fast, friendly and fair. Booking through Handwell made the whole thing painless.',
  'Did exactly what was promised and answered all my questions. Highly recommend.',
  'Great communication and careful work. We have already booked a second visit.',
  'Honest about what was needed and did not try to upsell. Very happy.',
];

async function main() {
  await prisma.$transaction([
    prisma.review.deleteMany(), prisma.booking.deleteMany(), prisma.availabilityWindow.deleteMany(),
    prisma.service.deleteMany(), prisma.proProfile.deleteMany(), prisma.category.deleteMany(),
    prisma.webhookEvent.deleteMany(), prisma.user.deleteMany(),
  ]);

  const cats = new Map<string, string>();
  for (const c of categories) cats.set(c.slug, (await prisma.category.create({ data: c })).id);

  const mkUser = async (email: string, name: string, role: Role, login: boolean) =>
    prisma.user.create({ data: { id: login ? await authUser(email, name) : randomUUID(), email, name, role } });

  const demoCustomer = await mkUser('customer@handwell.dev', 'Casey Morgan', 'CUSTOMER', true);
  const demoPro = await mkUser('pro@handwell.dev', 'Maya Okafor', 'PRO', true);
  await mkUser('admin@handwell.dev', 'Handwell Admin', 'ADMIN', true);

  const customers = [demoCustomer];
  for (let i = 0; i < 10; i++) {
    const name = `${pick(firsts)} ${pick(lasts)}`;
    customers.push(await mkUser(`customer${i}@example.com`, name, 'CUSTOMER', false));
  }

  const slugs = categories.map((c) => c.slug);
  const proIds: { proId: string; services: { id: string; priceCents: number; durationMin: number }[] }[] = [];

  for (let i = 0; i < 24; i++) {
    const catSlug = slugs[i % slugs.length]!;
    const isDemo = i === 0;
    const name = isDemo ? 'Maya Okafor' : `${firsts[i]} ${lasts[i]}`;
    const user = isDemo ? demoPro : await mkUser(`pro${i}@example.com`, name, 'PRO', false);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const set = serviceSets[catSlug]!;
    const mult = 0.9 + rnd() * 0.3;
    const profile = await prisma.proProfile.create({
      data: {
        userId: user.id, slug, categoryId: cats.get(catSlug)!, city: 'Columbus', timezone: 'America/New_York',
        headline: pick(headlines[catSlug]!), yearsExperience: 3 + Math.floor(rnd() * 14),
        bio: `${name.split(' ')[0]} has worked in Columbus for years and takes pride in showing up on time, quoting honestly and leaving the job site cleaner than they found it. Most customers come back for a second booking.`,
        status: 'APPROVED', payoutsEnabled: !isDemo, stripeAccountId: isDemo ? null : `acct_demo_${i}`,
        services: { create: set.map(([n, d, dollars, mins]) => ({ name: n, description: d, priceCents: Math.round((dollars * mult) / 5) * 500, durationMin: mins })) },
        windows: { create: [1, 2, 3, 4, 5, ...(rnd() > 0.5 ? [6] : [])].map((weekday) => ({ weekday, startMinute: 8 * 60, endMinute: weekday === 6 ? 14 * 60 : 17 * 60 })) },
      },
      include: { services: true },
    });
    proIds.push({ proId: profile.id, services: profile.services });
  }

  // Pending applications for the admin approval queue.
  for (let i = 0; i < 3; i++) {
    const catSlug = slugs[(i * 2) % slugs.length]!;
    const name = `${pick(firsts)} ${pick(lasts)} ${i + 1}`;
    const user = await mkUser(`applicant${i}@example.com`, name.replace(/ \d$/, ''), 'PRO', false);
    await prisma.proProfile.create({
      data: {
        userId: user.id, slug: `applicant-${i}`, categoryId: cats.get(catSlug)!, city: 'Columbus', headline: pick(headlines[catSlug]!),
        bio: 'Recently moved to Columbus and ready to take on new customers. References available on request.',
        yearsExperience: 2 + i, status: 'PENDING',
        services: { create: serviceSets[catSlug]!.slice(0, 1).map(([n, d, dollars, mins]) => ({ name: n, description: d, priceCents: dollars * 100, durationMin: mins })) },
        windows: { create: [{ weekday: 1, startMinute: 540, endMinute: 1020 }] },
      },
    });
  }

  // Past completed jobs with reviews so ratings, earnings and the admin charts have history.
  const now = Date.now();
  for (const { proId, services } of proIds) {
    const count = 4 + Math.floor(rnd() * 8);
    let sum = 0;
    for (let j = 0; j < count; j++) {
      const svc = pick(services);
      const cust = pick(customers);
      const startsAt = new Date(now - (2 + Math.floor(rnd() * 80)) * 86_400_000);
      startsAt.setUTCHours(15, 0, 0, 0);
      const fee = Math.round((svc.priceCents * FEE_BPS) / 10_000);
      const rating = rnd() > 0.12 ? 5 : rnd() > 0.5 ? 4 : 3;
      sum += rating;
      const booking = await prisma.booking.create({
        data: {
          customerId: cust.id, proId, serviceId: svc.id, startsAt, endsAt: new Date(startsAt.getTime() + svc.durationMin * 60_000),
          address: `${100 + Math.floor(rnd() * 800)} Maple Ave, Columbus, OH`, priceCents: svc.priceCents, feeCents: fee,
          status: 'COMPLETED', completedAt: new Date(startsAt.getTime() + svc.durationMin * 60_000),
          payoutReleasedAt: new Date(startsAt.getTime() + svc.durationMin * 60_000 + 3_600_000), payoutTransferId: `tr_demo_${randomUUID().slice(0, 12)}`,
          createdAt: new Date(startsAt.getTime() - 3 * 86_400_000),
        },
      });
      await prisma.review.create({ data: { bookingId: booking.id, customerId: cust.id, proId, rating, body: pick(reviewBodies), createdAt: booking.completedAt! } });
    }
    await prisma.proProfile.update({ where: { id: proId }, data: { ratingAvg: Math.round((sum / count) * 10) / 10, reviewCount: count } });
  }

  console.log('Seeded Handwell. Demo logins (password %s): customer@handwell.dev, pro@handwell.dev, admin@handwell.dev', PASSWORD);
}

main().finally(() => prisma.$disconnect());
