import { ReactNode, useEffect, useState, memo, useMemo, useRef } from 'react';

interface MasonryGridProps {
  children: ReactNode[];
  columnCount?: { mobile: number; tablet: number; desktop: number };
  gap?: string;
  autoLayout?: boolean;
  minItemWidth?: number;
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
  autoLayout = true,
  minItemWidth = 200,
}: MasonryGridProps) => {
  const [columns, setColumns] = useState(columnCount.desktop);
  const gridRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const layoutTimeoutRef = useRef<number | null>(null);
  const [isLayouting, setIsLayouting] = useState(false);

  useEffect(() => {
    if (autoLayout) {
      return;
    }

    if (typeof ResizeObserver !== 'undefined') {
      const handleResize = (entries: ResizeObserverEntry[]) => {
        if (!entries.length) return;
        
        if (layoutTimeoutRef.current) {
          window.clearTimeout(layoutTimeoutRef.current);
        }
        
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

      updateColumns();

      let resizeTimer: number;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        setIsLayouting(true);
        resizeTimer = window.setTimeout(() => {
          updateColumns();
          setIsLayouting(false);
        }, 100);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimer);
      };
    }
  }, [columnCount, autoLayout]);

  const columnList = useMemo(() => {
    if (autoLayout) {
      return [children];
    }

    if (!children || children.length === 0) return Array(columns).fill([]);

    const cols: ReactNode[][] = Array(columns)
      .fill(null)
      .map(() => []);

    children.forEach((child, index) => {
      const columnIndex = index % columns;
      cols[columnIndex].push(child);
    });

    return cols;
  }, [children, columns, autoLayout]);

  const layoutClass = isLayouting ? 'masonry-grid-layouting' : '';

  if (autoLayout) {
    return (
      <div
        ref={gridRef}
        className={`w-full ${layoutClass}`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, max-content))`,
          gap,
          justifyContent: 'center',
          contain: 'paint layout style',
        }}
      >
        {children}
      </div>
    );
  }

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

MasonryGrid.displayName = 'MasonryGrid';

export default MasonryGrid; 