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
const isInViewport = (element: HTMLElement, rootMargin = 500): boolean => {
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
  const [visibleEndIndex, setVisibleEndIndex] = useState(40); // 增加初始渲染数量，确保首屏加载更多图片
  
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const scrollTimeout = useRef<number | null>(null);
  const lastScrollPosition = useRef(0);
  const renderedIndices = useRef<Set<number>>(new Set()); // 跟踪已经渲染过的图片索引
  
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
      processBatch(imageItems.slice(0, 12)); // 增加优先加载的图片数量
      
      // Load the rest during idle time
      if (imageItems.length > 12) {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => {
            processBatch(imageItems.slice(12));
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => processBatch(imageItems.slice(12)), 200);
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
        renderedIndices.current.clear(); // 重置已渲染索引的跟踪

        // Fetch tags - Fix the issue by awaiting the Promise
        const tagsData = await getAllTags();
        setAllTags(tagsData);

        // Fetch initial images
        const { images: imagesData, hasMore: hasMoreData } = await fetchImages(1, 10, searchTerm, selectedTags);
        
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

  // 扩展可见范围以包含新加载的图片
  const extendVisibleRange = useCallback((newImages: ImageItem[], autoScroll = false) => {
    // 如果是小数据集（<50张图片），直接渲染全部
    if (images.length + newImages.length < 50) {
      setVisibleStartIndex(0);
      setVisibleEndIndex(images.length + newImages.length - 1);
      return;
    }
    
    // 否则确保至少包含所有新图片在可见范围内
    const currentEnd = visibleEndIndex;
    const newEnd = Math.max(
      currentEnd,
      images.length + Math.min(newImages.length, 20) - 1
    );
    
    setVisibleEndIndex(newEnd);
    
    // 将新加载的图片索引添加到已渲染集合中
    for (let i = images.length; i < images.length + newImages.length; i++) {
      renderedIndices.current.add(i);
    }
    
    // 如果需要自动滚动（例如搜索结果变化）
    if (autoScroll && newImages.length > 0) {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [images.length, visibleEndIndex]);

  // Load more images when scrolling - 改进加载更多图片的逻辑
  const loadMoreImages = useCallback(async () => {
    if (!loading && hasMore) {
      try {
        setLoading(true);
        // Store scroll position
        lastScrollPosition.current = window.scrollY;
        
        const nextPage = page + 1;
        
        // Fetch next batch of images
        const { images: newImages, hasMore: hasMoreData } = await fetchImages(nextPage, 10, searchTerm, selectedTags);
        
        if (newImages.length > 0) {
          // Update state with new images
          setImages(prevImages => {
            const updatedImages = [...prevImages, ...newImages];
            // Prefetch new images with lower priority
            prefetchImages(newImages, false);
            return updatedImages;
          });
          
          // 扩展可见范围以包含新加载的图片
          extendVisibleRange(newImages);
          
          setPage(nextPage);
        }
        
        setHasMore(hasMoreData && newImages.length > 0);
      } catch (err) {
        console.error('Error loading more images:', err);
      } finally {
        setLoading(false);
        
        // 恢复滚动位置 - 避免加载后页面跳动
        setTimeout(() => {
          if (lastScrollPosition.current > 0) {
            window.scrollTo(0, lastScrollPosition.current);
          }
        }, 50);
      }
    }
  }, [loading, hasMore, page, searchTerm, selectedTags, prefetchImages, extendVisibleRange]);

  // Update visible image indices based on scroll position - debounced
  const updateVisibleImages = useCallback(() => {
    // Clear any existing timeout
    if (scrollTimeout.current) {
      window.clearTimeout(scrollTimeout.current);
    }
    
    // Throttle updates to reduce CPU load
    scrollTimeout.current = window.setTimeout(() => {
      if (!galleryRef.current || images.length === 0) return;
      
      // 如果是小数据集，直接渲染全部
      if (images.length < 50) {
        setVisibleStartIndex(0);
        setVisibleEndIndex(images.length - 1);
        scrollTimeout.current = null;
        return;
      }
      
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
      
      // 增加缓冲区大小，确保滚动时有足够的预渲染区域
      newVisibleIndices.start = Math.max(0, newVisibleIndices.start - 15);
      newVisibleIndices.end = Math.min(images.length - 1, newVisibleIndices.end + 15);
      
      // 确保已渲染过的图片保持在可见范围内，防止重复渲染和闪烁
      renderedIndices.current.forEach(index => {
        if (index >= newVisibleIndices.start - 5 && index <= newVisibleIndices.end + 5) {
          // 如果已渲染过的图片接近可视区域，保留在渲染范围内
          newVisibleIndices.start = Math.min(newVisibleIndices.start, index);
          newVisibleIndices.end = Math.max(newVisibleIndices.end, index);
        }
      });
      
      // Update if changed
      if (newVisibleIndices.start !== visibleStartIndex || 
          newVisibleIndices.end !== visibleEndIndex) {
        setVisibleStartIndex(newVisibleIndices.start);
        setVisibleEndIndex(newVisibleIndices.end);
        
        // 更新已渲染索引集合
        for (let i = newVisibleIndices.start; i <= newVisibleIndices.end; i++) {
          renderedIndices.current.add(i);
        }
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
    
    // 初始运行一次，确保初始状态正确
    updateVisibleImages();
    
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
      rootMargin: '500px' // 增加rootMargin以提前加载
    }); 
    
    observer.current.observe(currentLoadingRef);
    
    return () => {
      if (observer.current && currentLoadingRef) {
        observer.current.unobserve(currentLoadingRef);
      }
    };
  }, [hasMore, loading, loadMoreImages]);

  // Calculate which images to actually render with smart optimization
  const visibleImages = useMemo(() => {
    if (images.length === 0) return [];
    
    // 小数据集时直接渲染所有图片
    if (images.length < 50) {
      return images;
    }
    
    // 对于大数据集，渲染可见部分
    const imagesToRender = images.slice(visibleStartIndex, visibleEndIndex + 1);
    
    // 如果渲染的图片数量太少，确保至少渲染一定数量的图片
    if (imagesToRender.length < 20 && images.length > 20) {
      return images.slice(0, Math.min(40, images.length));
    }
    
    return imagesToRender;
  }, [images, visibleStartIndex, visibleEndIndex]);

  // 监听images变化，确保新加载的图片被正确处理
  useEffect(() => {
    // 只在非初始加载阶段执行
    if (!initialLoading && !loading && images.length > 0) {
      updateVisibleImages();
    }
  }, [images.length, initialLoading, loading, updateVisibleImages]);

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
      
      {/* 添加调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/70 text-white text-xs p-2 rounded z-50">
          总图片: {images.length} | 
          可见: {visibleStartIndex}-{visibleEndIndex} | 
          渲染: {visibleImages.length} | 
          页: {page}
        </div>
      )}
      
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
              // 优化渲染条件：显示可见范围内的图片，确保之前显示过的图片不会消失
              ((index >= visibleStartIndex && index <= visibleEndIndex) || 
                renderedIndices.current.has(index)) && (
                <div 
                  key={image.id}
                  ref={(element) => element && setImageRef(image.id, element)}
                  data-index={index} // 添加索引属性便于调试
                >
                  <ImageCard 
                    image={image}
                    onClick={(img) => {
                      setSelectedImage(img);
                      setModalOpen(true);
                    }}
                    prefetched={index < 20} // 增加预取图片的数量
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