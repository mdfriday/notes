import type { PopoverPosition } from '@/components/ui/Popover';

interface CalculatePositionOptions {
  triggerRect: DOMRect;
  popoverWidth?: number;
  popoverHeight?: number;
  gap?: number;
  minMargin?: number;
}

/**
 * 计算弹出框的最佳位置
 * 优先级: 右侧 > 左侧 > 下方 > 上方
 */
export const calculateBestPosition = ({
  triggerRect,
  popoverWidth = 280,
  popoverHeight = 300,
  gap = 16,
  minMargin = 20
}: CalculatePositionOptions): PopoverPosition => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // 默认位置 (元素右侧)
  let top = triggerRect.top;
  let left = triggerRect.right + gap;
  
  // 检查是否超出右侧边界
  if (left + popoverWidth > windowWidth - minMargin) {
    // 尝试放在左侧
    if (triggerRect.left > popoverWidth + minMargin) {
      left = triggerRect.left - popoverWidth - gap;
    } else {
      // 左侧空间不足，尝试放在下方
      left = triggerRect.left;
      top = triggerRect.bottom + gap;
      
      // 检查是否超出下边界
      if (top + popoverHeight > windowHeight - minMargin) {
        // 放在上方
        top = triggerRect.top - popoverHeight - gap;
      }
    }
  }
  
  // 确保不超出顶部边界
  if (top < minMargin) {
    top = minMargin;
  }
  
  // 确保不超出左侧边界
  if (left < minMargin) {
    left = minMargin;
  }
  
  return { top, left };
}; 