import type { Metadata, Viewport } from 'next';
import { Schibsted_Grotesk, Martian_Mono } from 'next/font/google';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { allowIndexing, siteUrl } from '@/lib/site';
import './globals.css';

const sans = Schibsted_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-sans', display: 'swap' });
const mono = Martian_Mono({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Commercial Vehicle Wheel Studs & Hub Bolts | StudSport Zimbabwe', template: '%s | StudSport Zimbabwe' },
  description: 'Wheel studs, hub bolts and matching nuts for trucks and commercial vehicles. Check dimensions online and request a quote. Harare, Zimbabwe.',
  applicationName: 'StudSport',
  alternates: { canonical: '/' },
  robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false, noarchive: true },
  openGraph: {
    type: 'website', siteName: 'StudSport', locale: 'en_ZW', url: '/',
    title: 'Commercial Vehicle Wheel Studs & Hub Bolts | StudSport Zimbabwe',
    description: 'Identify commercial-vehicle wheel studs, hub bolts and nuts by vehicle and dimensions, then request a compatibility check.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'StudSport commercial vehicle wheel stud identification' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Commercial Vehicle Wheel Studs & Hub Bolts | StudSport Zimbabwe',
    description: 'Identify wheel studs and hub bolts by vehicle and dimensions in Zimbabwe.',
    images: ['/opengraph-image'],
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = { themeColor: '#121416' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}<GoogleAnalytics /></body>
    </html>
  );
}
