import type { ImageItem } from '@/types/gallery';
import { memo, useState, useEffect, useRef } from 'react';
import { getGalleryThumbnailUrl } from '@/core/utils/imageUtils';
import { Image as DomainImage } from '@/core/domain/Image';

interface ImageCardProps {
  image: ImageItem;
  onClick: (image: ImageItem) => void;
  prefetched?: boolean;
}

const ImageCard = ({ image, onClick, prefetched = false }: ImageCardProps) => {
  const { id, title, description, tags, width, height } = image;
  // Create domain model from image item
  const imageModel = new DomainImage(image);
  
  // Use thumbnail URL that maintains the actual dimensions
  const thumbnailUrl = getGalleryThumbnailUrl(id, width, height);
  const [isLoaded, setIsLoaded] = useState(prefetched); // If prefetched, consider it loaded
  const [isVisible, setIsVisible] = useState(false);
  const [thumbnailDimensions, setThumbnailDimensions] = useState({ width: 0, height: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Extract thumbnail dimensions from URL
  useEffect(() => {
    // 解析URL中的宽高信息，格式：http://127.0.0.1:1314/image/id/5/200/136
    const match = thumbnailUrl.match(/\/(\d+)\/(\d+)$/);
    if (match) {
      const thumbWidth = parseInt(match[1], 10);
      const thumbHeight = parseInt(match[2], 10);
      setThumbnailDimensions({ width: thumbWidth, height: thumbHeight });
    }
  }, [thumbnailUrl]);
  
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
      const imgElement = new window.Image();
      imgElement.crossOrigin = "anonymous";
      imgElement.onload = handleImageLoad;
      imgElement.onerror = () => {
        console.error(`Failed to load image: ${thumbnailUrl}`);
      };
      imgElement.src = thumbnailUrl;
      
      return () => {
        imgElement.onload = null;
        imgElement.onerror = null;
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

  // 卡片的padding值，给图片周围留出空间
  const cardPadding = 16; // 8px on each side
  
  return (
    <div 
      ref={cardRef}
      className="relative group overflow-hidden rounded-lg shadow-md bg-white mb-4 transition-transform hover:shadow-xl hover:-translate-y-1 cursor-pointer" 
      onClick={handleClick}
      style={{ 
        // 设置卡片的固定宽度为缩略图宽度加上padding
        width: thumbnailDimensions.width > 0 
          ? thumbnailDimensions.width + (cardPadding * 2) 
          : 'auto'
      }}
    >
      {/* 图片容器 - 使用固定高度而不是按比例填充 */}
      <div 
        className="relative overflow-hidden" 
        style={{ 
          height: thumbnailDimensions.height > 0 
            ? thumbnailDimensions.height + cardPadding
            : 0,
          padding: cardPadding / 2
        }}
      >
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
        )}
        
        {/* 图片本身 - 使用原始尺寸 */}
        {(isVisible || prefetched) && (
          <img
            ref={imageRef}
            src={thumbnailUrl}
            alt={title}
            className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading={prefetched ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleImageLoad}
            width={thumbnailDimensions.width}
            height={thumbnailDimensions.height}
            style={{ 
              display: 'block',
              margin: '0 auto'
            }}
          />
        )}
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
          
          {/* Display thumbnail dimensions instead of original */}
          <div className="mt-2 text-xs text-gray-200">
            {thumbnailDimensions.width > 0 
              ? `${thumbnailDimensions.width} × ${thumbnailDimensions.height}` 
              : `${width} × ${height}`
            }
          </div>
        </div>
      )}
    </div>
  );
};

// Add memoization to prevent unnecessary re-renders
export default memo(ImageCard); 