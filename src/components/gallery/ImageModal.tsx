import { useEffect, memo, useState, useCallback } from 'react';
import type { ImageItem } from '@/types/gallery';
import { getFullAssetUrl, calculateModalDimensions } from '@/core/utils/imageUtils';
import { Image } from '@/core/domain/Image';
import { API_BASE_URL } from '@/config/api';
import { Button } from '@nextui-org/button';

interface ImageModalProps {
  image: ImageItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal = ({ image, isOpen, onClose }: ImageModalProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [modalDimensions, setModalDimensions] = useState({ width: 0, height: 0 });
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  
  // Reset loaded state when image changes
  useEffect(() => {
    setImageLoaded(false);
    setCopyStatus('idle');
  }, [image]);
  
  // Calculate optimal modal dimensions based on viewport size
  const updateModalDimensions = useCallback(() => {
    // Calculate dimensions directly here to ensure they're correct
    const margin = 0.05; // 5% margin
    const width = Math.round(window.innerWidth * (1 - 2 * margin));
    const height = Math.round(window.innerHeight * (1 - 2 * margin));
    
    setModalDimensions({ width, height });
    console.log("Modal dimensions:", width, height); // Debugging
  }, []);
  
  // Update dimensions on mount and when window resizes
  useEffect(() => {
    if (!isOpen) return;
    
    // Initial calculation
    updateModalDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateModalDimensions);
    
    return () => {
      window.removeEventListener('resize', updateModalDimensions);
    };
  }, [isOpen, updateModalDimensions]);
  
  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Close on escape key
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  // Handle background scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle copy button timeout
  useEffect(() => {
    let timer: number;
    if (copyStatus === 'copied') {
      timer = window.setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [copyStatus]);
  
  // Don't render anything if no image or not open
  if (!image || !isOpen) {
    return null;
  }
  
  // Create domain model from image item
  const imageModel = new Image(image);
  
  // Get the full-size original image URL
  const originalImageUrl = image.asset 
    ? getFullAssetUrl(image.asset) 
    : image.url; // Fallback to url if asset is not available
  
  // Generate the API URL for copying
  const generateCopyUrl = () => {
    return `${API_BASE_URL}/image/id/${image.id}/${image.width}/${image.height}`;
  };
  
  const handleCopyClick = async () => {
    const url = generateCopyUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus('copied');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  // Calculate image display dimensions to maintain aspect ratio within the modal
  const imageDimensions = imageModel.getDisplayDimensions(
    modalDimensions.width * 0.95, // Leave a bit of padding inside the modal
    modalDimensions.height * 0.75  // Allocate more space for the image, less for details panel
  );
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal content - uses exactly 90% of viewport */}
      <div 
        className="relative z-10 flex flex-col bg-white rounded-xl overflow-hidden shadow-2xl"
        style={{
          width: `${modalDimensions.width}px`,
          height: `${modalDimensions.height}px`,
        }}
      >
        {/* Close button - positioned at the top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full text-gray-700 hover:text-gray-900 transition-colors shadow-md"
          aria-label="Close"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
        
        {/* Loading indicator */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
          </div>
        )}
        
        {/* Image container */}
        <div className="relative flex-grow overflow-hidden flex items-center justify-center p-4">
          <img
            src={originalImageUrl}
            alt={image.title}
            className={`transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="eager"
            decoding="async"
            onLoad={handleImageLoad}
            style={{ 
              width: `${imageDimensions.width}px`,
              height: `${imageDimensions.height}px`,
              objectFit: 'contain',
            }}
          />
        </div>
        
        {/* Details panel */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-900">{image.title}</h2>
            {image.description && (
              <p className="mt-2 text-gray-600">{image.description}</p>
            )}
            
            {/* Display tags */}
            {image.tags && image.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {image.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Image dimensions and copy button */}
            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Dimensions: {image.width} × {image.height}
              </div>
              
              {/* Copy URL button */}
              <Button
                color={copyStatus === 'copied' ? "success" : "primary"}
                variant="flat"
                size="sm"
                onClick={handleCopyClick}
                className="transition-colors"
              >
                {copyStatus === 'copied' ? (
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    已复制
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    复制链接
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ImageModal); 