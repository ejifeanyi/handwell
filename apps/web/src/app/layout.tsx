import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/figtree';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageFade } from '@/components/PageFade';

export const metadata: Metadata = {
  title: { default: 'Handwell: trusted home help, booked in a minute', template: '%s | Handwell' },
  description: 'Book vetted cleaners, plumbers, painters and more. Clear prices, secure payments held until the job is done.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Header />
          <main className="flex-1"><PageFade>{children}</PageFade></main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
