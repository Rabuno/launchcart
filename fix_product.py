import re
import os

file_path = '/opt/data/workspace/launchcart/lib/product.ts'
with open(file_path, 'r') as f:
    content = f.read()

# Define robust browser-compatible helpers
new_code = """
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

function toBase64Url(value: string) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'utf8').toString('base64url');
  }
  const str = btoa(unescape(encodeURIComponent(value)));
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'base64url').toString('utf8');
  }
  const str = value.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(str)));
}

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || 'product';
}

export function formatPrice(value: number, currency = 'VND') {
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
    ? input.highlights.map((item) => String(item).trim()).filter(Boolean).slice(0, 6)
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

export function encodeProduct(product: Partial<LaunchCartProduct>) {
  const json = JSON.stringify(normalizeProduct(product));
  return toBase64Url(json);
}

export function decodeProduct(encoded?: string | string[]) {
  if (!encoded || Array.isArray(encoded)) return demoProduct;
  try {
    const json = fromBase64Url(encoded);
    const parsed = JSON.parse(json) as Partial<LaunchCartProduct>;
    return normalizeProduct(parsed);
  } catch {
    return demoProduct;
  }
}
"""

with open(file_path, 'w') as f:
    f.write(new_code.strip())
