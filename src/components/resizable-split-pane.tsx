"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";

import useTailwindBreakpoints from "@/core/utils/use-tailwind-breakpoints.tsx";

interface ResizableSplitPaneProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  rightPaneWidth?: number;
}

export default function ResizableSplitPane({
  leftPane,
  rightPane,
  initialLeftWidth = 50,
  minLeftWidth = 20,
  maxLeftWidth = 80,
  rightPaneWidth = 0,
}: ResizableSplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  
  // Store the previous rightPaneWidth to detect changes
  const prevRightPaneWidth = useRef(rightPaneWidth);
  
  // Use refs for drag state to avoid re-renders during dragging
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startLeftWidth: 0,
  });
  
  // Store animation frame request ID to cancel if needed
  const animationFrameRef = useRef<number | null>(null);

  const tailwindBreakpoints = useTailwindBreakpoints();

  // When rightPaneWidth changes from dropdown, calculate and update leftWidth
  useEffect(() => {
    // Only respond to changes in rightPaneWidth
    if (rightPaneWidth === prevRightPaneWidth.current) {
      return;
    }
    
    // Update the previous value for future comparisons
    prevRightPaneWidth.current = rightPaneWidth;
    
    // If there's a container and rightPaneWidth is a positive value
    if (containerRef.current && rightPaneWidth > 0) {
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      if (containerWidth > 0) {
        // Calculate what percentage the left pane should be to achieve the desired right pane width
        const leftWidthPercent = ((containerWidth - rightPaneWidth - 6) / containerWidth) * 100;
        
        // Clamp the value to ensure it's within bounds
        const clampedWidth = Math.min(
          Math.max(leftWidthPercent, minLeftWidth),
          maxLeftWidth
        );
        
        // Apply the new left width
        setLeftWidth(clampedWidth);
      }
    } else if (rightPaneWidth === 0) {
      // If rightPaneWidth is back to 0 (default), reset to initial width
      setLeftWidth(initialLeftWidth);
    }
  }, [rightPaneWidth, minLeftWidth, maxLeftWidth, initialLeftWidth]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Set the drag state in the ref
    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startLeftWidth: leftWidth,
    };
    
    // Update the React state to trigger a render for visual feedback
    setIsDragging(true);
  }, [leftWidth]);

  const handleMouseUp = useCallback(() => {
    // Update the drag state in the ref
    dragStateRef.current.isDragging = false;
    
    // Update the React state
    setIsDragging(false);
    
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const updateDragPosition = useCallback(() => {
    if (!dragStateRef.current.isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    
    // Get the current mouse position from the mousemove event handler
    const mouseX = (dragStateRef.current as any).currentX || 0;
    const newWidth = mouseX - containerRect.left;
    
    const newLeftWidthPercent = (newWidth / containerWidth) * 100;
    const clampedWidth = Math.min(
      Math.max(newLeftWidthPercent, minLeftWidth),
      maxLeftWidth,
    );
    
    setLeftWidth(clampedWidth);
    
    // Continue animation loop if still dragging
    if (dragStateRef.current.isDragging) {
      animationFrameRef.current = requestAnimationFrame(updateDragPosition);
    }
  }, [minLeftWidth, maxLeftWidth]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStateRef.current.isDragging) return;
    
    // Store the current mouse position in the ref
    (dragStateRef.current as any).currentX = e.clientX;
    
    // Start the animation frame loop if not already running
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateDragPosition);
    }
  }, [updateDragPosition]);

  const handleDoubleClick = useCallback(() => {
    setLeftWidth(initialLeftWidth);
  }, [initialLeftWidth]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      
      // Clean up any animation frame on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleMouseMove, handleMouseUp]);
  
  return (
    <div className="h-full w-full">
      {tailwindBreakpoints.has("md") ? (
        <div className="flex flex-col border border-solid border-gray-200 shadow-sm overflow-hidden h-full bg-white">
          <div className="flex-1 overflow-auto">{rightPane}</div>
          <div className="h-1 bg-gray-200"></div>
          <div className="flex-1 overflow-auto">{leftPane}</div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex h-full w-full overflow-hidden border border-solid border-gray-200 shadow-sm bg-white"
        >
          <div
            className="h-full overflow-auto"
            style={{ width: `${leftWidth}%` }}
          >
            {leftPane}
          </div>
          <div
            className="cursor-col-resize bg-gray-200 hover:bg-gray-300 transition-colors"
            style={{ width: "6px" }}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
          />
          <div 
            className="h-full overflow-auto flex-1"
          >
            {rightPane}
          </div>
        </div>
      )}
    </div>
  );
}
