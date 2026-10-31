import { ButtonLink, Card } from '@/components/ui';

export const metadata = { title: 'How it works' };

const steps = (rows: string[][]) => (
  <ol className="grid gap-10 md:grid-cols-3">
    {rows.map(([h, d], i) => (
      <li key={h} className="space-y-3.5"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-clay text-h4 font-bold text-white">{i + 1}</span><h3 className="font-display text-h3 text-ink">{h}</h3><p className="text-ink-soft">{d}</p></li>
    ))}
  </ol>
);

export default function HowItWorks() {
  return (
    <>
      <section className="mx-auto flex max-w-[1440px] flex-col items-center gap-5 px-5 pb-16 pt-20 text-center md:px-40">
        <h1 className="max-w-3xl text-h1">Booking home help should be this easy</h1>
        <p className="max-w-2xl text-lg text-ink-soft">Pick a vetted pro, choose a time and pay securely. Your money is held until the job is done.</p>
      </section>
      <section className="bg-sand"><div className="mx-auto max-w-[1440px] space-y-10 px-5 py-[72px] md:px-40"><h2 className="text-h2">For customers</h2>
        {steps([['Find a pro', 'Search by service and see ratings, reviews and fixed starting prices.'], ['Book a time', 'Pick a slot from real availability. No back-and-forth.'], ['Pay and relax', 'Your card is charged at booking. The pro is paid after you confirm the job.']])}</div></section>
      <section><div className="mx-auto max-w-[1440px] space-y-10 px-5 py-[72px] md:px-40"><h2 className="text-h2">For pros</h2>
        {steps([['Apply', 'Tell us about your work. We review applications within a business day.'], ['Get booked', 'Set your prices and hours. Customers book you directly.'], ['Get paid', 'Keep 85% of every job, paid to your bank by Stripe.']])}</div></section>
      <section id="trust" className="mx-auto max-w-[1440px] space-y-4 px-5 pb-12 md:px-40"><h2 className="text-h2">Trust and safety</h2><p className="max-w-3xl text-lg text-ink-soft">Every pro is identity and background checked before taking a booking. Payments are held by Handwell and only released after the customer confirms the job. Only customers who booked and paid can leave a review.</p></section>
      <section id="faq" className="mx-auto max-w-[1440px] space-y-4 px-5 pb-24 md:px-40"><h2 className="text-h2" id="fees">Common questions</h2>
        {[['When is my card charged?', 'At booking. The money is held by Handwell and only released to the pro after you confirm the job is done.'], ['Can I cancel?', 'Yes, for free up to 24 hours before your booking. You get a full refund.'], ['How much does Handwell charge?', 'Customers pay the listed price with no extra fees. Pros pay 15% of each completed job.']].map(([q, a]) => (
          <Card key={q} className="space-y-1.5 !p-6"><h3 className="font-sans text-h4 text-ink">{q}</h3><p className="text-ink-soft">{a}</p></Card>
        ))}
        <div className="pt-6"><ButtonLink href="/pros">Find a pro</ButtonLink></div>
      </section>
    </>
  );
}
