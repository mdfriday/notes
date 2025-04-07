/**
 * Utility functions for working with shortcodes
 */
import { API_BASE_URL } from '../../config/api.ts';
import { ThumbnailParams } from '../../types/shortcode.ts';

/**
 * Calculate proportional dimensions to maintain aspect ratio
 */
export function calculateProportionalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  // Calculate aspect ratio
  const aspectRatio = originalWidth / originalHeight;
  
  // Start with max dimensions
  let width = maxWidth;
  let height = maxHeight;
  
  // Adjust based on aspect ratio
  if (aspectRatio > 1) {
    // Landscape orientation
    height = width / aspectRatio;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
  } else {
    // Portrait or square orientation
    width = height * aspectRatio;
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
  }
  
  // Round dimensions to integers
  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Generate thumbnail URL for shortcode assets
 */
export function getThumbnailUrl({
    id,
  assetUrl,
  width,
  height,
  maxWidth = 300,
  maxHeight = 300,
}: ThumbnailParams): string {
  // If assetUrl is already a full URL, return it as is
  if (assetUrl.startsWith('http')) {
    return assetUrl;
  }
  
  // Remove leading slash if present to ensure consistent formatting
  const cleanAssetUrl = assetUrl.startsWith('/') ? assetUrl.substring(1) : assetUrl;
  
  // Calculate proportional dimensions for thumbnail
  const { width: thumbWidth, height: thumbHeight } = calculateProportionalDimensions(
    width,
    height,
    maxWidth,
    maxHeight
  );

  // Return thumbnail URL in the format specified by the API
  return `${API_BASE_URL}/image/id/${id}/${thumbWidth}/${thumbHeight}`;
}

/**
 * Get full asset URL
 */
export function getFullAssetUrl(assetUrl: string): string {
  // If assetUrl is already a full URL, return it as is
  if (assetUrl.startsWith('http')) {
    return assetUrl;
  }
  
  // Remove leading slash if present to ensure consistent formatting
  const cleanAssetUrl = assetUrl.startsWith('/') ? assetUrl : `/${assetUrl}`;
  
  // Return full asset URL
  return `${API_BASE_URL}${cleanAssetUrl}`;
}

/**
 * Build search query for Shortcode tags
 */
export function buildShortcodeTagsQuery(tags: string[]): string {
  if (!tags || tags.length === 0) {
    return '';
  }
  
  // Format the query as "tags:tag1 OR tags:tag2 OR tags:tag3"
  return tags.map(tag => `tags:${tag}`).join(' OR ');
} 