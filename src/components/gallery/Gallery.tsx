import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import type { ImageItem } from '@/types/gallery';
// Lazy load the components
const ImageCard = lazy(() => import('./ImageCard'));
const ImageModal = lazy(() => import('./ImageModal'));
const MasonryGrid = lazy(() => import('./MasonryGrid'));
const SearchBar = lazy(() => import('./SearchBar'));
const TagFilter = lazy(() => import('./TagFilter'));
import { fetchImages, getAllTags } from '@/services/imageService';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
  </div>
);

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
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        setLoading(true);
        setPage(1);

        const tagsData = getAllTags();
        setAllTags(tagsData);

        const { images: imagesData, hasMore: hasMoreData } = await fetchImages(1, 8, searchTerm, selectedTags);
        setImages(imagesData);
        setHasMore(hasMoreData);
        setError(null);
      } catch (err) {
        setError('Failed to load images. Please try again later.');
        console.error('Error loading images:', err);
      } finally {
        setInitialLoading(false);
        setLoading(false);
      }
    };

    loadInitialData();
  }, [searchTerm, selectedTags]);

  // Create memoized loadMoreImages callback to prevent recreation on each render
  const loadMoreImages = useCallback(async () => {
    if (!loading && hasMore) {
      try {
        setLoading(true);
        const nextPage = page + 1;
        const { images: newImages, hasMore: hasMoreData } = await fetchImages(nextPage, 8, searchTerm, selectedTags);

        setImages(prevImages => [...prevImages, ...newImages]);
        setPage(nextPage);
        setHasMore(hasMoreData);
      } catch (err) {
        console.error('Error loading more images:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [loading, hasMore, page, searchTerm, selectedTags]);

  // Setup infinite scrolling
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
    }, { threshold: 0.1, rootMargin: '100px' });
    
    observer.current.observe(currentLoadingRef);
    
    return () => {
      if (observer.current && currentLoadingRef) {
        observer.current.unobserve(currentLoadingRef);
      }
    };
  }, [hasMore, loading, loadMoreImages]);

  const handleImageClick = (image: ImageItem) => {
    setSelectedImage(image);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    setSelectedTags(prevTags => {
      if (prevTags.includes(tag)) {
        return prevTags.filter(t => t !== tag);
      }
      return [...prevTags, tag];
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

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
    <div className="w-full">
      {/* Search and filters */}
      <div className="mb-8 space-y-4">
        <Suspense fallback={<LoadingFallback />}>
          <SearchBar onSearch={handleSearch} initialSearchTerm={searchTerm} />
        </Suspense>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Suspense fallback={<LoadingFallback />}>
            <TagFilter
              tags={allTags}
              selectedTags={selectedTags}
              onTagSelect={handleTagSelect}
            />
          </Suspense>

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

      {/* Images grid */}
      {images.length === 0 && !loading ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-600">No images found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <Suspense fallback={<LoadingFallback />}>
          <MasonryGrid>
            {images.map((image) => (
              <Suspense key={image.id} fallback={<div className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
                <ImageCard image={image} onClick={handleImageClick} />
              </Suspense>
            ))}
          </MasonryGrid>
        </Suspense>
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
      <Suspense fallback={null}>
        <ImageModal
          image={selectedImage}
          isOpen={modalOpen}
          onClose={closeModal}
        />
      </Suspense>
    </div>
  );
};

export default Gallery; 