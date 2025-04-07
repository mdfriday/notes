/**
 * Shortcode Types
 */

// Represents a shortcode item in the application
export interface ShortcodeItem {
  id: string; // uuid
  title: string; // name
  slug: string;
  description?: string;
  template: string;
  example: string;
  tags: string[];
  asset: string; // Image URL
  thumbnail: string; // Thumbnail URL
  width: number;
  height: number;
}

// Shortcode metadata for registration
export interface ShortcodeMetadata {
  id: number;
  name: string;
  template: string;
  uuid?: string;
  tags?: string[];
}

// Parameters for getThumbnailUrl
export interface ThumbnailParams {
  id: number;
  assetUrl: string;
  width: number;
  height: number;
  maxWidth?: number;
  maxHeight?: number;
}

// Result from shortcode search
export interface ShortcodeSearchResult {
  shortcodes: ShortcodeItem[];
  hasMore: boolean;
} 