import type { Metadata, Viewport } from 'next';
import { Schibsted_Grotesk, Martian_Mono } from 'next/font/google';
import './globals.css';

const sans = Schibsted_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-sans', display: 'swap' });
const mono = Martian_Mono({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'StudSport · Wheel Studs, Hub Bolts & Nuts · Harare', template: '%s · StudSport' },
  description: 'Wheel studs, hub bolts and matching nuts for trucks and commercial vehicles. Check dimensions online and request a quote. Harare, Zimbabwe.',
};

export const viewport: Viewport = { themeColor: '#121416' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
