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
import { useTranslation } from 'react-i18next';
import { Spinner } from "@nextui-org/spinner";
import { ShortcodeItem } from '@/types/shortcode';

// 由于可能没有安装 react-hot-toast，使用简单的控制台日志替代
const toast = {
  success: (message: string) => console.log('SUCCESS:', message),
  error: (message: string) => console.error('ERROR:', message)
};

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

  // 处理搜索（暂不实现全文搜索）
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // 这里可以实现简单的客户端筛选
    // 注意：后端API没有提供全文搜索
  };

  // 处理滚动加载更多
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // 当滚动到底部时加载更多
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMoreShortcodes && !isLoadingShortcodes) {
      loadMoreShortcodes();
    }
  };

  // 处理模板选择
  const handleShortcodeSelect = async (shortcode: ShortcodeItem) => {
    try {
      // 选择 Shortcode
      selectShortcode(shortcode);
      
      // 设置加载状态
      const loadingToast = toast.success('正在创建项目...');
      
      // 创建项目
      const project = await createProjectFromShortcode(shortcode);
      
      if (project) {
        toast.success(`项目 "${project.name}" 创建成功`);
        onClose();
        
        // 通知父组件项目已创建
        if (onProjectCreated && project.id) {
          onProjectCreated(project.id);
        }
      } else {
        toast.error('项目创建失败，请重试');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error instanceof Error ? error.message : '创建项目时发生错误');
    }
  };

  // 筛选 shortcodes
  const filteredShortcodes = searchTerm 
    ? shortcodes.filter(shortcode => 
        shortcode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shortcode.description && shortcode.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        shortcode.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : shortcodes;

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
            onChange={(e) => handleSearch(e.target.value)}
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
            {filteredShortcodes.length > 0 ? (
              filteredShortcodes.map((shortcode) => (
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
                  searchTerm ? '没有找到匹配的模板' : '没有找到模板'
                )}
              </div>
            )}
            
            {isLoadingShortcodes && filteredShortcodes.length > 0 && (
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