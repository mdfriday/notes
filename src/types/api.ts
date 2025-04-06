/**
 * API Response Types
 */

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  // Add other common fields if needed, like message, status, etc.
}

// Image related types
export interface ApiImageItem {
  uuid: string;
  status: string;
  namespace: string;
  id: number;
  slug: string;
  hash: string;
  timestamp: number;
  updated: number;
  name: string;
  asset: string;
  tags: string[];
  width: number;
  height: number;
}

// Shortcode related types
export interface ApiShortcodeItem {
  uuid: string;
  status: string;
  namespace: string;
  id: number;
  slug: string;
  hash: string;
  timestamp: number;
  updated: number;
  name: string;
  template: string;
  example: string;
  asset: string;
  tags: string[];
  width: number;
  height: number;
}

// API Params
export interface ImageListParams {
  type: string;
  count: number;
  offset: number;
  order: string;
}

export interface ImageSearchParams extends ImageListParams {
  q: string;
}

export interface ImageTagsParams {
  type: string;
}

// Shortcode API Params
export interface ShortcodeListParams {
  type: string;
  count: number;
  offset: number;
  order: string;
}

export interface ShortcodeSearchParams extends ShortcodeListParams {
  q: string;
}

export interface ShortcodeTagsParams {
  type: string;
}

export interface ShortcodeDetailsParams {
  type: string;
  status?: string;
  id: number;
} 