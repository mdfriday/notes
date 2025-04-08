import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ImageItem } from '@/types/gallery';
// Import components directly instead of lazy loading
import ImageCard from './ImageCard';
import ImageModal from './ImageModal';
import MasonryGrid from './MasonryGrid';
import TagFilter from './TagFilter';
import { fetchImages, getAllTags } from '@/core/services/imageService';
import { getGalleryThumbnailUrl } from '@/core/utils/imageUtils';
import SearchInput from '../SearchInput';

// Global image cache to persist between renders
const globalImageCache = new Map<string, HTMLImageElement>();

// Helper to calculate if element is in viewport
const isInViewport = (element: HTMLElement, rootMargin = 300): boolean => {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight + rootMargin) &&
    rect.bottom >= -rootMargin
  );
};

const Gallery = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // Track visible start/end indices to only render visible images
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [visibleEndIndex, setVisibleEndIndex] = useState(20); // Initial render amount
  
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const scrollTimeout = useRef<number | null>(null);
  const lastScrollPosition = useRef(0);
  
  // Optimized image prefetching with proper caching
  const prefetchImage = useCallback((image: ImageItem) => {
    const thumbnailUrl = getGalleryThumbnailUrl(image.id, image.width, image.height);
    
    // Use the global cache to avoid recreating images
    if (globalImageCache.has(thumbnailUrl)) {
      return globalImageCache.get(thumbnailUrl);
    }
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = thumbnailUrl;
    globalImageCache.set(thumbnailUrl, img);
    return img;
  }, []);

  // Batch process images to reduce load
  const prefetchImages = useCallback((imageItems: ImageItem[], priority = false) => {
    // High priority images load immediately, others use requestIdleCallback
    const processBatch = (batch: ImageItem[]) => {
      batch.forEach(image => prefetchImage(image));
    };
    
    if (priority) {
      // Load important images immediately
      processBatch(imageItems.slice(0, 8)); 
      
      // Load the rest during idle time
      if (imageItems.length > 8) {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => {
            processBatch(imageItems.slice(8));
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => processBatch(imageItems.slice(8)), 200);
        }
      }
    } else {
      // Low priority - load during idle time
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          processBatch(imageItems);
        });
      } else {
        setTimeout(() => processBatch(imageItems), 500);
      }
    }
  }, [prefetchImage]);

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        setLoading(true);
        setPage(1);

        // Fetch tags - Fix the issue by awaiting the Promise
        const tagsData = await getAllTags();
        setAllTags(tagsData);

        // Fetch initial images
        const { images: imagesData, hasMore: hasMoreData } = await fetchImages(1, 12, searchTerm, selectedTags);
        
        // Update state
        setImages(imagesData);
        setHasMore(hasMoreData);
        setError(null);
        
        // Prefetch visible images with high priority
        prefetchImages(imagesData, true);
      } catch (err) {
        setError('Failed to load images. Please try again later.');
        console.error('Error loading images:', err);
      } finally {
        setInitialLoading(false);
        setLoading(false);
      }
    };

    loadInitialData();
  }, [searchTerm, selectedTags, prefetchImages]);

  // Load more images when scrolling
  const loadMoreImages = useCallback(async () => {
    if (!loading && hasMore) {
      try {
        setLoading(true);
        // Store scroll position
        lastScrollPosition.current = window.scrollY;
        
        const nextPage = page + 1;
        
        // Fetch next batch of images
        const { images: newImages, hasMore: hasMoreData } = await fetchImages(nextPage, 8, searchTerm, selectedTags);
        
        // Update state with new images
        setImages(prevImages => {
          const updatedImages = [...prevImages, ...newImages];
          // Prefetch new images with lower priority
          prefetchImages(newImages, false);
          return updatedImages;
        });
        
        setPage(nextPage);
        setHasMore(hasMoreData);
      } catch (err) {
        console.error('Error loading more images:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [loading, hasMore, page, searchTerm, selectedTags, prefetchImages]);

  // Update visible image indices based on scroll position - debounced
  const updateVisibleImages = useCallback(() => {
    // Clear any existing timeout
    if (scrollTimeout.current) {
      window.clearTimeout(scrollTimeout.current);
    }
    
    // Throttle updates to reduce CPU load
    scrollTimeout.current = window.setTimeout(() => {
      if (!galleryRef.current) return;
      
      // Calculate visible range with buffer for smoother scrolling
      const newVisibleIndices = {
        start: Math.max(0, visibleStartIndex - 4),
        end: Math.min(images.length - 1, visibleEndIndex + 4)
      };
      
      // Check each image card to see if it's in viewport
      imageRefs.current.forEach((ref, id) => {
        const index = images.findIndex(img => img.id === id);
        if (index !== -1 && isInViewport(ref)) {
          newVisibleIndices.start = Math.min(newVisibleIndices.start, index);
          newVisibleIndices.end = Math.max(newVisibleIndices.end, index);
        }
      });
      
      // Add buffer zones for smoother scrolling
      newVisibleIndices.start = Math.max(0, newVisibleIndices.start - 8);
      newVisibleIndices.end = Math.min(images.length - 1, newVisibleIndices.end + 8);
      
      // Update if changed
      if (newVisibleIndices.start !== visibleStartIndex || 
          newVisibleIndices.end !== visibleEndIndex) {
        setVisibleStartIndex(newVisibleIndices.start);
        setVisibleEndIndex(newVisibleIndices.end);
      }
      
      scrollTimeout.current = null;
    }, 100); // Delay to throttle calculations
  }, [images.length, visibleStartIndex, visibleEndIndex]);
  
  // Add ref to image container
  const setImageRef = useCallback((id: string, ref: HTMLDivElement | null) => {
    if (ref) {
      imageRefs.current.set(id, ref);
    } else {
      imageRefs.current.delete(id);
    }
  }, []);

  // Setup scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      updateVisibleImages();
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        window.clearTimeout(scrollTimeout.current);
      }
    };
  }, [updateVisibleImages]);

  // Setup infinite scrolling with improved loading threshold
  useEffect(() => {
    const currentLoadingRef = loadingRef.current;
    
    if (!currentLoadingRef) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMoreImages();
      }
    }, { 
      threshold: 0.1, 
      rootMargin: '300px' // Increase rootMargin to load earlier
    }); 
    
    observer.current.observe(currentLoadingRef);
    
    return () => {
      if (observer.current && currentLoadingRef) {
        observer.current.unobserve(currentLoadingRef);
      }
    };
  }, [hasMore, loading, loadMoreImages]);

  // Calculate which images to actually render
  const visibleImages = useMemo(() => {
    if (images.length === 0) return [];
    
    // Only render the visible slice of images
    return images.slice(visibleStartIndex, visibleEndIndex + 1);
  }, [images, visibleStartIndex, visibleEndIndex]);

  // Handle search term changes
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Handle tag selection
  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedTags([]);
  }, []);

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error && images.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center p-4 bg-red-50 rounded-lg max-w-md">
          <h3 className="text-red-800 text-lg font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={galleryRef}
      className="w-full h-full flex flex-col"
    >
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Image Gallery
        </h1>
        
        {/* Centered search input */}
        <div className="w-full max-w-xl mx-auto mb-6">
          <SearchInput 
            onSearch={handleSearch}
            initialValue={searchTerm}
            placeholder="Search images..."
            autoFocus={false}
          />
        </div>
        
        {/* Tags displayed below search */}
        {allTags.length > 0 && (
          <div className="w-full max-w-2xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {selectedTags.length > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-full text-sm font-medium transition-colors"
                >
                  Clear Filters
                </button>
              )}
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Main Gallery */}
      <div className="w-full flex-grow">
        {loading && images.length === 0 ? (
          // Loading state
          <div className="w-full h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 dark:border-gray-200"></div>
          </div>
        ) : error ? (
          // Error state
          <div className="w-full p-8 text-center">
            <p className="text-red-500">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : images.length === 0 ? (
          // Empty state
          <div className="w-full p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No images found. Try adjusting your search criteria.</p>
          </div>
        ) : (
          // Gallery grid with optimized rendering
          <MasonryGrid>
            {images.map((image, index) => (
              // Only render images within the visible range
              (index >= visibleStartIndex && index <= visibleEndIndex) && (
                <div 
                  key={image.id}
                  ref={(element) => element && setImageRef(image.id, element)}
                >
                  <ImageCard 
                    image={image}
                    onClick={(img) => {
                      setSelectedImage(img);
                      setModalOpen(true);
                    }}
                    prefetched={index < 12} // Pre-fetch first batch
                  />
                </div>
              )
            ))}
          </MasonryGrid>
        )}
        
        {/* Infinite scroll loading indicator */}
        {!initialLoading && hasMore && (
          <div 
            ref={loadingRef} 
            className="w-full flex justify-center py-8"
          >
            {loading && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-300"></div>
            )}
          </div>
        )}
      </div>
      
      {/* Image modal for full-size view */}
      <ImageModal 
        image={selectedImage}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default Gallery; 