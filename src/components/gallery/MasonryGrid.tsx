import { ReactNode, useEffect, useState } from 'react';

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

const MasonryGrid = ({
  children,
  columnCount = defaultColumnCount,
  gap = '1rem',
}: MasonryGridProps) => {
  const [columns, setColumns] = useState(columnCount.desktop);

  useEffect(() => {
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

    // Add resize listener
    window.addEventListener('resize', updateColumns);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateColumns);
    };
  }, [columnCount]);

  // Distribute children into columns
  const getColumns = () => {
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
  };

  const columnList = getColumns();

  return (
    <div
      className="w-full"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {columnList.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col" style={{ gap }}>
          {column.map((item: ReactNode, itemIndex: number) => (
            <div key={itemIndex}>{item}</div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid; 