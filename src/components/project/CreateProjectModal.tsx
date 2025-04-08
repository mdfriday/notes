import React, { useEffect, useCallback } from 'react';
import { useProject } from '@/core/domain/ProjectContext.tsx';
import { useTranslation } from 'react-i18next';
import { ShortcodeItem } from '@/types/shortcode';
import ModalLayout from '@/components/ui/ModalLayout';
import ShortcodeGrid from '@/components/shortcode/ShortcodeGrid';

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

/**
 * 创建项目模态框 - 允许用户选择模板来创建新项目
 * 优化版本使用5%边距，居中搜索框，根据实际图片大小缩放的缩略图
 */
const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const { t } = useTranslation();
  
  // 从上下文中获取项目和Shortcode相关状态和方法
  const {
    shortcodeTags,
    searchTerm,
    selectedTags,
    shortcodes,
    hasMoreShortcodes,
    isLoadingShortcodes,
    selectedShortcode,
    setCreatingProject,
    selectTag,
    loadMoreShortcodes,
    selectShortcode,
    createProjectFromShortcode,
    setSearchTerm,
    clearFilters
  } = useProject();

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setCreatingProject(true);
    } else {
      setCreatingProject(false);
    }
  }, [isOpen, setCreatingProject]);

  // 处理搜索
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, [setSearchTerm]);

  // 处理滚动加载更多
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // 当滚动到底部时加载更多
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMoreShortcodes && !isLoadingShortcodes) {
      loadMoreShortcodes();
    }
  }, [hasMoreShortcodes, isLoadingShortcodes, loadMoreShortcodes]);

  // 处理模板选择
  const handleShortcodeSelect = async (shortcode: ShortcodeItem) => {
    try {
      // 选择 Shortcode
      selectShortcode(shortcode);
      
      // 设置加载状态
      toast.success('正在创建项目...');
      
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

  // 使用通用模态框布局
  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title={t('选择模板')}
      searchTerm={searchTerm}
      onSearch={handleSearch}
      tags={shortcodeTags}
      selectedTags={selectedTags}
      onTagSelect={selectTag}
      onClearFilters={clearFilters}
      isLoading={isLoadingShortcodes}
      loadingMessage={t('加载模板中...')}
      onScroll={handleScroll}
    >
      {/* 使用ShortcodeGrid组件展示模板卡片 */}
      <ShortcodeGrid
        shortcodes={shortcodes}
        selectedShortcode={selectedShortcode}
        onShortcodeSelect={handleShortcodeSelect}
        emptyMessage={searchTerm ? t('没有找到匹配的模板') : t('没有找到模板')}
        isLoading={isLoadingShortcodes}
      />
    </ModalLayout>
  );
};

export default CreateProjectModal; 