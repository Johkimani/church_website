
/**
 * Centralized API configuration and derived constants.
 * This ensures consistency across different environments.
 */

// Base URL for backend API requests
export const BASE_URL = import.meta.env.VITE_SERVER_URI || '';

// Base URL for static assets (images/uploads)
// We extract the base domain and remove any trailing '/api' if present
export const UPLOAD_BASE = BASE_URL.endsWith('/api') 
  ? BASE_URL.replace(/\/api$/, '') 
  : BASE_URL;

/**
 * Helper to ensure a clean path for image URLs
 */
export const getSafeImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${UPLOAD_BASE}${cleanPath}`;
};
