import type { ImageItem } from '@/types/gallery';
import { memo, useState, useEffect, useRef } from 'react';
import { getGalleryThumbnailUrl } from '@/core/utils/imageUtils';
import { Image as DomainImage } from '@/core/domain/Image';
import Popover, { PopoverPosition } from '@/components/ui/Popover';
import { calculateBestPosition } from '@/core/utils/popoverUtils';

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
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({ top: 0, left: 0 });
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

  // Handle mouse enter/leave for popover
  const handleMouseEnter = () => {
    if (isVisible && cardRef.current) {
      updatePopoverPosition();
      setShowPopover(true);
    }
  };

  const handleMouseLeave = () => {
    setShowPopover(false);
  };
  
  // Update the popover position based on the card position
  const updatePopoverPosition = () => {
    if (!cardRef.current) return;
    
    const triggerRect = cardRef.current.getBoundingClientRect();
    const position = calculateBestPosition({ triggerRect });
    setPopoverPosition(position);
  };
  
  // Update popover position when window is resized
  useEffect(() => {
    if (showPopover) {
      const handleResize = () => {
        updatePopoverPosition();
      };
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
      };
    }
  }, [showPopover]);
  
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
      
      {/* 简单信息提示 - 显示标题 */}
      {isVisible && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <h3 className="text-white font-semibold text-base line-clamp-1">{title}</h3>
            
            {/* 简单的标签提示 - 只显示数量 */}
            {tags.length > 0 && (
              <div className="mt-1 text-xs text-gray-200">
                {tags.length} 个标签
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 使用共享的 Popover 组件 */}
      <Popover
        isVisible={isVisible && showPopover}
        position={popoverPosition}
        zIndex={50}
      >
        <h3 className="font-semibold text-lg text-white">{title}</h3>
        
        {description && (
          <div className="mt-2 max-h-48 overflow-y-auto custom-scrollbar">
            <p className="text-gray-200 text-sm whitespace-pre-line">{description}</p>
          </div>
        )}
        
        {/* 完整标签列表 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span 
                key={tag} 
                className="text-xs px-2 py-1 bg-white/20 text-white rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* 尺寸信息 */}
        <div className="mt-3 text-xs text-gray-300">
          {thumbnailDimensions.width > 0 
            ? `${thumbnailDimensions.width} × ${thumbnailDimensions.height}` 
            : `${width} × ${height}`
          }
        </div>
      </Popover>
    </div>
  );
};

// Add memoization to prevent unnecessary re-renders
export default memo(ImageCard);