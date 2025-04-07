"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";

import useTailwindBreakpoints from "@/core/utils/use-tailwind-breakpoints.tsx";

interface ResizableSplitPaneProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
}

export default function ResizableSplitPane({
  leftPane,
  rightPane,
  initialLeftWidth = 50,
  minLeftWidth = 20,
  maxLeftWidth = 80,
}: ResizableSplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);

  const tailwindBreakpoints = useTailwindBreakpoints();

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      const containerWidth = containerRect.width;

      const newLeftWidthPercent = (newWidth / containerWidth) * 100;
      const clampedWidth = Math.min(
        Math.max(newLeftWidthPercent, minLeftWidth),
        maxLeftWidth,
      );

      setLeftWidth(clampedWidth);
    },
    [isDragging, minLeftWidth, maxLeftWidth],
  );

  const handleDoubleClick = useCallback(() => {
    setLeftWidth(initialLeftWidth);
  }, [initialLeftWidth]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
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
          <div className="flex-1 h-full overflow-auto">{rightPane}</div>
        </div>
      )}
    </div>
  );
}
