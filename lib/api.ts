const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
