import { ReactNode, useRef, ReactPortal, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface PopoverPosition {
  top: number;
  left: number;
}

interface PopoverProps {
  isVisible: boolean;
  position: PopoverPosition;
  children: ReactNode;
  onPositionChange?: (rect: DOMRect) => void;
  zIndex?: number;
}

/**
 * 通用弹出框组件 - 使用 Portal 渲染以避免被父元素约束
 */
const Popover = ({ 
  isVisible, 
  position, 
  children, 
  onPositionChange,
  zIndex = 50
}: PopoverProps): ReactPortal | null => {
  const popoverRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // 如果父组件需要重新计算位置，提供弹出框的尺寸信息
    if (popoverRef.current && onPositionChange && isVisible) {
      const rect = popoverRef.current.getBoundingClientRect();
      onPositionChange(rect);
    }
  }, [isVisible, onPositionChange]);
  
  if (!isVisible) return null;
  
  return createPortal(
    <div 
      ref={popoverRef}
      className="fixed origin-top-left"
      style={{
        top: position.top,
        left: position.left,
        width: 280,
        opacity: 1,
        backgroundColor: 'rgba(31, 41, 55, 0.9)', // bg-gray-800/90
        borderRadius: '0.5rem',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out forwards',
        zIndex: zIndex
      }}
    >
      {children}
    </div>,
    document.body
  ) as ReactPortal;
};

// 添加全局样式 - 仅在首次加载时执行一次
const addGlobalStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('ui-popover-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'ui-popover-styles';
    styleElement.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    `;
    document.head.appendChild(styleElement);
  }
};

// 组件加载时执行一次
if (typeof document !== 'undefined') {
  addGlobalStyles();
}

export default Popover; 