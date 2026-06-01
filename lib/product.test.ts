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

  it('encodes and decodes product payloads for shareable sales URLs', () => {
    const encoded = encodeProduct({ name: 'Template Pack', price: 99000, highlights: ['One', 'Two'] });
    const decoded = decodeProduct(encoded);

    expect(decoded.name).toBe('Template Pack');
    expect(decoded.slug).toBe('template-pack');
    expect(decoded.highlights).toEqual(['One', 'Two']);
  });

  it('falls back to the demo product for invalid encoded payloads', () => {
    expect(decodeProduct('not-valid-json').name).toBe(demoProduct.name);
  });

  it('formats VND prices for Vietnamese buyers', () => {
    expect(formatPrice(99000)).toContain('99.000');
  });
});
