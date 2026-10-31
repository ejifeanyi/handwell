/** Split a price into platform fee and pro share. Fee is rounded to the nearest cent; the pro gets the remainder. */
export function splitFee(priceCents: number, feeBps: number) {
  const feeCents = Math.round((priceCents * feeBps) / 10_000);
  return { feeCents, proCents: priceCents - feeCents };
}
