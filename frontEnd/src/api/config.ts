
/**
 * Centralized API configuration and derived constants.
 * This ensures consistency across different environments.
 */

const rawServerUri = import.meta.env.VITE_SERVER_URI || '';
const normalizedServerUri = rawServerUri
  .replace(/\/api(\/v\d+)?\/?$/i, '')
  .replace(/\/$/, '');

export const BASE_URL = normalizedServerUri;
export const UPLOAD_BASE = BASE_URL;

/**
 * Helper to ensure a clean path for image URLs
 */
export const getSafeImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${UPLOAD_BASE}${cleanPath}`;
};
