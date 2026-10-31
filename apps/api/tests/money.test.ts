import { describe, expect, it } from 'vitest';
import { splitFee } from '../src/lib/money.js';

describe('splitFee', () => {
  it('takes 15% and gives the pro the rest', () => {
    expect(splitFee(10_000, 1500)).toEqual({ feeCents: 1500, proCents: 8500 });
  });
  it('never loses a cent to rounding', () => {
    for (const price of [1999, 8575, 12_345, 100_001]) {
      const { feeCents, proCents } = splitFee(price, 1500);
      expect(feeCents + proCents).toBe(price);
    }
  });
});
