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
  registeredShortcodes: Map<string, ShortcodeMetadata>;
  
  // Functions
  setCreatingProject: (creating: boolean) => void;
  selectTag: (tag: string) => void;
  loadMoreShortcodes: () => void;
  selectShortcode: (shortcode: ShortcodeItem) => void;
  createProjectFromShortcode: (selectedShortcode: ShortcodeItem) => Promise<Project | null>;
  registerShortcode: (metadata: ShortcodeMetadata) => boolean;
  isShortcodeRegistered: (name: string) => boolean;
  getRegisteredShortcode: (name: string) => ShortcodeMetadata | undefined;
  
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
  registeredShortcodes: new Map(),
  
  // Empty function implementations for default context
  setCreatingProject: () => {},
  selectTag: () => {},
  loadMoreShortcodes: () => {},
  selectShortcode: () => {},
  createProjectFromShortcode: async () => null,
  registerShortcode: () => false,
  isShortcodeRegistered: () => false,
  getRegisteredShortcode: () => undefined,
  
  // Markdown rendering functions
  stepRender: (markdown) => markdown,
  finalRender: (html) => html,
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
  
  // State for tracking registered shortcodes
  const [registeredShortcodes, setRegisteredShortcodes] = useState<Map<string, ShortcodeMetadata>>(
    new Map()
  );
  
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
    registerShortcode({
      id: parseInt(shortcode.id, 10),
      name: shortcode.title,
      template: shortcode.template,
      uuid: shortcode.id,
      tags: shortcode.tags
    });
  };
  
  // Register a shortcode
  const registerShortcode = (metadata: ShortcodeMetadata): boolean => {
    try {
      // Register with the global shortcode instance
      const result = globalShortcode.registerShortcode(metadata);

      if (result) {
        // Update our internal tracking of registered shortcodes
        setRegisteredShortcodes(prev => {
          const newMap = new Map(prev);
          newMap.set(metadata.name, metadata);
          return newMap;
        });
        console.log(`Registered shortcode: ${metadata.name}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Error registering shortcode: ${metadata.name}`, error);
      return false;
    }
  };
  
  // Check if a shortcode is registered
  const isShortcodeRegistered = (name: string): boolean => {
    return registeredShortcodes.has(name);
  };
  
  // Get a registered shortcode
  const getRegisteredShortcode = (name: string): ShortcodeMetadata | undefined => {
    return registeredShortcodes.get(name);
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
      
      // 检查是否已经注册了这个 shortcode
      if (!isShortcodeRegistered(selectedShortcode.slug)) {
        // 创建 shortcode 元数据并注册
        const metadata = shortcodeApiService.createShortcodeMetadata(selectedShortcode);
        registerShortcode(metadata);
      }
      
      // 确定项目类型和默认文件名
      const projectType =  'xiaohongshu';
      
      // 创建项目
      const timestamp = Date.now().toString();
      const newProject: Project = {
        id: `project_${timestamp}`,
        name: selectedShortcode.title,
        type: projectType,
        templateId: `shortcode-${selectedShortcode.id}`,
        files: [
          {
            id: `file_${timestamp}`,
            name: 'index.md',
            content: selectedShortcode.example || `{{< ${selectedShortcode.slug} >}}`,
            isDirectory: false,
            path: '/index.md'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 保存项目到本地存储
      // 使用正确的参数调用 createProject
      const language = i18n.language as "zh" | "en";
      const updatedProject = projectServiceCreateProject(projectType, `shortcode-${selectedShortcode.id}`, language);
      
      if (updatedProject) {
        // 设置为当前项目
        setSelectedShortcode(null);
        
        // 触发项目变更事件
        const projectChangeEvent = new CustomEvent('project-changed', {
          detail: { projectId: updatedProject.id }
        });
        window.dispatchEvent(projectChangeEvent);
        
        console.log('Project created successfully:', updatedProject);
      }
      
      return updatedProject;
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
    registeredShortcodes,
    
    setCreatingProject,
    selectTag,
    loadMoreShortcodes,
    selectShortcode,
    createProjectFromShortcode,
    registerShortcode,
    isShortcodeRegistered,
    getRegisteredShortcode,
    
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