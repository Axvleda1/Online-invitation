export const API_BASE = import.meta.env.VITE_API_URL || '';
export function fileUrl(p = '') {
  const path = p.startsWith('/') ? p : `/${p}`;
  return `${API_BASE}${path}`;
}
