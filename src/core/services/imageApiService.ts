/**
 * Service for communicating with the backend API to fetch images, tags, and handle search operations
 */
import { 
  API_ENDPOINTS, 
  DEFAULT_REQUEST_PARAMS 
} from '../../config/api.ts';
import { 
  ApiResponse, 
  ApiImageItem, 
  ImageListParams, 
  ImageSearchParams, 
  ImageTagsParams 
} from '../../types/api.ts';
import { ImageItem } from '../../types/gallery.ts';
import { api } from '@/core/utils/apiUtils.ts';

/**
 * Maps API Image item to the app's ImageItem format
 */
function mapApiImageToImageItem(apiImage: ApiImageItem): ImageItem {
  return {
    id: String(apiImage.id),
    uuid: apiImage.uuid,
    url: apiImage.asset,
    title: apiImage.name,
    description: apiImage.slug !== apiImage.name ? apiImage.slug : undefined,
    width: apiImage.width,
    height: apiImage.height,
    tags: apiImage.tags,
    asset: apiImage.asset,
  };
}

/**
 * Transform array of tags from API format to flat array
 */
function flattenTagsArray(tagsArray: string[][]): string[] {
  return tagsArray.flat().filter(Boolean);
}

/**
 * Constructs search query for API from search term and tags
 */
function buildSearchQuery(searchTerm: string, selectedTags: string[]): string {
  const parts: string[] = [];
  
  // Add search term for multiple fields if exists
  if (searchTerm.trim()) {
    // Search across multiple fields with OR condition
    const searchTermTrimmed = searchTerm.trim();
    const searchFields = [
      `name:${searchTermTrimmed}`,
      `description:${searchTermTrimmed}`,
      `tags:${searchTermTrimmed}`
    ];
    
    // Add the field searches WITHOUT wrapping in parentheses for simple queries
    // Bleve doesn't need parentheses for simple OR conditions
    parts.push(searchFields.join(' OR '));
    console.log('Added search term conditions:', searchFields.join(' OR '));
  }
  
  // Add tags filter
  if (selectedTags.length > 0) {
    // Format: "tags:Tag1 OR tags:Tag2 OR tags:Tag3"
    const tagsQuery = selectedTags
      .map(tag => `tags:${tag}`)
      .join(' OR ');
    
    // No parentheses for simple tag filters
    parts.push(tagsQuery);
    console.log('Added tag filter conditions:', tagsQuery);
  }
  
  // Join with AND if we have multiple parts to ensure both search term and tags are matched
  // Only use parentheses for complex queries where we have multiple parts
  let finalQuery = '';
  if (parts.length > 1) {
    // For complex queries with multiple conditions, use parentheses for proper grouping
    finalQuery = parts.map(part => `(${part})`).join(' AND ');
  } else {
    // For simple queries, no parentheses needed
    finalQuery = parts[0] || '';
  }
  
  console.log('Final constructed query:', finalQuery);
  
  // Return the raw query without any URL encoding - the api utility will handle proper encoding
  return finalQuery;
}

/**
 * Image API service for fetching images and tags from the backend
 */
export const imageApiService = {
  /**
   * Fetch images with pagination
   */
  async fetchImages(
    page = 1,
    limit = DEFAULT_REQUEST_PARAMS.count,
    searchTerm = '',
    selectedTags: string[] = []
  ): Promise<{ images: ImageItem[]; hasMore: boolean }> {
    const offset = (page - 1) * limit;
    
    try {
      // Determine if we should use search or regular images endpoint
      const hasFilters = searchTerm.trim() !== '' || selectedTags.length > 0;
      
      // Set up common params
      const params: Record<string, string | number> = {
        type: DEFAULT_REQUEST_PARAMS.type,
        count: limit,
        offset,
        order: DEFAULT_REQUEST_PARAMS.order,
      };
      
      // Log what we're about to do
      console.log('Fetching images with:', { 
        endpoint: hasFilters ? 'search' : 'list',
        page, 
        limit, 
        searchTerm: searchTerm.trim(), 
        selectedTags,
        params 
      });
      
      let response: Record<string, any>; 
      
      if (hasFilters) {
        // Use search endpoint with enhanced query
        const searchQuery = buildSearchQuery(searchTerm, selectedTags);
        
        // Only add query param if we have a valid query
        if (searchQuery) {
          const searchParams: Record<string, string | number> = {
            ...params,
            q: searchQuery,
          };
          
          console.log('Search query:', searchQuery);
          console.log('Search params:', searchParams);
          
          // Log API URL being used for debugging
          const endpoint = API_ENDPOINTS.IMAGE_SEARCH;
          console.log('Search API URL format:', `${endpoint}?${new URLSearchParams(searchParams as any).toString()}`);
          console.log('After encoding fixes, the URL should use %20 instead of + for spaces');
          
          response = await api.get<Record<string, any>>(
            API_ENDPOINTS.IMAGE_SEARCH,
            { params: searchParams }
          );
        } else {
          // Fallback to regular endpoint if query is empty
          console.log('Empty search query, using regular endpoint');
          response = await api.get<Record<string, any>>(
            API_ENDPOINTS.IMAGES,
            { params }
          );
        }
      } else {
        // Use regular images endpoint
        response = await api.get<Record<string, any>>(
          API_ENDPOINTS.IMAGES,
          { params }
        );
      }
      
      // Log the raw response for debugging
      console.log('API response structure:', JSON.stringify(response, null, 2));
      
      // Validate that we received a valid response
      if (!response) {
        console.error('Empty API response');
        return { images: [], hasMore: false };
      }
      
      // Handle the response structure correctly (API returns { data: [...] })
      if (!response.data) {
        console.error('API response missing data field:', response);
        return { images: [], hasMore: false };
      }
      
      // Check if response.data is an array
      if (!Array.isArray(response.data)) {
        console.error('API response data is not an array:', response.data);
        return { images: [], hasMore: false };
      }
      
      // Map API images to app's ImageItem format
      const images = response.data.map((apiImage: ApiImageItem) => {
        try {
          return mapApiImageToImageItem(apiImage);
        } catch (err) {
          console.error('Error mapping API image:', apiImage, err);
          return null;
        }
      }).filter(Boolean) as ImageItem[]; // Remove any null items
      
      // Determine if there are more images
      const hasMore = images.length === limit;
      
      console.log(`Fetched ${images.length} images, hasMore: ${hasMore}`);
      
      return { images, hasMore };
    } catch (error) {
      console.error('Error fetching images:', error);
      return { images: [], hasMore: false };
    }
  },
  
  /**
   * Fetch all image tags
   */
  async fetchAllTags(): Promise<string[]> {
    try {
      console.log('Fetching all image tags');
      
      const params: Record<string, string> = {
        type: DEFAULT_REQUEST_PARAMS.type,
      };
      
      const response = await api.get<Record<string, any>>(
        API_ENDPOINTS.IMAGE_TAGS,
        { params }
      );
      
      console.log('Tags API response:', JSON.stringify(response, null, 2));
      
      // Validate that we received a valid response
      if (!response || !response.data) {
        console.error('Invalid API response for tags:', response);
        return [];
      }
      
      // API returns { data: [[tag1, tag2, ...]] }
      if (!Array.isArray(response.data)) {
        console.error('Tags data is not an array:', response.data);
        return [];
      }
      
      const tags = flattenTagsArray(response.data);
      console.log('Processed tags:', tags);
      
      return tags;
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  },
}; 