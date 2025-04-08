import { API_BASE_URL } from '../../config/api.ts';

interface ThumbnailOptions {
  id?: string;
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
}

/**
 * Get full URL for an asset
 */
export function getFullAssetUrl(assetPath: string): string {
  // Handle already absolute URLs
  if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
    return assetPath;
  }
  
  // Make sure assetPath starts with a slash
  const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  
  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Calculate proportional dimensions while maintaining aspect ratio
 */
export function calculateProportionalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  // If the image is smaller than the max dimensions, return original size
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }
  
  // Calculate the ratio of original dimensions
  const aspectRatio = originalWidth / originalHeight;
  
  // Calculate dimensions based on max constraints
  let width = maxWidth;
  let height = maxWidth / aspectRatio;
  
  // If the height is still too large, recalculate based on maxHeight
  if (height > maxHeight) {
    height = maxHeight;
    width = maxHeight * aspectRatio;
  }
  
  // Round to whole pixels
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Calculate optimal dimensions for modal display
 * Takes into account available viewport size and leaves 5% margin on all sides
 */
export function calculateModalDimensions(
  viewportWidth: number,
  viewportHeight: number
): { width: number; height: number } {
  // Calculate available space with exactly 5% margin on each side
  const margin = 0.05; // 5% margin
  const availableWidth = viewportWidth * (1 - 2 * margin);
  const availableHeight = viewportHeight * (1 - 2 * margin);
  
  return {
    width: Math.round(availableWidth),
    height: Math.round(availableHeight)
  };
}

/**
 * Generate a thumbnail URL for an image
 */
export function getThumbnailUrl(
  originalWidth: number,
  originalHeight: number,
  options: ThumbnailOptions = {}
): string {
  const { maxWidth = 200, maxHeight = 300, maintainAspectRatio = true } = options;
  
  let width = options.width;
  let height = options.height;
  
  // If we need to maintain aspect ratio and width/height aren't explicitly set
  if (maintainAspectRatio && (width && height)) {
    const dimensions = calculateProportionalDimensions(
      originalWidth,
      originalHeight,
      maxWidth,
      maxHeight
    );
    
    width = dimensions.width;
    height = dimensions.height;
  }
  
  // Default to maxWidth/maxHeight if not specified
  width = width || maxWidth;
  height = height || maxHeight;
  
  return `${API_BASE_URL}/image/id/${options.id}/${width}/${height}`;
}

/**
 * Generate a thumbnail URL for gallery view with optimal dimensions
 * Uses actual image dimensions instead of fixed values
 */
export function getGalleryThumbnailUrl(
  id: string,
  originalWidth: number, 
  originalHeight: number
): string {
  // For gallery thumbnails, use actual image dimensions to maintain clarity
  return getThumbnailUrl(originalWidth, originalHeight, {
    id,
    width: originalWidth,
    height: originalHeight,
    maintainAspectRatio: true
  });
} 