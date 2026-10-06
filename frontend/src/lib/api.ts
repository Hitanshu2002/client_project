// The browser talks directly to the Express service. Set NEXT_PUBLIC_API_URL
// to the public backend URL in each environment.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Normalizes image URLs. If path is a relative backend path (e.g. starting with /uploads or uploads/),
 * it appends the backend base origin (e.g. http://localhost:5000).
 */
export function getImageUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (path.startsWith('/uploads') || path.startsWith('uploads/')) {
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }
  return path;
}

/**
 * Centralized API fetch wrapper configured with credentials: 'include'
 * and automatically prefixing NEXT_PUBLIC_API_URL.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  let url: string;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    url = endpoint;
  } else {
    let cleanEndpoint = endpoint;
    if (cleanEndpoint.startsWith('/api/')) {
      cleanEndpoint = cleanEndpoint.substring(4);
    } else if (cleanEndpoint.startsWith('api/')) {
      cleanEndpoint = cleanEndpoint.substring(3);
    }
    if (!cleanEndpoint.startsWith('/')) {
      cleanEndpoint = '/' + cleanEndpoint;
    }
    const base = API_BASE_URL.replace(/\/$/, '');
    url = `${base}${cleanEndpoint}`;
  }

  const defaultHeaders: Record<string, string> = {};
  if (options.body && !(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const mergedHeaders = {
    ...defaultHeaders,
    ...options.headers,
  };

  const config: RequestInit = {
    credentials: 'include',
    ...options,
    headers: mergedHeaders,
  };

  return fetch(url, config);
}

export default apiFetch;
