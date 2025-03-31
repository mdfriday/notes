import { useEffect, memo, useState } from 'react';
import type { ImageItem } from '@/types/gallery';

interface ImageModalProps {
  image: ImageItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal = ({ image, isOpen, onClose }: ImageModalProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Close on escape key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position when modal closes
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
      
      // Reset image loaded state when modal closes
      setImageLoaded(false);
    }

    return () => {
      // Clean up in case component unmounts while modal is open
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle image load event
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (!isOpen || !image) {
    return null;
  }

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
            src={image.url}
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
        <div className="p-4 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{image.title}</h2>
          
          {image.description && (
            <p className="mt-2 text-gray-600">{image.description}</p>
          )}
          
          {image.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {image.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default memo(ImageModal); 