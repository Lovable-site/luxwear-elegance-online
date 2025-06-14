
import React, { useMemo, useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: ({ index, style, data }: { index: number; style: React.CSSProperties; data: T[] }) => React.ReactNode;
  className?: string;
}

function VirtualizedList<T>({ 
  items, 
  itemHeight, 
  height, 
  renderItem, 
  className 
}: VirtualizedListProps<T>) {
  const memoizedItems = useMemo(() => items, [items]);

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    return renderItem({ index, style, data: memoizedItems });
  }, [memoizedItems, renderItem]);

  if (!items.length) {
    return (
      <div className={className} style={{ height }}>
        <div className="flex items-center justify-center h-full text-gray-500">
          No items to display
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={memoizedItems}
        overscanCount={5} // Render 5 extra items for smooth scrolling
      >
        {Row}
      </List>
    </div>
  );
}

export default VirtualizedList;
