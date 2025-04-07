import { API_BASE_URL } from '../../config/api.ts';

interface ThumbnailOptions {
  id?: number;
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
 * Generate a thumbnail URL for an image
 */
export function getThumbnailUrl(
  originalWidth: number,
  originalHeight: number,
  options: ThumbnailOptions = {}
): string {
  const { maxWidth = 400, maxHeight = 300, maintainAspectRatio = true } = options;
  
  let width = options.width;
  let height = options.height;
  
  // If we need to maintain aspect ratio and width/height aren't explicitly set
  if (maintainAspectRatio && (!width || !height)) {
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
 */
export function getGalleryThumbnailUrl(
    id: number,
  originalWidth: number, 
  originalHeight: number
): string {
  // For gallery view, we want smaller thumbnails for better performance
  return getThumbnailUrl(originalWidth, originalHeight, {
    id,
    maxWidth: 400,  // Limit max width for gallery
    maxHeight: 600, // Allow taller images for masonry layout
    maintainAspectRatio: true
  });
} 