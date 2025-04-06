/**
 * Service for communicating with the backend API to fetch shortcodes, tags, and handle search operations
 */
import { 
  API_ENDPOINTS, 
  SHORTCODE_REQUEST_PARAMS 
} from '../config/api';
import {
  ApiResponse,
  ApiShortcodeItem,
  ShortcodeListParams,
  ShortcodeSearchParams,
  ShortcodeTagsParams,
  ShortcodeDetailsParams
} from '../types/api';
import { 
  ShortcodeItem, 
  ShortcodeSearchResult,
  ShortcodeMetadata
} from '../types/shortcode';
import { api } from '../utils/apiUtils';
import { 
  getThumbnailUrl, 
  getFullAssetUrl, 
  buildShortcodeTagsQuery 
} from '../utils/shortcodeUtils';

/**
 * Maps API Shortcode item to the app's ShortcodeItem format
 */
function mapApiShortcodeToShortcodeItem(apiShortcode: ApiShortcodeItem): ShortcodeItem {
  return {
    id: apiShortcode.uuid,
    title: apiShortcode.name,
    slug: apiShortcode.slug,
    description: apiShortcode.slug !== apiShortcode.name ? apiShortcode.slug : undefined,
    template: apiShortcode.template,
    example: apiShortcode.example,
    tags: apiShortcode.tags,
    asset: getFullAssetUrl(apiShortcode.asset),
    thumbnail: getThumbnailUrl({
      assetUrl: apiShortcode.asset,
      width: apiShortcode.width,
      height: apiShortcode.height
    }),
    width: apiShortcode.width,
    height: apiShortcode.height,
  };
}

/**
 * Transform array of tags from API format to flat array
 */
function flattenTagsArray(tagsArray: string[][]): string[] {
  return tagsArray.flat().filter(Boolean);
}

/**
 * Shortcode API service for fetching shortcodes and tags from the backend
 */
export const shortcodeApiService = {
  /**
   * Fetch shortcodes with pagination
   */
  async fetchShortcodes(
    page = 1,
    limit = SHORTCODE_REQUEST_PARAMS.count,
    selectedTags: string[] = []
  ): Promise<ShortcodeSearchResult> {
    const offset = (page - 1) * limit;
    
    try {
      console.log('Fetching shortcodes with:', { page, limit, selectedTags });
      
      let response: Record<string, any>;
      const params: Record<string, string | number> = {
        type: SHORTCODE_REQUEST_PARAMS.type,
        count: limit,
        offset,
        order: SHORTCODE_REQUEST_PARAMS.order,
      };
      
      // Determine if we should use search or regular endpoint
      if (selectedTags.length > 0) {
        // Build search query for tags
        const searchQuery = buildShortcodeTagsQuery(selectedTags);
        
        const searchParams = {
          ...params,
          q: searchQuery,
        };
        
        console.log('Search query for tags:', searchQuery);
        console.log('Search params:', searchParams);
        
        response = await api.get<ApiResponse<ApiShortcodeItem[]>>(
          API_ENDPOINTS.SHORTCODE_SEARCH,
          { params: searchParams }
        );
      } else {
        // Use regular shortcodes endpoint
        response = await api.get<ApiResponse<ApiShortcodeItem[]>>(
          API_ENDPOINTS.SHORTCODES,
          { params }
        );
      }
      
      // Log the raw response for debugging
      console.log('API response structure:', JSON.stringify(response, null, 2));
      
      // Validate that we received a valid response
      if (!response || !response.data) {
        console.error('Invalid API response:', response);
        return { shortcodes: [], hasMore: false };
      }
      
      // Map API shortcodes to app's ShortcodeItem format
      const shortcodes = response.data.map((apiShortcode: ApiShortcodeItem) => {
        try {
          return mapApiShortcodeToShortcodeItem(apiShortcode);
        } catch (err) {
          console.error('Error mapping API shortcode:', apiShortcode, err);
          return null;
        }
      }).filter(Boolean) as ShortcodeItem[]; // Remove any null items
      
      // Determine if there are more shortcodes
      const hasMore = shortcodes.length === limit;
      
      console.log(`Fetched ${shortcodes.length} shortcodes, hasMore: ${hasMore}`);
      
      return { shortcodes, hasMore };
    } catch (error) {
      console.error('Error fetching shortcodes:', error);
      return { shortcodes: [], hasMore: false };
    }
  },
  
  /**
   * Fetch all shortcode tags
   */
  async fetchAllTags(): Promise<string[]> {
    try {
      console.log('Fetching all shortcode tags');
      
      const params: Record<string, string> = {
        type: SHORTCODE_REQUEST_PARAMS.type,
      };
      
      const response = await api.get<ApiResponse<string[][]>>(
        API_ENDPOINTS.SHORTCODE_TAGS,
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
  
  /**
   * Fetch a specific shortcode by ID
   */
  async fetchShortcodeById(id: number): Promise<ShortcodeItem | null> {
    try {
      console.log(`Fetching shortcode with ID: ${id}`);
      
      const params: Record<string, string | number | undefined> = {
        type: SHORTCODE_REQUEST_PARAMS.type,
        id,
        status: undefined // Optional parameter, only include if needed
      };
      
      const response = await api.get<ApiResponse<ApiShortcodeItem[]>>(
        API_ENDPOINTS.SHORTCODE_DETAILS,
        { params }
      );
      
      console.log('Shortcode details API response:', JSON.stringify(response, null, 2));
      
      // Validate that we received a valid response
      if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
        console.error('Invalid API response for shortcode details:', response);
        return null;
      }
      
      // Map API shortcode to app's ShortcodeItem format
      return mapApiShortcodeToShortcodeItem(response.data[0]);
    } catch (error) {
      console.error(`Error fetching shortcode with ID: ${id}`, error);
      return null;
    }
  },
  
  /**
   * Fetch a specific shortcode by slug
   */
  async fetchShortcodeBySlug(slug: string): Promise<ShortcodeItem | null> {
    try {
      console.log(`Fetching shortcode with slug: ${slug}`);
      
      // Use search to find by slug
      const params: Record<string, string | number> = {
        type: SHORTCODE_REQUEST_PARAMS.type,
        count: 1,
        offset: 0,
        q: `slug:${slug}`
      };
      
      const response = await api.get<ApiResponse<ApiShortcodeItem[]>>(
        API_ENDPOINTS.SHORTCODE_SEARCH,
        { params }
      );
      
      console.log('Shortcode by slug API response:', JSON.stringify(response, null, 2));
      
      // Validate that we received a valid response
      if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
        console.error('Invalid API response for shortcode by slug:', response);
        return null;
      }
      
      // Map API shortcode to app's ShortcodeItem format
      return mapApiShortcodeToShortcodeItem(response.data[0]);
    } catch (error) {
      console.error(`Error fetching shortcode with slug: ${slug}`, error);
      return null;
    }
  },
  
  /**
   * Create shortcode metadata from a ShortcodeItem
   */
  createShortcodeMetadata(shortcode: ShortcodeItem): ShortcodeMetadata {
    return {
      id: parseInt(shortcode.id, 10) || 0, // Convert string id to number
      name: shortcode.title,
      template: shortcode.template,
      uuid: shortcode.id,
      tags: shortcode.tags
    };
  }
}; 