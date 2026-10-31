import { Suspense } from 'react';
import { CheckoutForm } from './CheckoutForm';

export const metadata = { title: 'Checkout' };
export default function Checkout() { return <Suspense><CheckoutForm /></Suspense>; }
