import { describe, expect, it } from 'vitest';

import { decodeProduct, demoProduct, encodeProduct, formatPrice, normalizeProduct, slugify } from './product';

describe('product helpers', () => {
  it('slugifies Vietnamese and punctuation-heavy names', () => {
    expect(slugify('Khóa học AI Đỉnh Cao!!!')).toBe('khoa-hoc-ai-dinh-cao');
  });

  it('normalizes partial product data with safe defaults', () => {
    const product = normalizeProduct({ name: 'Mini CRM', price: 120000, highlights: ['Fast', '', 'Simple'] });

    expect(product.slug).toBe('mini-crm');
    expect(product.price).toBe(120000);
    expect(product.highlights).toEqual(['Fast', 'Simple']);
    expect(product.sellerName).toBe(demoProduct.sellerName);
  });

  it('encodes and decodes Vietnamese text (Safari-safe, no Buffer.from base64url)', () => {
    const encoded = encodeProduct({
      name: 'Khóa học AI Đỉnh Cao',
      tagline: 'Tạo trang bán hàng gọn',
      description: 'Hoàn tiền trong 7 ngày',
      highlights: ['Form đặt hàng không cần tài khoản', 'Phù hợp MVP, pre-order'],
    });
    const decoded = decodeProduct(encoded);

    expect(decoded.name).toBe('Khóa học AI Đỉnh Cao');
    expect(decoded.tagline).toBe('Tạo trang bán hàng gọn');
    expect(decoded.description).toBe('Hoàn tiền trong 7 ngày');
    expect(decoded.highlights).toEqual(['Form đặt hàng không cần tài khoản', 'Phù hợp MVP, pre-order']);
  });

  it('produces URL-safe output (no + / = characters)', () => {
    const encoded = encodeProduct({ name: 'Test Product With Special Chars: @#$%' });
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');
  });

  it('falls back to the demo product for invalid encoded payloads', () => {
    expect(decodeProduct('not-valid-json').name).toBe(demoProduct.name);
  });

  it('formats VND prices for Vietnamese buyers', () => {
    expect(formatPrice(99000)).toContain('99.000');
  });
});
