import { ReactNode, useEffect, useState, memo, useMemo, useRef } from 'react';

interface MasonryGridProps {
  children: ReactNode[];
  columnCount?: { mobile: number; tablet: number; desktop: number };
  gap?: string;
}

const defaultColumnCount = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
};

const MasonryGrid = memo(({
  children,
  columnCount = defaultColumnCount,
  gap = '1rem',
}: MasonryGridProps) => {
  const [columns, setColumns] = useState(columnCount.desktop);
  const gridRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const layoutTimeoutRef = useRef<number | null>(null);
  const [isLayouting, setIsLayouting] = useState(false);

  // More efficient resize handling with ResizeObserver
  useEffect(() => {
    // Modern approach using ResizeObserver instead of window resize event
    if (typeof ResizeObserver !== 'undefined') {
      const handleResize = (entries: ResizeObserverEntry[]) => {
        if (!entries.length) return;
        
        // Clear any pending layout operations
        if (layoutTimeoutRef.current) {
          window.clearTimeout(layoutTimeoutRef.current);
        }
        
        // Debounce layout recalculation to avoid thrashing
        layoutTimeoutRef.current = window.setTimeout(() => {
          const width = entries[0].contentRect.width;
          setIsLayouting(true);
          
          if (width < 640) {
            setColumns(columnCount.mobile);
          } else if (width < 1024) {
            setColumns(columnCount.tablet);
          } else {
            setColumns(columnCount.desktop);
          }
          
          // Signal that layout is complete
          layoutTimeoutRef.current = window.setTimeout(() => {
            setIsLayouting(false);
          }, 50);
        }, 100);
      };
      
      resizeObserverRef.current = new ResizeObserver(handleResize);
      
      if (gridRef.current) {
        resizeObserverRef.current.observe(gridRef.current);
      }
      
      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
        if (layoutTimeoutRef.current) {
          clearTimeout(layoutTimeoutRef.current);
        }
      };
    } else {
      // Fallback for browsers without ResizeObserver
      const updateColumns = () => {
        const width = window.innerWidth;
        
        if (width < 640) {
          setColumns(columnCount.mobile);
        } else if (width < 1024) {
          setColumns(columnCount.tablet);
        } else {
          setColumns(columnCount.desktop);
        }
      };

      // Initial setup
      updateColumns();

      // Debounce resize handler
      let resizeTimer: number;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        setIsLayouting(true);
        resizeTimer = window.setTimeout(() => {
          updateColumns();
          setIsLayouting(false);
        }, 100);
      };

      // Add resize listener
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimer);
      };
    }
  }, [columnCount]);

  // Distribute children into columns - memoized for performance
  const columnList = useMemo(() => {
    if (!children || children.length === 0) return Array(columns).fill([]);

    const cols: ReactNode[][] = Array(columns)
      .fill(null)
      .map(() => []);

    // Distribute items among columns by index
    children.forEach((child, index) => {
      const columnIndex = index % columns;
      cols[columnIndex].push(child);
    });

    return cols;
  }, [children, columns]);

  // Apply a CSS class based on layout state
  const layoutClass = isLayouting ? 'masonry-grid-layouting' : '';

  return (
    <div
      ref={gridRef}
      className={`w-full ${layoutClass}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        containIntrinsicSize: 'auto',
        contain: 'paint layout style',
        willChange: 'contents',
        contentVisibility: 'auto'
      }}
    >
      {columnList.map((column, columnIndex) => (
        <div 
          key={`column-${columnIndex}`} 
          className="flex flex-col" 
          style={{ 
            gap,
            transform: 'translateZ(0)',
            willChange: 'contents',
            contain: 'layout paint'
          }}
        >
          {column.map((item: ReactNode, itemIndex: number) => {
            // Use a more stable key based on both column and item index
            const key = `item-${columnIndex}-${itemIndex}`;
            return (
              <div 
                key={key} 
                style={{ 
                  willChange: isLayouting ? 'transform' : 'auto', 
                  contain: 'content',
                  transform: 'translateZ(0)',
                  margin: 0,
                  padding: 0
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
});

// Add display name for debugging
MasonryGrid.displayName = 'MasonryGrid';

export default MasonryGrid; 