import { useState, useCallback } from 'react';
import type { ImageItem } from '@/types/gallery';
import { fetchImages, getAllTags } from '@/core/services/imageService';

/**
 * Custom hook to manage gallery state
 */
export function useGalleryState() {
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

  /**
   * Load initial data (tags and first batch of images)
   */
  const loadInitialData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setLoading(true);
      setPage(1);

      // Fetch tags
      const tagsData = await getAllTags();
      setAllTags(tagsData);

      // Fetch initial images
      const { images: imagesData, hasMore: hasMoreData } = await fetchImages(1, 10, searchTerm, selectedTags);
      
      // Update state
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
  }, [searchTerm, selectedTags]);

  /**
   * Load more images for infinite scroll
   */
  const loadMoreImages = useCallback(async () => {
    if (!loading && hasMore) {
      try {
        setLoading(true);
        const nextPage = page + 1;
        
        // Fetch next batch of images
        const { images: newImages, hasMore: hasMoreData } = await fetchImages(nextPage, 10, searchTerm, selectedTags);
        
        // Update state with new images
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

  /**
   * Reset filters and reload images
   */
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedTags([]);
    setPage(1);
  }, []);

  /**
   * Open the modal with a selected image
   */
  const openImageModal = useCallback((image: ImageItem) => {
    setSelectedImage(image);
    setModalOpen(true);
  }, []);

  /**
   * Close the image modal
   */
  const closeImageModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return {
    // State
    images,
    loading,
    initialLoading,
    error,
    selectedImage,
    modalOpen,
    page,
    hasMore,
    searchTerm,
    allTags,
    selectedTags,
    
    // Actions
    setSearchTerm,
    setSelectedTags,
    loadInitialData,
    loadMoreImages,
    resetFilters,
    openImageModal,
    closeImageModal
  };
} 