/**
 * API utilities for making HTTP requests with error handling and caching
 */
import { CACHE_CONFIG } from '../config/api';

// Cache storage for Etags
const etagCache = new Map<string, string>();

// Error classes
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Request options interface
export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  disableCache?: boolean;
}

/**
 * Builds URL with query parameters
 */
export function buildUrl(url: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return url;
  
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  
  let queryString = searchParams.toString();
  
  // Special handling for Bleve search queries - replace + with %20 for the q parameter
  // This ensures compatibility with Bleve's query syntax expectations
  if (params.q) {
    // Extract the q parameter value
    const qParamRaw = `q=${encodeURIComponent(String(params.q))}`;
    // Find and replace the URLSearchParams-encoded version with our custom encoded version
    const qParamRegex = new RegExp(`q=[^&]*`);
    queryString = queryString.replace(qParamRegex, qParamRaw);
    console.log('Encoded search query param:', qParamRaw);
    // Log the full URL for debugging
    console.log('Final URL with properly encoded search query:', 
      `${url}?${queryString}`);
  }
  
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Makes an HTTP request with error handling and caching
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, disableCache = false, ...fetchOptions } = options;
  
  const fullUrl = buildUrl(url, params);
  
  // Set up headers
  const headers = new Headers(fetchOptions.headers || {});
  
  if (!headers.has('Content-Type') && !fetchOptions.method?.toUpperCase().includes('GET')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Add If-None-Match header if we have a cached etag and caching is enabled
  if (!disableCache && etagCache.has(fullUrl)) {
    headers.set('If-None-Match', etagCache.get(fullUrl)!);
  }
  
  try {
    console.log(`Fetching URL: ${fullUrl}`);
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
    });
    
    // Store etag if present in response
    const etag = response.headers.get('Etag');
    if (etag) {
      etagCache.set(fullUrl, etag);
      console.log(`Cached ETag: ${etag} for URL: ${fullUrl}`);
    }
    
    // Handle 304 Not Modified - return cached data if available
    if (response.status === 304) {
      const cachedData = localStorage.getItem(`api_cache_${fullUrl}`);
      if (cachedData) {
        console.log(`Using cached data for URL: ${fullUrl}`);
        return JSON.parse(cachedData) as T;
      }
      // If somehow we got a 304 but no cached data, proceed with normal response handling
      console.log(`Received 304 but no cached data for URL: ${fullUrl}`);
    }
    
    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }
    
    // For empty responses (like successful DELETE)
    if (response.status === 204) {
      return {} as T;
    }
    
    const responseText = await response.text();
    
    // Handle empty response
    if (!responseText) {
      console.error(`Empty response body for URL: ${fullUrl}`);
      return {} as T;
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('API response raw data:', { url: fullUrl, data });
      
      // Cache successful responses
      if (!disableCache && response.ok) {
        localStorage.setItem(`api_cache_${fullUrl}`, JSON.stringify(data));
      }
      
      return data as T;
    } catch (parseError) {
      console.error(`Error parsing JSON for URL: ${fullUrl}`, responseText, parseError);
      throw new ApiError(
        `Invalid JSON response: ${(parseError as Error).message}`,
        response.status
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error(`Network error for URL: ${fullUrl}`, error);
    throw new ApiError(
      `Network error: ${(error as Error).message}`,
      0
    );
  }
}

/**
 * HTTP request methods with type safety
 */
export const api = {
  get: <T>(url: string, options: RequestOptions = {}): Promise<T> => 
    fetchWithErrorHandling<T>(url, { ...options, method: 'GET' }),
    
  post: <T>(url: string, data: any, options: RequestOptions = {}): Promise<T> => 
    fetchWithErrorHandling<T>(url, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  put: <T>(url: string, data: any, options: RequestOptions = {}): Promise<T> => 
    fetchWithErrorHandling<T>(url, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: <T>(url: string, options: RequestOptions = {}): Promise<T> => 
    fetchWithErrorHandling<T>(url, { ...options, method: 'DELETE' }),
};

/**
 * Clear all cached data
 */
export function clearApiCache(): void {
  etagCache.clear();
  
  // Clear localStorage cache
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('api_cache_')) {
      localStorage.removeItem(key);
    }
  });
} 