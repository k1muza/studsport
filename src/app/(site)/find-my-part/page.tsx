import type { Metadata } from 'next';
import { EnquiryForm } from '@/components/enquiry/EnquiryForm';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Find My Wheel Stud',
  description: 'Send vehicle details and wheel stud measurements to StudSport for a part identification and quotation.',
  path: '/find-my-part',
  index: false,
});

type SP = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || '';

export default async function FindMyPartPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const initial = { part: first(sp.part), qty: first(sp.qty), vehicle: first(sp.vehicle), q: first(sp.q) };
  return <EnquiryForm key={JSON.stringify(initial)} initial={initial} />;
}
