const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const API_BASE_URL = rawBaseUrl.trim().replace(/\/+$/, '');

export function apiUrl(path: string) {
  const normalizedPath = `/${path.replace(/^\/+/, '')}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
