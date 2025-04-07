# API Integration

This directory contains services for integrating with the backend API. The services are designed to be modular and reusable, with a focus on minimizing code duplication.

## Architecture

The API integration is built with the following components:

- **API Configuration (`src/config/api.ts`)**: Contains environment-specific configurations and endpoints.
- **API Utilities (`src/utils/apiUtils.ts`)**: Provides shared functionality for making HTTP requests with error handling and caching.
- **API Types (`src/types/api.ts`)**: Defines TypeScript interfaces for API request/response data.
- **API Services (`src/services/imageApiService.ts`)**: Implements specific API endpoints and handles data transformation.
- **Mock Integration (`src/services/imageService.ts`)**: Provides a unified interface that can toggle between mock data and real API.

## Using the API

To work with the image API, use the `imageService.ts` file which provides the following functions:

- `fetchImages(page, limit, searchTerm, selectedTags)`: Fetches images with pagination and filtering
- `getAllTags()`: Fetches all available image tags

Example:

```typescript
import { fetchImages, getAllTags } from '@/services/imageService';

// Fetch first page of images
const { images, hasMore } = await fetchImages(1, 10);

// Fetch images with search
const searchResults = await fetchImages(1, 10, 'mountain', ['nature']);

// Get all tags
const tags = await getAllTags();
```

## Switching Between Mock and Real API

By default, the system uses mock data. To enable the real API:

1. Create a `.env.local` file in the project root
2. Add `VITE_USE_REAL_API=true` to use the real API

## Configuration

You can configure the API in different environments:

- **Development**: API calls go to `http://127.0.0.1:1314` by default
- **Production**: API calls go to `/api` which should be proxied to the actual backend
- **Custom**: Set `VITE_API_BASE_URL` in your `.env` file to override the default URL

## Caching

The API implementation includes built-in caching with ETag support:

- Requests automatically include `If-None-Match` headers for cached resources
- 304 responses use cached data from localStorage
- Cache expiry follows the server's `max-age` directive

To clear the cache programmatically:

```typescript
import { clearApiCache } from '@/utils/apiUtils';

clearApiCache();
```

## Search Functionality

The API integration includes an enhanced search feature that allows users to find images based on various criteria:

### Search Term Functionality

When a user enters a search term in the search box, the API will search across multiple fields:

- Image name
- Image description
- Image tags

This means that a user can type any keyword and find images where that keyword appears in any of these fields, making search more powerful and intuitive.

### Query Structure

The search query is constructed with the following logic:

1. **Search Term**: When a search term is entered, it searches across multiple fields:
   ```
   (name:searchTerm OR description:searchTerm OR tags:searchTerm)
   ```

2. **Tag Filters**: When tags are selected, they're combined with OR logic:
   ```
   (tags:Tag1 OR tags:Tag2 OR tags:Tag3)
   ```

3. **Combined Filters**: When both search term and tags are used, they're combined with AND logic:
   ```
   (name:searchTerm OR description:searchTerm OR tags:searchTerm) AND (tags:Tag1 OR tags:Tag2)
   ```

This query structure ensures that users can perform powerful searches that match their intent. 

### Bleve Search Engine Compatibility

The backend uses Bleve as the search engine, which requires specific formatting for its query syntax:

1. **URL Encoding**: Space characters in queries must be encoded as `%20` instead of `+`. The API utilities handle this automatically.

2. **Query Format**: Queries follow Bleve's query string syntax:
   - Field searches use the format `field:term`
   - Logical operators: `AND`, `OR`
   - Parentheses are only used for complex queries with multiple conditions

3. **Simple Query Examples**:
   ```
   name:beach OR description:beach OR tags:beach
   ```
   Will be URL-encoded as:
   ```
   name:beach%20OR%20description:beach%20OR%20tags:beach
   ```

4. **Complex Query Example** (with both search term and tags):
   ```
   (name:beach OR description:beach OR tags:beach) AND (tags:Nature OR tags:Sunset)
   ```
   Only in this case do we need parentheses to group the conditions properly. 