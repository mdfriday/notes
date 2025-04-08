import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ShortcodeItem, ShortcodeMetadata, ShortcodeSearchResult } from '../../types/shortcode.ts';
import { shortcodeApiService } from '@/core/services/shortcodeApiService.ts';
import { shortcodeService } from '@/core/services/shortcodeService.ts';
import { Shortcode } from '@mdfriday/shortcode';
import { createProject as projectServiceCreateProject } from '@/core/services/projectService.ts';
import { Project, ProjectFile } from '../../components/project/ProjectExplorer.tsx';
import { useTranslation } from 'react-i18next';

// Toast notification (mock if not available)
const toast = {
  error: (message: string) => console.error(message),
  success: (message: string) => console.log(message)
};

// Get the global shortcode instance from our service
const globalShortcode = shortcodeService.getInstance();

// Define context types
interface ProjectContextType {
  isCreatingProject: boolean;
  shortcodeTags: string[];
  selectedTags: string[];
  searchTerm: string;
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
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  
  // Markdown rendering functions
  stepRender: (markdown: string) => string;
  finalRender: (html: string) => string;
}

// Create the context with default values
const ProjectContext = createContext<ProjectContextType>({
  isCreatingProject: false,
  shortcodeTags: [],
  selectedTags: [],
  searchTerm: '',
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
  setSearchTerm: () => {},
  clearFilters: () => {},
  
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
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
  
  // Load shortcodes when search term or selected tags change
  useEffect(() => {
    loadShortcodes(1);
  }, [searchTerm, selectedTags]);
  
  // Load all shortcode tags
  const loadTags = async () => {
    try {
      const tags = await shortcodeApiService.fetchAllTags();
      setShortcodeTags(tags);
    } catch (error) {
      console.error('Error loading shortcode tags:', error);
    }
  };
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedTags([]);
  }, []);
  
  // Load shortcodes with search term and selected tags
  const loadShortcodes = async (page: number) => {
    setIsLoadingShortcodes(true);
    
    try {
      const result = await shortcodeApiService.searchShortcodes(
        page,
        10,
        searchTerm,
        selectedTags
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
  
  // Select a tag (toggle selection)
  const selectTag = (tag: string) => {
    setSelectedTags(prev => {
      // If tag is already selected, remove it
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      // Otherwise add it
      return [...prev, tag];
    });
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
    
    // Register shortcode using our service
    shortcodeService.registerShortcode(shortcode);
  };
  
  // Step 1 of markdown rendering: replace shortcodes with placeholders
  const stepRender = (markdown: string): string => {
    return shortcodeService.stepRender(markdown);
  };
  
  // Step 3 of markdown rendering: final rendering
  const finalRender = (html: string): string => {
    return shortcodeService.finalRender(html);
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
      
      // Register the primary shortcode using our service
      shortcodeService.registerShortcode(selectedShortcode);
      
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
      
      // Use our service to ensure all shortcodes in the example are registered
      await shortcodeService.ensureShortcodesRegistered(exampleContent);
      
      // 创建项目
      const timestamp = Date.now().toString();
      const newProject: Project = {
        id: `project_${timestamp}`,
        name: selectedShortcode.title,
        type: selectedShortcode.tags.includes('resume') ? 'resume' : 
              selectedShortcode.tags.includes('website') ? 'website' : 'xiaohongshu',
        templateId: selectedShortcode.id,
        files: [
          {
            id: `file_${timestamp}`,
            name: 'index.md',
            content: exampleContent,
            path: '/index.md',
            isDirectory: false,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
    selectedTags,
    searchTerm,
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
    setSearchTerm,
    clearFilters,
    
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