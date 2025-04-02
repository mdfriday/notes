import type { ImageItem } from '@/types/gallery';
import { memo, useState, useEffect, useRef } from 'react';
import { getGalleryThumbnailUrl } from '@/utils/imageUtils';

interface ImageCardProps {
  image: ImageItem;
  onClick: (image: ImageItem) => void;
  prefetched?: boolean;
}

const ImageCard = ({ image, onClick, prefetched = false }: ImageCardProps) => {
  const { title, description, tags, width, height } = image;
  // Use thumbnail URL for better performance
  const thumbnailUrl = getGalleryThumbnailUrl(width, height);
  const [isLoaded, setIsLoaded] = useState(prefetched); // If prefetched, consider it loaded
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Calculate aspect ratio for responsive sizing
  const aspectRatio = (height / width) * 100;
  
  // Handle click with a small performance optimization
  const handleClick = () => {
    onClick(image);
  };

  // Handle image load event
  const handleImageLoad = () => {
    setIsLoaded(true);
  };
  
  // Load the image only when component is visible
  useEffect(() => {
    if (prefetched) {
      // If already prefetched, mark as loaded immediately
      setIsLoaded(true);
      return;
    }
    
    // If the card is visible and image isn't loaded yet, load it
    if (isVisible && !isLoaded && imageRef.current) {
      // Use native loading attribute for better browser optimization
      imageRef.current.loading = 'eager';
      
      // Create a persistent image to avoid GC during scrolling
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = handleImageLoad;
      img.onerror = () => {
        console.error(`Failed to load image: ${thumbnailUrl}`);
      };
      img.src = thumbnailUrl;
      
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }
  }, [thumbnailUrl, isVisible, isLoaded, prefetched]);
  
  // Use Intersection Observer to track visibility more efficiently
  useEffect(() => {
    // Skip visibility detection if already prefetched and loaded
    if (prefetched) {
      setIsVisible(true);
      return;
    }
    
    const currentRef = cardRef.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          // Once visible, stop observing to reduce overhead
          observer.unobserve(currentRef);
        }
      },
      {
        rootMargin: '200px', // Load images a bit before they enter viewport
        threshold: 0.01,
      }
    );
    
    observer.observe(currentRef);
    
    return () => {
      observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, [prefetched]);
  
  return (
    <div 
      ref={cardRef}
      className="relative group overflow-hidden rounded-lg shadow-md bg-white mb-4 transition-transform hover:shadow-xl hover:-translate-y-1 cursor-pointer will-change-transform" 
      onClick={handleClick}
      style={{ contain: 'content' }}
    >
      {/* Image wrapper with aspect ratio */}
      <div className="relative overflow-hidden" style={{ paddingBottom: `${aspectRatio}%` }}>
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
        )}
        <img
          ref={imageRef}
          src={isVisible || prefetched ? thumbnailUrl : ''}
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading={prefetched ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleImageLoad}
          style={{ 
            willChange: 'transform',
            backfaceVisibility: 'hidden', 
            transform: 'translateZ(0)'
          }}
        />
      </div>
      
      {/* Gradient overlay - only render when visible for better performance */}
      {isVisible && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      
      {/* Content overlay - only render when visible for better performance */}
      {isVisible && (
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="text-white font-semibold text-lg line-clamp-1">{title}</h3>
          {description && (
            <p className="text-gray-200 text-sm mt-1 line-clamp-2">{description}</p>
          )}
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag} 
                  className="text-xs px-2 py-1 bg-black/30 text-white rounded-full backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs px-2 py-1 bg-black/30 text-white rounded-full backdrop-blur-sm">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Add memoization to prevent unnecessary re-renders
export default memo(ImageCard); 