import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ImageItem } from '@/types/gallery';
// Import components directly instead of lazy loading
import ImageCard from './ImageCard';
import ImageModal from './ImageModal';
import MasonryGrid from './MasonryGrid';
import SearchBar from './SearchBar';
import TagFilter from './TagFilter';
import { fetchImages, getAllTags } from '@/services/imageService';

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
  const prefetchImage = useCallback((url: string) => {
    // Use the global cache to avoid recreating images
    if (globalImageCache.has(url)) {
      return globalImageCache.get(url);
    }
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    globalImageCache.set(url, img);
    return img;
  }, []);

  // Batch process images to reduce load
  const prefetchImages = useCallback((imageItems: ImageItem[], priority = false) => {
    // High priority images load immediately, others use requestIdleCallback
    const processBatch = (batch: ImageItem[]) => {
      batch.forEach(image => prefetchImage(image.url));
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

        // Fetch tags
        const tagsData = getAllTags();
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

  // Image click handler
  const handleImageClick = useCallback((image: ImageItem) => {
    setSelectedImage(image);
    setModalOpen(true);
  }, []);

  // Modal close handler
  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  // Handle search with debounce effect
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Handle tag selection
  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTags(prevTags => {
      if (prevTags.includes(tag)) {
        return prevTags.filter(t => t !== tag);
      }
      return [...prevTags, tag];
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
    <div className="w-full" ref={galleryRef}>
      {/* Search and filters */}
      <div className="mb-8 space-y-4">
        <SearchBar onSearch={handleSearch} initialSearchTerm={searchTerm} />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <TagFilter
            tags={allTags}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
          />

          {(searchTerm || selectedTags.length > 0) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Images grid - only render visible images */}
      {images.length === 0 && !loading ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-600">No images found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="min-h-[50vh] relative will-change-transform">
          {/* Empty placeholders for scrollbar height */}
          {visibleStartIndex > 0 && (
            <div 
              style={{ 
                height: `${visibleStartIndex * 300}px`, // Approximate height per row
                width: '100%'
              }} 
              aria-hidden="true"
            />
          )}
          
          <MasonryGrid>
            {visibleImages.map((image) => (
              <div 
                key={image.id}
                ref={(ref) => setImageRef(image.id, ref)}
              >
                <ImageCard 
                  image={image} 
                  onClick={handleImageClick}
                  prefetched={globalImageCache.has(image.url)}
                />
              </div>
            ))}
          </MasonryGrid>
          
          {/* Empty placeholder for bottom space */}
          {visibleEndIndex < images.length - 1 && (
            <div 
              style={{ 
                height: `${(images.length - visibleEndIndex - 1) * 300}px`,
                width: '100%'
              }} 
              aria-hidden="true"
            />
          )}
        </div>
      )}

      {/* Loading indicator */}
      {(loading || hasMore) && (
        <div 
          ref={loadingRef} 
          className="w-full flex justify-center py-8"
        >
          {loading && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          )}
        </div>
      )}

      {/* Image modal */}
      <ImageModal
        image={selectedImage}
        isOpen={modalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default Gallery; 