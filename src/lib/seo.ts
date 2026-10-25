import type { Metadata } from 'next';
import { productTypes, type Product } from './catalogue';
import { appsLabel, threadShort, threadsOf } from './products';
import { absoluteUrl, allowIndexing } from './site';

export function productSearchName(product: Product) {
  const firstThread = threadShort(threadsOf(product)[0]).replace(/ · hand TBC| (?:RH|LH)$/g, '');
  const hasThread = product.name.replace(/\s/g, '').includes(firstThread.replace(/\s/g, ''));
  return hasThread ? product.name : `${product.name} ${firstThread}`;
}

export function productDescription(product: Product) {
  const application = appsLabel(product);
  return `${productSearchName(product)} reference for ${application}. Review supported dimensions and send an enquiry to check compatibility, price and availability in Zimbabwe.`;
}

export function pageMetadata({
  title,
  description,
  path,
  image = '/opengraph-image',
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  index?: boolean;
}): Metadata {
  const canonical = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical },
    robots: index && allowIndexing ? { index: true, follow: true } : { index: false, follow: index },
    openGraph: {
      type: 'website',
      siteName: 'StudSport',
      locale: 'en_ZW',
      url: canonical,
      title,
      description,
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

export function productMetadata(product: Product): Metadata {
  const title = productSearchName(product);
  const description = productDescription(product);
  const path = `/products/${product.slug}`;
  const image = `/product-share/${product.slug}`;
  return {
    ...pageMetadata({ title, description, path, image }),
    openGraph: {
      type: 'website',
      siteName: 'StudSport',
      locale: 'en_ZW',
      url: absoluteUrl(path),
      title,
      description,
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: `${title} technical illustration` }],
    },
    other: { 'product:retailer_item_id': product.partNo, 'product:category': productTypes[product.type].label },
  };
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
