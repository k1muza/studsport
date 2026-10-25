'use client';

import type { Product } from './catalogue';
import { threadShort, threadsOf, typeLabel, vehiclesOf } from './products';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEvent =
  | 'view_item'
  | 'view_item_list'
  | 'select_item'
  | 'search'
  | 'search_no_results'
  | 'view_3d'
  | 'reference_click'
  | 'whatsapp_click'
  | 'enquiry_start'
  | 'enquiry_submit'
  | 'enquiry_error';

export function track(event: AnalyticsEvent, parameters: Record<string, string | number | boolean | undefined> = {}) {
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  window.dataLayer ||= [];
  window.gtag ||= (...args: unknown[]) => { window.dataLayer?.push(args); };
  const clean = Object.fromEntries(Object.entries(parameters).filter(([, value]) => value !== undefined && value !== ''));
  window.gtag('event', event, clean);
}

export function productAnalytics(product: Product) {
  return {
    item_id: product.partNo,
    item_name: product.name,
    product_family: product.variantGroup || product.type,
    vehicle_group: vehiclesOf(product).join('|'),
    component_type: typeLabel(product),
    thread_size: threadsOf(product).map(threadShort).join('|'),
    page_path: `/products/${product.slug}`,
  };
}

/** Never returns a visitor's free text. Only known, non-sensitive demand buckets. */
export function searchBucket(input: string) {
  const value = input.trim().toLowerCase();
  const sku = value.match(/\bss[- ]?\d{4}\b/i)?.[0];
  if (sku) return `sku:${sku.toUpperCase().replace(/\s/, '-').replace(/^SS(?=\d)/, 'SS-')}`;
  const thread = value.match(/\bm\s?(12|14|16|18|20|22|24)(?:\s*[x×]\s*(1\.25|1\.5|2(?:\.0)?))?/i);
  if (thread) return `thread:M${thread[1]}${thread[2] ? `x${thread[2]}` : ''}`;
  const known = ['toyota', 'dyna', 'hino', 'dutro', 'ranger', 'mazda', 'isuzu', 'mitsubishi', 'canter', 'nissan', 'ud', 'volvo', 'scania'];
  const match = known.find(term => new RegExp(`\\b${term}\\b`, 'i').test(value));
  return match ? `vehicle:${match}` : value ? 'other' : 'empty';
}
