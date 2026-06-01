import { describe, expect, it } from 'vitest';

import { generateSalesKit } from './generator';

describe('generateSalesKit', () => {
  it('renders sales kit content for a product', () => {
    const html = generateSalesKit({
      id: 'sku-123',
      name: 'LaunchCart Pro',
      description: 'A fast checkout kit for small shops.',
      price: 49000,
    });

    expect(html).toContain('LaunchCart Pro');
    expect(html).toContain('A fast checkout kit for small shops.');
    expect(html).toContain('49000');
    expect(html).toContain('/order/sku-123');
    expect(html).toMatch(/<button[^>]*>\s*Đặt hàng ngay\s*<\/button>/);
  });
});
