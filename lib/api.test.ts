import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadApiWithBaseUrl(baseUrl = '') {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', baseUrl);

  return import('./api');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('apiUrl', () => {
  it('trims whitespace and trailing slashes from API_BASE_URL', async () => {
    const { API_BASE_URL, apiUrl } = await loadApiWithBaseUrl('  https://api.launchcart.test///  ');

    expect(API_BASE_URL).toBe('https://api.launchcart.test');
    expect(apiUrl('/products')).toBe('https://api.launchcart.test/products');
  });

  it('normalizes paths to exactly one leading slash', async () => {
    const { apiUrl } = await loadApiWithBaseUrl('https://api.launchcart.test/');

    expect(apiUrl('products')).toBe('https://api.launchcart.test/products');
    expect(apiUrl('/products')).toBe('https://api.launchcart.test/products');
    expect(apiUrl('///products')).toBe('https://api.launchcart.test/products');
  });

  it('returns root-relative URLs when no API base URL is configured', async () => {
    const { API_BASE_URL, apiUrl } = await loadApiWithBaseUrl(undefined);

    expect(API_BASE_URL).toBe('');
    expect(apiUrl('orders/123')).toBe('/orders/123');
  });
});
