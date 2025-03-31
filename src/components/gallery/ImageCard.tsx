import type { ImageItem } from '@/types/gallery';

interface ImageCardProps {
  image: ImageItem;
  onClick: (image: ImageItem) => void;
}

const ImageCard = ({ image, onClick }: ImageCardProps) => {
  const { url, title, description, tags } = image;
  
  // Calculate aspect ratio for responsive sizing
  const aspectRatio = (image.height / image.width) * 100;
  
  return (
    <div 
      className="relative group overflow-hidden rounded-lg shadow-md bg-white mb-4 transition-transform hover:shadow-xl hover:-translate-y-1 cursor-pointer" 
      onClick={() => onClick(image)}
    >
      {/* Image wrapper with aspect ratio */}
      <div className="relative overflow-hidden" style={{ paddingBottom: `${aspectRatio}%` }}>
        <img
          src={url}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Content overlay */}
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
    </div>
  );
};

export default ImageCard; 