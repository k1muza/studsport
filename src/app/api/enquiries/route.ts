import { enquiryText, enquiryWhatsAppUrl, validateEnquiry, type ValidEnquiry } from '@/lib/enquiry';

export const runtime = 'nodejs';

const attempts = new Map<string, number[]>();

function rateLimited(request: Request) {
  const key = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter(time => now - time < 10 * 60_000);
  if (recent.length >= 5) { attempts.set(key, recent); return true; }
  recent.push(now);
  attempts.set(key, recent);
  return false;
}

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const expectedHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || new URL(request.url).host;
  try { return new URL(origin).host === expectedHost; } catch { return false; }
}

async function deliverEmail(enquiry: ValidEnquiry) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !to || !from) return null;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: enquiry.email || undefined,
      subject: `${enquiry.reference} · ${enquiry.sku || enquiry.partNo || enquiry.ptype || 'part enquiry'} × ${enquiry.qty}`,
      text: enquiryText(enquiry),
    }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Delivery provider rejected request (${response.status})`);
  const result = await response.json() as { id?: string };
  if (!result.id) throw new Error('Delivery provider did not confirm receipt');
  return result.id;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  if (rateLimited(request)) return Response.json({ error: 'Too many enquiries. Please wait a few minutes or use WhatsApp.' }, { status: 429 });
  if (Number(request.headers.get('content-length') || 0) > 100_000) return Response.json({ error: 'Enquiry is too large.' }, { status: 413 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }
  const result = validateEnquiry(body);
  if (!result.data) return Response.json({ error: result.error || 'Please check the enquiry.' }, { status: result.spam ? 400 : 422 });

  try {
    const deliveryId = await deliverEmail(result.data);
    if (deliveryId) return Response.json({ status: 'delivered', reference: result.data.reference, deliveryId });
    return Response.json({ status: 'handoff', reference: result.data.reference, url: enquiryWhatsAppUrl(result.data) });
  } catch {
    return Response.json({ error: 'We could not deliver the enquiry. Your details were not discarded—please retry or use the WhatsApp option.' }, { status: 502 });
  }
}
