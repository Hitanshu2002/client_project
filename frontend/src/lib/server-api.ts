const DEFAULT_BACKEND_API_URL = 'http://localhost:5000/api';

function getBackendApiUrl() {
  const configured = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
  return configured && configured.startsWith('http') ? configured : DEFAULT_BACKEND_API_URL;
}

function buildUrl(endpoint: string) {
  const base = getBackendApiUrl().replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
}

export async function serverApiFetch(endpoint: string, options: RequestInit = {}) {
  return fetch(buildUrl(endpoint), {
    cache: 'no-store',
    ...options,
  });
}
