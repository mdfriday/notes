import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody 
} from "@nextui-org/modal";
import { 
  Input
} from "@nextui-org/input";
import { 
  Card, 
  CardBody, 
  CardFooter 
} from "@nextui-org/card";
import { useProject } from '@/contexts/ProjectContext';
import { createProject } from '@/services/projectService';
import { useTranslation } from 'react-i18next';
import { Spinner } from "@nextui-org/spinner";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (projectId: string) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const { i18n, t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  
  // 从上下文中获取项目和Shortcode相关状态和方法
  const {
    shortcodeTags,
    selectedTag,
    shortcodes,
    hasMoreShortcodes,
    isLoadingShortcodes,
    selectedShortcode,
    setCreatingProject,
    selectTag,
    loadMoreShortcodes,
    selectShortcode,
    createProjectFromShortcode,
  } = useProject();

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setCreatingProject(true);
      // 如果有标签，默认选中第一个
      if (shortcodeTags.length > 0 && !selectedTag) {
        selectTag(shortcodeTags[0]);
      }
    } else {
      setCreatingProject(false);
    }
  }, [isOpen, shortcodeTags, selectedTag, selectTag, setCreatingProject]);

  // 处理搜索
  useEffect(() => {
    // 这里可以实现搜索功能，暂时不实现
    // 因为后端API没有提供全文搜索
  }, [searchTerm]);

  // 处理滚动加载更多
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // 当滚动到底部时加载更多
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMoreShortcodes && !isLoadingShortcodes) {
      loadMoreShortcodes();
    }
  };

  // 处理模板选择
  const handleShortcodeSelect = async (shortcode: any) => {
    // 选择 Shortcode
    selectShortcode(shortcode);
    
    // 创建项目（这将使用选中的 Shortcode 的 example 字段）
    try {
      const success = await createProjectFromShortcode();
      if (success) {
        onClose();
        // 通知父组件项目已创建
        if (onProjectCreated) {
          // 这里应该返回新项目的ID
          // 由于当前 createProjectFromShortcode 实现是模拟的，我们需要获取真实ID
          const currentId = localStorage.getItem("md_friday_current_project_id");
          if (currentId) {
            onProjectCreated(currentId);
          }
        }
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          <h3 className="text-lg font-semibold">选择模板</h3>
        </ModalHeader>
        <ModalBody>
          <div className="mb-4">
            <div className="flex space-x-2 border-b overflow-x-auto pb-2">
              {shortcodeTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => selectTag(tag)}
                  className={`py-2 px-4 whitespace-nowrap ${
                    selectedTag === tag 
                      ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <Input
            placeholder="搜索模板..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            }
            className="mb-4"
          />

          <div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto"
            style={{ maxHeight: '60vh' }}
            onScroll={handleScroll}
          >
            {shortcodes.length > 0 ? (
              shortcodes.map((shortcode) => (
                <Card 
                  key={shortcode.id} 
                  isPressable 
                  onPress={() => handleShortcodeSelect(shortcode)}
                  className={`border ${selectedShortcode?.id === shortcode.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                >
                  <CardBody className="p-0 relative">
                    <img
                      src={shortcode.thumbnail}
                      alt={shortcode.title}
                      className="w-full h-40 object-cover"
                    />
                    {shortcode.tags && shortcode.tags.length > 0 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        {shortcode.tags[0]}
                      </div>
                    )}
                  </CardBody>
                  <CardFooter className="flex flex-col items-start">
                    <div className="font-medium">{shortcode.title}</div>
                    {shortcode.description && (
                      <div className="text-sm text-gray-500 mt-1">{shortcode.description}</div>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 py-10 text-center text-gray-500">
                {isLoadingShortcodes ? (
                  <div className="flex justify-center items-center">
                    <Spinner size="md" color="primary" />
                    <span className="ml-2">加载中...</span>
                  </div>
                ) : (
                  '没有找到模板'
                )}
              </div>
            )}
            
            {isLoadingShortcodes && shortcodes.length > 0 && (
              <div className="col-span-3 py-4 text-center">
                <Spinner size="sm" color="primary" />
              </div>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateProjectModal; 