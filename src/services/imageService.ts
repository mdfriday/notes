import type { ImageItem } from '../types/gallery';

// Function to generate random dimensions for Picsum images
const generateRandomDimensions = (): { width: number; height: number } => {
  // Generate random dimensions between 300-1000 for width and height
  const width = Math.floor(Math.random() * 700) + 300;
  const height = Math.floor(Math.random() * 700) + 300;
  return { width, height };
};

// Sample image data - in a real app, this would come from an API
export const getImages = (): ImageItem[] => {
  return [
    {
      id: '1',
      url: 'https://picsum.photos/600/400',
      title: 'Mountain Landscape',
      description: 'Beautiful mountain landscape with snow-capped peaks',
      width: 600,
      height: 400,
      tags: ['nature', 'mountains', 'landscape', 'snow'],
    },
    {
      id: '2',
      url: 'https://picsum.photos/700/450',
      title: 'Coastal Sunset',
      description: 'Breathtaking sunset over the ocean with vibrant colors',
      width: 700,
      height: 450,
      tags: ['nature', 'sunset', 'ocean', 'coast'],
    },
    {
      id: '3',
      url: 'https://picsum.photos/500/800',
      title: 'Urban Architecture',
      description: 'Modern architectural design in a bustling city center',
      width: 500,
      height: 800,
      tags: ['urban', 'architecture', 'city', 'modern'],
    },
    {
      id: '4',
      url: 'https://picsum.photos/800/500',
      title: 'Desert Landscape',
      description: 'Vast desert landscape with rolling sand dunes',
      width: 800,
      height: 500,
      tags: ['nature', 'desert', 'landscape', 'sand'],
    },
    {
      id: '5',
      url: 'https://picsum.photos/600/600',
      title: 'Tropical Beach',
      description: 'Pristine tropical beach with palm trees and clear water',
      width: 600,
      height: 600,
      tags: ['nature', 'beach', 'tropical', 'ocean'],
    },
    {
      id: '6',
      url: 'https://picsum.photos/400/700',
      title: 'Forest Path',
      description: 'Serene forest path with sunlight filtering through the trees',
      width: 400,
      height: 700,
      tags: ['nature', 'forest', 'path', 'sunlight'],
    },
    {
      id: '7',
      url: 'https://picsum.photos/900/600',
      title: 'Wildlife Photography',
      description: 'Close-up shot of a wild animal in its natural habitat',
      width: 900,
      height: 600,
      tags: ['nature', 'wildlife', 'animal', 'photography'],
    },
    {
      id: '8',
      url: 'https://picsum.photos/750/450',
      title: 'Mountainside Village',
      description: 'Charming village nestled on a mountainside with traditional architecture',
      width: 750,
      height: 450,
      tags: ['architecture', 'village', 'mountains', 'traditional'],
    },
    {
      id: '9',
      url: 'https://picsum.photos/650/850',
      title: 'Aerial Cityscape',
      description: 'Stunning aerial view of a major metropolitan area at night',
      width: 650,
      height: 850,
      tags: ['urban', 'city', 'aerial', 'night'],
    },
    {
      id: '10',
      url: 'https://picsum.photos/550/550',
      title: 'Abstract Art',
      description: 'Colorful abstract art with geometric patterns and vibrant colors',
      width: 550,
      height: 550,
      tags: ['art', 'abstract', 'colorful', 'pattern'],
    },
    {
      id: '11',
      url: 'https://picsum.photos/500/750',
      title: 'Waterfall',
      description: 'Majestic waterfall cascading down rocky cliffs',
      width: 500,
      height: 750,
      tags: ['nature', 'waterfall', 'water', 'rocks'],
    },
    {
      id: '12',
      url: 'https://picsum.photos/850/550',
      title: 'Historic Architecture',
      description: 'Ancient architectural marvel showcasing historical craftsmanship',
      width: 850,
      height: 550,
      tags: ['architecture', 'historic', 'ancient', 'building'],
    },
    {
      id: '13',
      url: 'https://picsum.photos/700/500',
      title: 'Autumn Scenery',
      description: 'Vibrant autumn scenery with trees displaying colorful foliage',
      width: 700,
      height: 500,
      tags: ['nature', 'autumn', 'trees', 'foliage'],
    },
    {
      id: '14',
      url: 'https://picsum.photos/800/450',
      title: 'Cityscape at Night',
      description: 'Mesmerizing cityscape with illuminated buildings at night',
      width: 800,
      height: 450,
      tags: ['urban', 'city', 'night', 'lights'],
    },
    {
      id: '15',
      url: 'https://picsum.photos/600/800',
      title: 'Mountain Lake',
      description: 'Crystal clear mountain lake reflecting surrounding peaks',
      width: 600,
      height: 800,
      tags: ['nature', 'mountains', 'lake', 'water'],
    },
  ];
};

// Function to paginate images
export const getPaginatedImages = (page: number, limit: number): ImageItem[] => {
  const allImages = getImages();
  const startIndex = (page - 1) * limit;
  return allImages.slice(startIndex, startIndex + limit);
};

// Get all unique tags
export const getAllTags = (): string[] => {
  const allImages = getImages();
  const tagsSet = new Set<string>();

  for (const image of allImages) {
    for (const tag of image.tags) {
      tagsSet.add(tag);
    }
  }

  return Array.from(tagsSet).sort();
};

// Filter images by search term and/or tags
export const filterImages = (searchTerm: string, selectedTags: string[] = []): ImageItem[] => {
  const allImages = getImages();

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

// Simulate fetching images with a delay
export const fetchImages = async (
  page = 1,
  limit = 15,
  searchTerm = '',
  selectedTags: string[] = []
): Promise<{ images: ImageItem[]; hasMore: boolean }> => {
  // Prepare the data
  let images: ImageItem[];

  if (searchTerm || selectedTags.length > 0) {
    // If we have search or filters, apply them
    images = filterImages(searchTerm, selectedTags);
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
      hasMore: page * limit < getImages().length
    };
  }
}; 