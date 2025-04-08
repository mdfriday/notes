import type { ImageItem } from '../../types/gallery.ts';
import { imageApiService } from './imageApiService.ts';
import { API_FEATURES } from '../../config/api.ts';

// Flag to determine whether to use mock data or real API
const USE_MOCK_DATA = !API_FEATURES.USE_REAL_API;

// Function to generate random dimensions for Picsum images
const generateRandomDimensions = (): { width: number; height: number } => {
  // Generate random dimensions between 300-1000 for width and height
  const width = Math.floor(Math.random() * 700) + 300;
  const height = Math.floor(Math.random() * 700) + 300;
  return { width, height };
};

// Sample image data - used for mock mode
export const getMockImages = (): ImageItem[] => {
  return [
    {
      id: '1',
      uuid: '1',
      url: 'https://picsum.photos/600/400',
      title: 'Mountain Landscape',
      description: 'Beautiful mountain landscape with snow-capped peaks',
      width: 600,
      height: 400,
      tags: ['nature', 'mountains', 'landscape', 'snow'],
      asset: 'https://picsum.photos/600/400',
    }
  ];
};

// Function to paginate images - for mock mode
export const getPaginatedImages = (page: number, limit: number): ImageItem[] => {
  const allImages = getMockImages();
  const startIndex = (page - 1) * limit;
  return allImages.slice(startIndex, startIndex + limit);
};

// Get all unique tags - for mock mode
export const getAllTagsMock = (): string[] => {
  const allImages = getMockImages();
  const tagsSet = new Set<string>();

  for (const image of allImages) {
    for (const tag of image.tags) {
      tagsSet.add(tag);
    }
  }

  return Array.from(tagsSet).sort();
};

// Filter images by search term and/or tags - for mock mode
export const filterImagesMock = (searchTerm: string, selectedTags: string[] = []): ImageItem[] => {
  const allImages = getMockImages();

  return allImages.filter(image => {
    // Filter by search term (case insensitive)
    const matchesSearch = searchTerm === '' ||
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by tags
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => image.tags.includes(tag));

    return matchesSearch && matchesTags;
  });
};

// Get all tags - unifies API and mock implementation
export const getAllTags = async (): Promise<string[]> => {
  if (USE_MOCK_DATA) {
    return getAllTagsMock();
  }
  
  return await imageApiService.fetchAllTags();
};

// Fetch images with unified API
export const fetchImages = async (
  page = 1,
  limit = 15,
  searchTerm = '',
  selectedTags: string[] = []
): Promise<{ images: ImageItem[]; hasMore: boolean }> => {
  if (USE_MOCK_DATA) {
    // Prepare the mock data
    let images: ImageItem[];

    if (searchTerm || selectedTags.length > 0) {
      // If we have search or filters, apply them
      images = filterImagesMock(searchTerm, selectedTags);
      // Then paginate the filtered results
      const startIndex = (page - 1) * limit;
      const paginatedImages = images.slice(startIndex, startIndex + limit);
      
      return {
        images: paginatedImages,
        hasMore: startIndex + limit < images.length
      };
    } else {
      // Otherwise just paginate all images
      images = getPaginatedImages(page, limit);
      
      return {
        images,
        hasMore: page * limit < getMockImages().length
      };
    }
  }
  
  // Use the real API service
  return await imageApiService.fetchImages(page, limit, searchTerm, selectedTags);
}; 