import { company } from './catalogue';
import { getProduct } from './products';

export interface EnquiryInput {
  make: string; model: string; year: string; chassis: string; position: string; side: string;
  ptype: string; qty: number; partNo: string; sku: string; len: string; dia: string; pitch: string; dir: string; knurl: string; notes: string;
  name: string; business: string; phone: string; email: string; method: string; fulfil: string; town: string;
  source: string; entryPoint: string; startedAt: number; website: string; photoCount: number;
}

export interface ValidEnquiry extends EnquiryInput { reference: string }

const limits: Partial<Record<keyof EnquiryInput, number>> = {
  make: 80, model: 100, year: 20, chassis: 80, position: 40, side: 40, ptype: 60, partNo: 80, sku: 20,
  len: 30, dia: 20, pitch: 20, dir: 30, knurl: 30, notes: 1500, name: 100, business: 120,
  phone: 40, email: 180, method: 30, fulfil: 60, town: 100, source: 60, entryPoint: 80, website: 200,
};

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, max) : '';
}

export function validateEnquiry(value: unknown): { data?: ValidEnquiry; error?: string; spam?: boolean } {
  if (!value || typeof value !== 'object') return { error: 'Invalid enquiry.' };
  const source = value as Record<string, unknown>;
  const clean = {} as Record<string, unknown>;
  for (const [key, max] of Object.entries(limits)) clean[key] = text(source[key], max);
  clean.qty = Number.isInteger(source.qty) ? Math.min(9999, Math.max(1, Number(source.qty))) : 1;
  clean.startedAt = Number(source.startedAt);
  clean.photoCount = Number.isInteger(source.photoCount) ? Math.min(6, Math.max(0, Number(source.photoCount))) : 0;

  if (clean.website) return { spam: true, error: 'Unable to send this enquiry.' };
  if (!Number.isFinite(clean.startedAt) || Date.now() - Number(clean.startedAt) < 1200) return { spam: true, error: 'Please review the form and try again.' };
  if (!clean.make || !clean.name) return { error: 'Vehicle make and name are required.' };
  if (!['WhatsApp', 'Phone call', 'Email'].includes(String(clean.method))) return { error: 'Choose a valid contact method.' };
  if (clean.method === 'Email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(clean.email))) return { error: 'Enter a valid email address.' };
  } else if (String(clean.phone).replace(/\D/g, '').length < 6) return { error: 'Enter a valid phone number.' };
  if (clean.sku && !getProduct(String(clean.sku))) return { error: 'The selected StudSport SKU is not valid.' };

  const reference = `ENQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  return { data: { ...(clean as unknown as EnquiryInput), reference } };
}

export function enquiryText(enquiry: ValidEnquiry) {
  const rows = [
    ['Reference', enquiry.reference], ['Source', enquiry.source], ['Entry point', enquiry.entryPoint],
    ['StudSport SKU', enquiry.sku], ['Requested / old part number', enquiry.partNo], ['Quantity', String(enquiry.qty)],
    ['Vehicle', [enquiry.make, enquiry.model, enquiry.year].filter(Boolean).join(' ')], ['Chassis / VIN', enquiry.chassis],
    ['Position', [enquiry.position, enquiry.side].filter(Boolean).join(' / ')], ['Part type', enquiry.ptype],
    ['Thread', [enquiry.dia, enquiry.pitch && `× ${enquiry.pitch}`, enquiry.dir].filter(Boolean).join(' ')],
    ['Overall length', enquiry.len && `${enquiry.len} mm`], ['Knurl', enquiry.knurl && `${enquiry.knurl} mm`],
    ['Notes', enquiry.notes], ['Name', enquiry.name], ['Business', enquiry.business],
    ['Phone', enquiry.phone], ['Email', enquiry.email], ['Preferred contact', enquiry.method],
    ['Fulfilment', [enquiry.fulfil, enquiry.town].filter(Boolean).join(' / ')],
  ].filter(([, value]) => value);
  const photoNote = enquiry.photoCount ? `\nPhotos selected: ${enquiry.photoCount}. Please attach them to this WhatsApp message before sending.` : '';
  return `StudSport parts enquiry\n\n${rows.map(([label, value]) => `${label}: ${value}`).join('\n')}${photoNote}`;
}

export function enquiryWhatsAppUrl(enquiry: ValidEnquiry) {
  return `${company.whatsappLink}?text=${encodeURIComponent(enquiryText(enquiry))}`;
}
