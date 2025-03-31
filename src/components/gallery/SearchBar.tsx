import { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  onSearch: (term: string) => void;
  initialSearchTerm?: string;
  placeholder?: string;
}

const SearchBar = ({
  onSearch,
  initialSearchTerm = '',
  placeholder = 'Search images...',
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isFocused, setIsFocused] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with initial search term if provided
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  // Handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Set new timeout for search debounce
    searchTimeout.current = setTimeout(() => {
      onSearch(value);
    }, 500);
  };

  // Clear the timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    onSearch(searchTerm);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`relative w-full max-w-2xl mx-auto transition-all duration-200 ${
        isFocused ? 'ring-2 ring-offset-2 ring-primary/60' : ''
      }`}
    >
      {/* Search icon */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg 
          className="w-5 h-5 text-gray-500" 
          aria-hidden="true" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>
      
      {/* Search input */}
      <input 
        ref={inputRef}
        type="search" 
        className="block w-full p-3 pl-10 pr-12 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none" 
        placeholder={placeholder} 
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      
      {/* Clear button (only when there is content) */}
      {searchTerm && (
        <button 
          type="button"
          className="absolute inset-y-0 right-12 flex items-center px-2 text-gray-500 hover:text-gray-700"
          onClick={handleClearSearch}
          aria-label="Clear search"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      {/* Submit button */}
      <button 
        type="submit" 
        className="absolute inset-y-0 right-0 flex items-center px-3 bg-gray-200 rounded-r-lg hover:bg-gray-300 transition-colors"
      >
        <span className="sr-only">Search</span>
        <svg 
          className="w-5 h-5 text-gray-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </button>
    </form>
  );
};

export default SearchBar; 