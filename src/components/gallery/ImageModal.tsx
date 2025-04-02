import { useEffect, memo, useState } from 'react';
import type { ImageItem } from '@/types/gallery';
import { getFullAssetUrl } from '@/utils/imageUtils';

interface ImageModalProps {
  image: ImageItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal = ({ image, isOpen, onClose }: ImageModalProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Reset loaded state when image changes
  useEffect(() => {
    setImageLoaded(false);
  }, [image]);
  
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
  
  // Don't render anything if no image or not open
  if (!image || !isOpen) {
    return null;
  }
  
  // Get the full-size original image URL
  const originalImageUrl = image.asset 
    ? getFullAssetUrl(image.asset) 
    : image.url; // Fallback to url if asset is not available
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 will-change-transform">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
        style={{ 
          willChange: 'opacity',
          transform: 'translateZ(0)'
        }}
      />
      
      {/* Modal content */}
      <div className="relative z-10 max-w-7xl w-full max-h-[90vh] flex flex-col bg-white rounded-xl overflow-hidden shadow-2xl">
        {/* Loading indicator */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
          </div>
        )}
        
        {/* Image container */}
        <div className="relative flex-grow overflow-hidden">
          <img
            src={originalImageUrl}
            alt={image.title}
            className={`w-full h-full object-contain transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="eager"
            decoding="async"
            onLoad={handleImageLoad}
            style={{ 
              willChange: 'transform',
              transform: 'translateZ(0)'
            }}
          />
        </div>
        
        {/* Details panel */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{image.title}</h2>
              {image.description && (
                <p className="mt-1 text-gray-600">{image.description}</p>
              )}
              
              {/* Display tags */}
              {image.tags && image.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
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
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
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
          </div>
          
          {/* Image dimensions */}
          <div className="mt-2 text-sm text-gray-500">
            {image.width} × {image.height}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ImageModal); 