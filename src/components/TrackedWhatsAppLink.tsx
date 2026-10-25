'use client';

import { usePathname } from 'next/navigation';
import { company } from '@/lib/catalogue';
import { track } from '@/lib/analytics';

export function TrackedWhatsAppLink({ children, className, entryPoint, href = company.whatsappLink }: {
  children: React.ReactNode;
  className?: string;
  entryPoint: string;
  href?: string;
}) {
  const pathname = usePathname();
  return <a href={href} target="_blank" rel="noopener" className={className} onClick={() => track('whatsapp_click', { enquiry_entry_point: entryPoint, page_path: pathname })}>{children}</a>;
}
