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
      url: 'https://picsum.photos/600/400',
      title: 'Mountain Landscape',
      description: 'Beautiful mountain landscape with snow-capped peaks',
      width: 600,
      height: 400,
      tags: ['nature', 'mountains', 'landscape', 'snow'],
      asset: 'https://picsum.photos/600/400',
    },
    {
      id: '2',
      url: 'https://picsum.photos/700/450',
      title: 'Coastal Sunset',
      description: 'Breathtaking sunset over the ocean with vibrant colors',
      width: 700,
      height: 450,
      tags: ['nature', 'sunset', 'ocean', 'coast'],
      asset: 'https://picsum.photos/700/450',
    },
    {
      id: '3',
      url: 'https://picsum.photos/500/800',
      title: 'Urban Architecture',
      description: 'Modern architectural design in a bustling city center',
      width: 500,
      height: 800,
      tags: ['urban', 'architecture', 'city', 'modern'],
      asset: 'https://picsum.photos/500/800',
    },
    {
      id: '4',
      url: 'https://picsum.photos/800/500',
      title: 'Desert Landscape',
      description: 'Vast desert landscape with rolling sand dunes',
      width: 800,
      height: 500,
      tags: ['nature', 'desert', 'landscape', 'sand'],
      asset: 'https://picsum.photos/800/500',
    },
    {
      id: '5',
      url: 'https://picsum.photos/600/600',
      title: 'Tropical Beach',
      description: 'Pristine tropical beach with palm trees and clear water',
      width: 600,
      height: 600,
      tags: ['nature', 'beach', 'tropical', 'ocean'],
      asset: 'https://picsum.photos/600/600',
    },
    {
      id: '6',
      url: 'https://picsum.photos/400/700',
      title: 'Forest Path',
      description: 'Serene forest path with sunlight filtering through the trees',
      width: 400,
      height: 700,
      tags: ['nature', 'forest', 'path', 'sunlight'],
      asset: 'https://picsum.photos/400/700',
    },
    {
      id: '7',
      url: 'https://picsum.photos/900/600',
      title: 'Wildlife Photography',
      description: 'Close-up shot of a wild animal in its natural habitat',
      width: 900,
      height: 600,
      tags: ['nature', 'wildlife', 'animal', 'photography'],
      asset: 'https://picsum.photos/900/600',
    },
    {
      id: '8',
      url: 'https://picsum.photos/750/450',
      title: 'Mountainside Village',
      description: 'Charming village nestled on a mountainside with traditional architecture',
      width: 750,
      height: 450,
      tags: ['architecture', 'village', 'mountains', 'traditional'],
      asset: 'https://picsum.photos/750/450',
    },
    {
      id: '9',
      url: 'https://picsum.photos/650/850',
      title: 'Aerial Cityscape',
      description: 'Stunning aerial view of a major metropolitan area at night',
      width: 650,
      height: 850,
      tags: ['urban', 'city', 'aerial', 'night'],
      asset: 'https://picsum.photos/650/850',
    },
    {
      id: '10',
      url: 'https://picsum.photos/550/550',
      title: 'Abstract Art',
      description: 'Colorful abstract art with geometric patterns and vibrant colors',
      width: 550,
      height: 550,
      tags: ['art', 'abstract', 'colorful', 'pattern'],
      asset: 'https://picsum.photos/550/550',
    },
    {
      id: '11',
      url: 'https://picsum.photos/500/750',
      title: 'Waterfall',
      description: 'Majestic waterfall cascading down rocky cliffs',
      width: 500,
      height: 750,
      tags: ['nature', 'waterfall', 'water', 'rocks'],
      asset: 'https://picsum.photos/500/750',
    },
    {
      id: '12',
      url: 'https://picsum.photos/850/550',
      title: 'Historic Architecture',
      description: 'Ancient architectural marvel showcasing historical craftsmanship',
      width: 850,
      height: 550,
      tags: ['architecture', 'historic', 'ancient', 'building'],
      asset: 'https://picsum.photos/850/550',
    },
    {
      id: '13',
      url: 'https://picsum.photos/700/500',
      title: 'Autumn Scenery',
      description: 'Vibrant autumn scenery with trees displaying colorful foliage',
      width: 700,
      height: 500,
      tags: ['nature', 'autumn', 'trees', 'foliage'],
      asset: 'https://picsum.photos/700/500',
    },
    {
      id: '14',
      url: 'https://picsum.photos/800/450',
      title: 'Cityscape at Night',
      description: 'Mesmerizing cityscape with illuminated buildings at night',
      width: 800,
      height: 450,
      tags: ['urban', 'city', 'night', 'lights'],
      asset: 'https://picsum.photos/800/450',
    },
    {
      id: '15',
      url: 'https://picsum.photos/600/800',
      title: 'Mountain Lake',
      description: 'Crystal clear mountain lake reflecting surrounding peaks',
      width: 600,
      height: 800,
      tags: ['nature', 'mountains', 'lake', 'water'],
      asset: 'https://picsum.photos/600/800',
    },
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