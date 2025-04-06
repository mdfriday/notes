import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ShortcodeItem } from '../types/shortcode';
import { shortcodeApiService } from '../services/shortcodeApiService';
import { Shortcode } from '../services/shortcodeService';
import { createProject } from '../services/projectService';
import { useTranslation } from 'react-i18next';

// Initialize global shortcode instance
const globalShortcode = new Shortcode();

// Define context types
interface ProjectContextType {
  isCreatingProject: boolean;
  shortcodeTags: string[];
  selectedTag: string;
  shortcodes: ShortcodeItem[];
  hasMoreShortcodes: boolean;
  isLoadingShortcodes: boolean;
  selectedShortcode: ShortcodeItem | null;
  shortcodeInstance: Shortcode;
  
  // Functions
  setCreatingProject: (creating: boolean) => void;
  selectTag: (tag: string) => void;
  loadMoreShortcodes: () => void;
  selectShortcode: (shortcode: ShortcodeItem) => void;
  createProjectFromShortcode: () => Promise<boolean>;
}

// Create the context with default values
const ProjectContext = createContext<ProjectContextType>({
  isCreatingProject: false,
  shortcodeTags: [],
  selectedTag: '',
  shortcodes: [],
  hasMoreShortcodes: false,
  isLoadingShortcodes: false,
  selectedShortcode: null,
  shortcodeInstance: globalShortcode,
  
  // Empty function implementations for default context
  setCreatingProject: () => {},
  selectTag: () => {},
  loadMoreShortcodes: () => {},
  selectShortcode: () => {},
  createProjectFromShortcode: async () => false,
});

// Props for the context provider
interface ProjectProviderProps {
  children: ReactNode;
}

// Context provider component
export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  // State for project creation
  const [isCreatingProject, setCreatingProject] = useState(false);
  
  // State for shortcode tags
  const [shortcodeTags, setShortcodeTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  
  // State for shortcodes
  const [shortcodes, setShortcodes] = useState<ShortcodeItem[]>([]);
  const [hasMoreShortcodes, setHasMoreShortcodes] = useState(false);
  const [isLoadingShortcodes, setIsLoadingShortcodes] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Selected shortcode
  const [selectedShortcode, setSelectedShortcode] = useState<ShortcodeItem | null>(null);
  
  // Load tags when component mounts
  useEffect(() => {
    loadTags();
  }, []);
  
  // Load shortcodes when selectedTag changes
  useEffect(() => {
    if (selectedTag) {
      loadShortcodes(1);
    }
  }, [selectedTag]);
  
  // Load all shortcode tags
  const loadTags = async () => {
    try {
      const tags = await shortcodeApiService.fetchAllTags();
      setShortcodeTags(tags);
      
      // Select the first tag if available
      if (tags.length > 0 && !selectedTag) {
        setSelectedTag(tags[0]);
      }
    } catch (error) {
      console.error('Error loading shortcode tags:', error);
    }
  };
  
  // Load shortcodes for the selected tag
  const loadShortcodes = async (page: number) => {
    if (!selectedTag) return;
    
    setIsLoadingShortcodes(true);
    
    try {
      const result = await shortcodeApiService.fetchShortcodes(
        page,
        10,
        [selectedTag]
      );
      
      if (page === 1) {
        // Replace existing shortcodes
        setShortcodes(result.shortcodes);
      } else {
        // Append to existing shortcodes
        setShortcodes(prev => [...prev, ...result.shortcodes]);
      }
      
      setHasMoreShortcodes(result.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading shortcodes:', error);
    } finally {
      setIsLoadingShortcodes(false);
    }
  };
  
  // Select a tag and load its shortcodes
  const selectTag = (tag: string) => {
    setSelectedTag(tag);
    // Reset selected shortcode
    setSelectedShortcode(null);
  };
  
  // Load more shortcodes (pagination)
  const loadMoreShortcodes = () => {
    if (!isLoadingShortcodes && hasMoreShortcodes) {
      loadShortcodes(currentPage + 1);
    }
  };
  
  // Select a shortcode
  const selectShortcode = (shortcode: ShortcodeItem) => {
    setSelectedShortcode(shortcode);
    
    // Register shortcode with the global instance
    globalShortcode.registerShortcode({
      id: parseInt(shortcode.id, 10),
      name: shortcode.title,
      template: shortcode.template,
      uuid: shortcode.id,
      tags: shortcode.tags
    });
  };
  
  // Create project from selected shortcode
  const createProjectFromShortcode = async (): Promise<boolean> => {
    if (!selectedShortcode) {
      console.error('No shortcode selected for project creation');
      return false;
    }
    
    try {
      // 使用 Shortcode 的 example 字段作为项目内容
      const language = i18n.language as "zh" | "en";
      
      // 确定项目类型 - 默认为小红书，除非标签中明确指定
      let projectType: "xiaohongshu" | "resume" | "website" = "xiaohongshu";
      
      // 根据标签确定类型
      if (selectedShortcode.tags.includes('resume') || selectedShortcode.tags.includes('简历')) {
        projectType = "resume";
      } else if (selectedShortcode.tags.includes('website') || selectedShortcode.tags.includes('网站')) {
        projectType = "website";
      }
      
      // 创建自定义模板ID
      const templateId = `shortcode-${selectedShortcode.id}`;
      
      // 调用现有的项目创建服务，但使用选定的 shortcode 示例内容
      const project = createProject(projectType, templateId, language);
      
      // 更新项目的index.md文件内容为shortcode示例
      const indexFile = project.files.find(f => f.name === "index.md");
      if (indexFile) {
        indexFile.content = selectedShortcode.example;
      }
      
      // 使用 localStorage 保存修改后的项目
      const projects = JSON.parse(localStorage.getItem("md_friday_projects") || "[]");
      const projectIndex = projects.findIndex((p: any) => p.id === project.id);
      if (projectIndex !== -1) {
        projects[projectIndex] = project;
      }
      localStorage.setItem("md_friday_projects", JSON.stringify(projects));
      
      // 重置状态
      setCreatingProject(false);
      setSelectedShortcode(null);
      
      console.log('Project created successfully from shortcode:', project);
      return true;
    } catch (error) {
      console.error('Error creating project:', error);
      return false;
    }
  };
  
  // Value object for the context
  const value: ProjectContextType = {
    isCreatingProject,
    shortcodeTags,
    selectedTag,
    shortcodes,
    hasMoreShortcodes,
    isLoadingShortcodes,
    selectedShortcode,
    shortcodeInstance: globalShortcode,
    
    setCreatingProject,
    selectTag,
    loadMoreShortcodes,
    selectShortcode,
    createProjectFromShortcode,
  };
  
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// Custom hook to use the project context
export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  
  return context;
}; 