import type { ImageItem } from '../types/gallery';

// Sample image data - in a real app, this would come from an API
export const getImages = (): ImageItem[] => {
  return [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1682685797366-715d29e33f9d',
      title: 'Mountain Landscape',
      description: 'Beautiful mountain landscape with snow-capped peaks',
      width: 1200,
      height: 1600,
      tags: ['nature', 'mountains', 'landscape', 'snow'],
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1682687981674-0927add86f2b',
      title: 'Coastal Sunset',
      description: 'Breathtaking sunset over the ocean with vibrant colors',
      width: 1600,
      height: 900,
      tags: ['nature', 'sunset', 'ocean', 'coast'],
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1682686581484-a2d3005abfcc',
      title: 'Urban Architecture',
      description: 'Modern architectural design in a bustling city center',
      width: 800,
      height: 1200,
      tags: ['urban', 'architecture', 'city', 'modern'],
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1682687221248-3116ba6ab483',
      title: 'Desert Landscape',
      description: 'Vast desert landscape with rolling sand dunes',
      width: 1920,
      height: 1080,
      tags: ['nature', 'desert', 'landscape', 'sand'],
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1683009427041-d810728a7cb6',
      title: 'Tropical Beach',
      description: 'Pristine tropical beach with palm trees and clear water',
      width: 1500,
      height: 1000,
      tags: ['nature', 'beach', 'tropical', 'ocean'],
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1682687981630-cefe9cd73072',
      title: 'Forest Path',
      description: 'Serene forest path with sunlight filtering through the trees',
      width: 1000,
      height: 1500,
      tags: ['nature', 'forest', 'path', 'sunlight'],
    },
    {
      id: '7',
      url: 'https://images.unsplash.com/photo-1682688759157-57988e10ffa8',
      title: 'Wildlife Photography',
      description: 'Close-up shot of a wild animal in its natural habitat',
      width: 1800,
      height: 1200,
      tags: ['nature', 'wildlife', 'animal', 'photography'],
    },
    {
      id: '8',
      url: 'https://images.unsplash.com/photo-1675088756705-08e78d7233e4',
      title: 'Mountainside Village',
      description: 'Charming village nestled on a mountainside with traditional architecture',
      width: 1200,
      height: 800,
      tags: ['architecture', 'village', 'mountains', 'traditional'],
    },
    {
      id: '9',
      url: 'https://images.unsplash.com/photo-1682685797828-d3b2561deef4',
      title: 'Aerial Cityscape',
      description: 'Stunning aerial view of a major metropolitan area at night',
      width: 2000,
      height: 1333,
      tags: ['urban', 'city', 'aerial', 'night'],
    },
    {
      id: '10',
      url: 'https://images.unsplash.com/photo-1678378385407-7566cea13168',
      title: 'Abstract Art',
      description: 'Colorful abstract art with geometric patterns and vibrant colors',
      width: 1100,
      height: 1650,
      tags: ['art', 'abstract', 'colorful', 'pattern'],
    },
    {
      id: '11',
      url: 'https://images.unsplash.com/photo-1682687982185-531d09ec56fc',
      title: 'Waterfall',
      description: 'Majestic waterfall cascading down rocky cliffs',
      width: 1300,
      height: 2000,
      tags: ['nature', 'waterfall', 'water', 'rocks'],
    },
    {
      id: '12',
      url: 'https://images.unsplash.com/photo-1682687218147-9806132dc697',
      title: 'Historic Architecture',
      description: 'Ancient architectural marvel showcasing historical craftsmanship',
      width: 2200,
      height: 1400,
      tags: ['architecture', 'historic', 'ancient', 'building'],
    },
    {
      id: '13',
      url: 'https://images.unsplash.com/photo-1682686581030-7fa4ea2b96c3',
      title: 'Autumn Scenery',
      description: 'Vibrant autumn scenery with trees displaying colorful foliage',
      width: 1600,
      height: 900,
      tags: ['nature', 'autumn', 'trees', 'foliage'],
    },
    {
      id: '14',
      url: 'https://images.unsplash.com/photo-1682687220989-ba05b6eebd39',
      title: 'Cityscape at Night',
      description: 'Mesmerizing cityscape with illuminated buildings at night',
      width: 1800,
      height: 1000,
      tags: ['urban', 'city', 'night', 'lights'],
    },
    {
      id: '15',
      url: 'https://images.unsplash.com/photo-1674463713009-863e61ee36e3',
      title: 'Mountain Lake',
      description: 'Crystal clear mountain lake reflecting surrounding peaks',
      width: 1400,
      height: 1800,
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
  return new Promise((resolve) => {
    setTimeout(() => {
      let images: ImageItem[];

      if (searchTerm || selectedTags.length > 0) {
        // If we have search or filters, apply them
        images = filterImages(searchTerm, selectedTags);
        // Then paginate the filtered results
        const startIndex = (page - 1) * limit;
        const paginatedImages = images.slice(startIndex, startIndex + limit);
        resolve({
          images: paginatedImages,
          hasMore: startIndex + limit < images.length
        });
      } else {
        // Otherwise just paginate all images
        images = getPaginatedImages(page, limit);
        resolve({
          images,
          hasMore: page * limit < getImages().length
        });
      }
    }, 800);
  });
}; 