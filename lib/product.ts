export type LaunchCartProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  highlights: string[];
  guarantee: string;
  sellerName: string;
};

export const demoProduct: LaunchCartProduct = {
  id: 'demo-launchkit',
  slug: 'demo',
  name: 'LaunchCart Sales Kit',
  tagline: 'Tạo trang bán hàng gọn, nhanh và chốt đơn trong vài phút.',
  description:
    'Một landing page bán hàng tối giản cho creator, freelancer và shop nhỏ: có headline, lợi ích, giá, CTA và form đặt hàng ngay trên trang.',
  price: 99000,
  currency: 'VND',
  imageUrl: '',
  highlights: [
    'Trang sản phẩm responsive, tải nhanh',
    'Form đặt hàng không cần tài khoản',
    'Link bán hàng dễ chia sẻ cho khách',
    'Phù hợp MVP, pre-order và sản phẩm số',
  ],
  guarantee: 'Hoàn tiền trong 7 ngày nếu sản phẩm không đúng mô tả.',
  sellerName: 'LaunchCart',
};

/**
 * Encode a string to base64url.
 * Uses Node.js Buffer when available (server-side / build),
 * falls back to btoa + manual replacement in the browser.
 */
function toBase64Url(value: string): string {
  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).Buffer !== 'undefined') {
    return (globalThis as any).Buffer.from(value, 'utf8').toString('base64url');
  }

  let binary: string;
  try {
    // Encodeutf-8
    binary = encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    );
  } catch {
    binary = value;
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decode a base64url string.
 * Uses Node.js Buffer when available (server-side / build),
 * falls back to atob + manual replacement in the browser.
 */
function fromBase64Url(value: string): string {
  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).Buffer !== 'undefined') {
    return (globalThis as any).Buffer.from(value, 'base64url').toString('utf8');
  }

  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  try {
    return decodeURIComponent(
      Array.from(bytes)
        .map((b) => '%' + b.toString(16).padStart(2, '0'))
        .join('')
    );
  } catch {
    return binary;
  }
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || 'product';
}

export function formatPrice(value: number, currency = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function normalizeProduct(input: Partial<LaunchCartProduct>): LaunchCartProduct {
  const name = String(input.name || demoProduct.name).trim();
  const slug = String(input.slug || slugify(name)).trim();
  const highlights = Array.isArray(input.highlights)
    ? input.highlights.map((item: string) => String(item).trim()).filter(Boolean).slice(0, 6)
    : demoProduct.highlights;

  return {
    ...demoProduct,
    ...input,
    id: String(input.id || slug || demoProduct.id),
    slug,
    name,
    tagline: String(input.tagline || demoProduct.tagline).trim(),
    description: String(input.description || demoProduct.description).trim(),
    price: Number(input.price || demoProduct.price),
    currency: String(input.currency || demoProduct.currency).trim().toUpperCase(),
    imageUrl: String(input.imageUrl || '').trim(),
    highlights: highlights.length ? highlights : demoProduct.highlights,
    guarantee: String(input.guarantee || demoProduct.guarantee).trim(),
    sellerName: String(input.sellerName || demoProduct.sellerName).trim(),
  };
}

export function encodeProduct(product: Partial<LaunchCartProduct>): string {
  const json = JSON.stringify(normalizeProduct(product));
  return toBase64Url(json);
}

export function decodeProduct(encoded?: string | string[]): LaunchCartProduct {
  if (!encoded || Array.isArray(encoded)) return demoProduct;
  try {
    const json = fromBase64Url(encoded);
    const parsed = JSON.parse(json) as Partial<LaunchCartProduct>;
    return normalizeProduct(parsed);
  } catch {
    return demoProduct;
  }
}
