/**
 * API configuration to handle environment-specific URLs
 */

// Feature flags
export const API_FEATURES = {
  // Set to true to use the real API instead of mock data
  USE_REAL_API: import.meta.env.VITE_USE_REAL_API === 'true',
};

// Determine the current environment
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Base API URL configuration
const API_URLS = {
  development: 'http://127.0.0.1:1314',
  production: '/api', // This will be proxied to the actual backend URL in production
  custom: import.meta.env.VITE_API_BASE_URL, // Custom override from env
};

// Determine which base URL to use
export const API_BASE_URL = 
  API_URLS.custom || 
  (isDevelopment ? API_URLS.development : API_URLS.production);

// API endpoints
export const API_ENDPOINTS = {
  // Image endpoints
  IMAGES: `${API_BASE_URL}/api/images`,
  IMAGE_SEARCH: `${API_BASE_URL}/api/image/search`,
  IMAGE_TAGS: `${API_BASE_URL}/api/image/tags`,
  
  // Shortcode endpoints
  SHORTCODES: `${API_BASE_URL}/api/scs`,
  SHORTCODE_SEARCH: `${API_BASE_URL}/api/sc/search`,
  SHORTCODE_TAGS: `${API_BASE_URL}/api/sc/tags`,
  SHORTCODE_DETAILS: `${API_BASE_URL}/api/sc`,
};

// Default request parameters
export const DEFAULT_REQUEST_PARAMS = {
  type: 'Image',
  count: 10,
  offset: 0,
  order: 'desc',
};

// Shortcode specific parameters
export const SHORTCODE_REQUEST_PARAMS = {
  type: 'ShortCode',
  count: 10,
  offset: 0,
  order: 'desc',
};

// Cache configuration
export const CACHE_CONFIG = {
  // 30 days in seconds (same as server-side max-age)
  maxAge: 2592000,
}; 