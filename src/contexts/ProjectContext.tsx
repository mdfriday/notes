import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ShortcodeItem, ShortcodeMetadata, ShortcodeSearchResult } from '../types/shortcode';
import { shortcodeApiService } from '../services/shortcodeApiService';
import { Shortcode } from '@mdfriday/shortcode';
import { createProject as projectServiceCreateProject } from '../services/projectService';
import { Project, ProjectFile } from '../components/project/ProjectExplorer';
import { useTranslation } from 'react-i18next';

// Toast notification (mock if not available)
const toast = {
  error: (message: string) => console.error(message),
  success: (message: string) => console.log(message)
};

// Initialize global shortcode instance - using the @mdfriday/shortcode package
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
  createProjectFromShortcode: (selectedShortcode: ShortcodeItem) => Promise<Project | null>;
  
  // Markdown rendering functions
  stepRender: (markdown: string) => string;
  finalRender: (html: string) => string;
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
  createProjectFromShortcode: async () => null,
  
  // Markdown rendering functions - use the @mdfriday/shortcode package methods
  stepRender: (markdown) => markdown,
  finalRender: (html) => html,
});

// Props for the context provider
interface ProjectProviderProps {
  children: ReactNode;
}

// Function to fetch content from a remote URL
async function fetchRemoteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching remote content:', error);
    throw error;
  }
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
    
    // Register shortcode with the @mdfriday/shortcode package
    globalShortcode.registerShortcode({
      id: parseInt(shortcode.id, 10),
      name: shortcode.title,  // 使用 title 作为 shortcode 名称
      template: shortcode.template,
      uuid: shortcode.id,
      tags: shortcode.tags
    });
  };
  
  // Step 1 of markdown rendering: replace shortcodes with placeholders
  const stepRender = (markdown: string): string => {
    return globalShortcode.stepRender(markdown);
  };
  
  // Step 3 of markdown rendering: final rendering
  const finalRender = (html: string): string => {
    return globalShortcode.finalRender(html);
  };
  
  /**
   * Create a project from a shortcode example
   */
  const createProjectFromShortcode = async (selectedShortcode: ShortcodeItem) => {
    setIsLoadingShortcodes(true);
    
    try {
      console.log('Creating project from shortcode:', selectedShortcode);
      
      if (!selectedShortcode) {
        throw new Error('No shortcode selected');
      }
      
      // 注册 shortcode - 使用 @mdfriday/shortcode 包
      globalShortcode.registerShortcode({
        id: parseInt(selectedShortcode.id, 10),
        name: selectedShortcode.title,  // 使用 title 作为 shortcode 名称
        template: selectedShortcode.template,
        uuid: selectedShortcode.id,
        tags: selectedShortcode.tags
      });
      
      // 处理 example 内容
      let exampleContent = selectedShortcode.example || `{{< ${selectedShortcode.title} >}}`;
      
      // 如果 example 是远程 URL，则下载内容
      if (exampleContent.startsWith('https://')) {
        try {
          toast.success('正在下载模板内容...');
          exampleContent = await fetchRemoteContent(exampleContent);
        } catch (error) {
          console.error('Error fetching remote example:', error);
          toast.error('下载模板内容失败，将使用默认内容');
          exampleContent = `{{< ${selectedShortcode.title} >}}`;
        }
      }
      
      // 创建项目
      const timestamp = Date.now().toString();
      const newProject: Project = {
        id: `project_${timestamp}`,
        name: selectedShortcode.title,
        type: selectedShortcode.tags.includes('resume') ? 'resume' : 
              selectedShortcode.tags.includes('website') ? 'website' : 'xiaohongshu',
        templateId: `shortcode-${selectedShortcode.id}`,
        files: [
          {
            id: `file_${timestamp}`,
            name: 'index.md',
            content: exampleContent,
            isDirectory: false,
            path: '/index.md'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 将新项目直接保存到本地存储，不使用预定义模板
      const allProjects = JSON.parse(localStorage.getItem("md_friday_projects") || "[]");
      allProjects.push(newProject);
      localStorage.setItem("md_friday_projects", JSON.stringify(allProjects));
      
      // 设置为当前项目
      localStorage.setItem("md_friday_current_project_id", newProject.id);
      setSelectedShortcode(null);
      
      // 触发项目变更事件
      const projectChangeEvent = new CustomEvent('project-changed', {
        detail: { projectId: newProject.id }
      });
      window.dispatchEvent(projectChangeEvent);
      
      console.log('Project created successfully:', newProject);
      
      return newProject;
    } catch (error) {
      console.error('Failed to create project from shortcode:', error);
      toast.error('Failed to create project from shortcode');
      return null;
    } finally {
      setIsLoadingShortcodes(false);
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
    
    stepRender,
    finalRender,
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