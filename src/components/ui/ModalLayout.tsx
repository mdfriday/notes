import React, { ReactNode } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody 
} from "@nextui-org/modal";
import { Spinner } from "@nextui-org/spinner";
import '@/styles/modal.css';
import SearchInput from '@/components/SearchInput';

// 定义常量以避免魔术数字
const MODAL_MARGIN_PERCENT = 5; // 模态框边距百分比

interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  searchTerm?: string;
  onSearch?: (term: string) => void;
  tags?: string[];
  selectedTags?: string[];
  onTagSelect?: (tag: string) => void;
  onClearFilters?: () => void;
  children: ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * ModalLayout - 标准化的模态框布局组件
 * 
 * 提供一致的边距控制（5%）、搜索栏、标签栏等常用元素
 */
const ModalLayout: React.FC<ModalLayoutProps> = ({
  isOpen,
  onClose,
  title,
  searchTerm = '',
  onSearch,
  tags = [],
  selectedTags = [],
  onTagSelect,
  onClearFilters,
  children,
  isLoading = false,
  loadingMessage = '加载中...',
  onScroll
}) => {
  // 计算模态框样式，保持5%的边距
  const modalClassNames = {
    wrapper: "p-0",
    base: "max-w-[90%] w-[90%] h-[90%] max-h-[90%] m-auto",
    body: "p-0 h-full",
    backdrop: "bg-black/80",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      classNames={modalClassNames}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="border-b pb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
        </ModalHeader>
        <ModalBody>
          <div className="px-4 py-3 flex flex-col h-full modal-content-container">
            {/* 搜索框 - 与 Gallery 组件相同样式 */}
            {onSearch && (
              <div className="w-full max-w-xl mx-auto mb-6">
                <SearchInput 
                  onSearch={onSearch}
                  initialValue={searchTerm}
                  placeholder="搜索..."
                  autoFocus={false}
                />
              </div>
            )}

            {/* 标签栏 - 与 Gallery 组件相同样式 */}
            {tags.length > 0 && onTagSelect && (
              <div className="w-full max-w-2xl mx-auto mb-4">
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {selectedTags && selectedTags.length > 0 && onClearFilters && (
                    <button
                      onClick={onClearFilters}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-full text-sm font-medium transition-colors"
                    >
                      清除筛选
                    </button>
                  )}
                  {tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => onTagSelect(tag)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                        ${selectedTags && selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 内容区域 */}
            <div 
              className="flex-1 overflow-y-auto modal-body-content no-scrollbar"
              onScroll={onScroll}
            >
              {children}

              {/* 加载状态指示器 */}
              {isLoading && (
                <div className="py-4 text-center">
                  <Spinner size="sm" color="primary" />
                  <span className="ml-2">{loadingMessage}</span>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalLayout; 