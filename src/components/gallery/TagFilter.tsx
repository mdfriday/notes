interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

const TagFilter = ({ tags, selectedTags, onTagSelect }: TagFilterProps) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        
        return (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${isSelected
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            aria-pressed={isSelected}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
};

export default TagFilter; 