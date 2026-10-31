'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select } from './Select';

const options = [['top', 'Top rated'], ['reviews', 'Most reviewed'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low']].map(([value, label]) => ({ value, label }));

export function SortMenu({ value }: { value: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  return (
    <Select size="sm" align="right" prefix="Sort by" ariaLabel="Sort results" value={value} options={options}
      onChange={(v) => { const n = new URLSearchParams(sp.toString()); n.set('sort', v); n.delete('page'); router.push(`/pros?${n}`); }} />
  );
}
