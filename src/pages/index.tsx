import { useEffect, useState } from "react";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { useTranslation } from "react-i18next";
import markedKatex from "marked-katex-extension";

import DefaultLayout from "@/layouts/default";
import ResizableSplitPane from "@/components/resizable-split-pane";
import inlineStyles from "@/lib/inline-styles";
import { replaceImgSrc } from "@/lib/image-store";
import { TypewriterHero } from "@/components/typewriter-hero";
import { MarkdownEditor } from "@/components/markdown-editor.tsx";
import welcomeMarkdownZh from "@/data/welcome-zh.md?raw";
import welcomeMarkdownEn from "@/data/welcome-en.md?raw";
import { ToolbarState } from "@/state/toolbarState";
import Sidebar from "@/components/sidebar/Sidebar";
import ProjectExplorer, { Project, ProjectFile } from "@/components/project/ProjectExplorer";
import {
  getCurrentProject,
  getFileById,
  updateFileContent,
  updateProject,
  initializeProjects
} from "@/services/projectService";
import { useProject } from "@/contexts";

// Move marked configuration to a separate constant
const markedInstance = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";

      return hljs.highlight(code, { language }).value;
    },
  }),
  markedKatex({
    throwOnError: false,
  }),
  {
    breaks: true,
  },
);

// Helper functions
const wrapWithContainer = (htmlString: string) => {
  return `<div class="container-layout" style="margin: 0;">
      <div class="article" style="max-width: 960px;margin: 0 auto;">${htmlString}</div>
    </div>`;
};

export default function IndexPage() {
  const { i18n } = useTranslation();
  const { articleStyle, template } = ToolbarState.useContainer();
  const { shortcodeInstance, stepRender, finalRender } = useProject();

  const [markdown, setMarkdown] = useState(welcomeMarkdownZh);
  const [isModified, setIsModified] = useState(false);
  const [inlineStyledHTML, setInlineStyledHTML] = useState("");
  const [showRenderedHTML, setShowRenderedHTML] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProjectExplorerCollapsed, setIsProjectExplorerCollapsed] = useState(false);
  
  // 项目和文件状态
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);

  // 初始化项目
  useEffect(() => {
    const language = i18n.language as "zh" | "en";
    const initialProject = initializeProjects(language);
    
    if (initialProject) {
      setCurrentProject(initialProject);
      
      // 设置初始选中的文件（通常是 index.md）
      if (initialProject.files.length > 0) {
        // 默认选择第一个非目录文件
        const firstFile = initialProject.files.find(file => !file.isDirectory);
        if (firstFile) {
          setSelectedFileId(firstFile.id);
          setSelectedFile(firstFile);
          setMarkdown(firstFile.content);
        }
      }
    } else {
      // 没有项目时，显示欢迎页面
      setCurrentProject(null);
      setSelectedFileId("");
      setSelectedFile(null);
      setMarkdown(i18n.language === "zh" ? welcomeMarkdownZh : welcomeMarkdownEn);
    }
    
    // 监听项目变更事件
    const handleProjectChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.projectId) {
        const project = getCurrentProject();
        if (project) {
          setCurrentProject(project);
          
          // 设置默认文件
          if (project.files.length > 0) {
            const firstFile = project.files.find(file => !file.isDirectory);
            if (firstFile) {
              setSelectedFileId(firstFile.id);
              setSelectedFile(firstFile);
              setMarkdown(firstFile.content);
            }
          }
        }
      }
    };
    
    window.addEventListener("project-changed", handleProjectChange);
    
    return () => {
      window.removeEventListener("project-changed", handleProjectChange);
    };
  }, [i18n.language]);

  // 文件选择处理
  const handleFileSelect = (fileId: string) => {
    if (!currentProject) return;
    
    const file = getFileById(currentProject.id, fileId);
    if (file && !file.isDirectory) {
      setSelectedFileId(fileId);
      setSelectedFile(file);
      setMarkdown(file.content);
      setIsModified(false);
    }
  };

  // 项目更新处理
  const handleProjectUpdate = (updatedProject: Project) => {
    if (updatedProject) {
      updateProject(updatedProject);
      setCurrentProject(updatedProject);
    }
  };

  useEffect(() => {
    setMarkdown(i18n.language === "zh" ? welcomeMarkdownZh : welcomeMarkdownEn);
  }, [i18n.language]);

  useEffect(() => {
    if (template !== "") {
      setMarkdown(template)
    } else {
      setMarkdown(i18n.language === "zh" ? welcomeMarkdownZh : welcomeMarkdownEn);
    }
  }, [template]);

  // Parse markdown to HTML and apply inline styles
  useEffect(() => {
    const parseMarkdown = async () => {
      try {
        // 处理 markdown 内容
        let parsedHTML = '';
        
        // 检查是否包含 shortcode 标签
        if (markdown.includes('{{<') && markdown.includes('>}}')) {
          // 使用 @mdfriday/shortcode 包进行处理
          // Step 1: 替换 shortcodes 为占位符
          const withPlaceholders = stepRender(markdown);
          
          // Step 2: 使用 marked 处理 markdown
          const htmlContent = await markedInstance.parse(withPlaceholders);
          
          // Step 3: 最终渲染，将占位符替换为渲染后的 shortcode 内容
          parsedHTML = finalRender(htmlContent);
        } else {
          // 普通 markdown 内容，直接使用 marked 处理
          parsedHTML = await markedInstance.parse(markdown);
        }
        
        // 处理图片链接并包装 HTML
        const wrappedHTML = wrapWithContainer(replaceImgSrc(parsedHTML));
        
        // 应用内联样式
        setInlineStyledHTML(inlineStyles(wrappedHTML, articleStyle));
      } catch (error) {
        console.error('Error parsing markdown:', error);
      }
    };

    parseMarkdown();
  }, [markdown, articleStyle, stepRender, finalRender]);

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
    setIsModified(true);
    
    // 如果有选中的文件，同时更新文件内容
    if (currentProject && selectedFile) {
      updateFileContent(currentProject.id, selectedFile.id, newMarkdown);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const toggleProjectExplorer = () => {
    setIsProjectExplorerCollapsed(!isProjectExplorerCollapsed);
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    if (isModified) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isModified]);

  // UI Components
  const EditorWithExplorer = (
    <div className="flex h-full w-full">
      {/* 项目文件浏览器 */}
      {currentProject ? (
        <ProjectExplorer
          project={currentProject}
          onFileSelect={handleFileSelect}
          onProjectUpdate={handleProjectUpdate}
          selectedFileId={selectedFileId}
          isCollapsed={isProjectExplorerCollapsed}
          onToggleCollapse={toggleProjectExplorer}
          className="shrink-0"
        />
      ) : (
        <div className="w-64 h-full border-r border-gray-200 p-4 shrink-0">
          <div className="text-center">
            <div className="text-gray-500 mb-2">没有项目</div>
            <div className="text-sm text-gray-400">
              请从侧边栏创建新项目
            </div>
          </div>
        </div>
      )}
      
      {/* Markdown 编辑器 */}
      <div className="flex-1 h-full min-w-0">
        <MarkdownEditor value={markdown} onChange={handleMarkdownChange} />
      </div>
    </div>
  );

  const RightContent = (
    <div className="h-full w-full p-3 overflow-auto">
      {showRenderedHTML ? (
        <div
          dangerouslySetInnerHTML={{ __html: inlineStyledHTML }}
          id="markdown-body"
          className="h-full max-w-4xl mx-auto pb-4"
        />
      ) : (
        inlineStyledHTML
      )}
    </div>
  );

  return (
    <DefaultLayout markdown={markdown}>
      <div className="flex h-full">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <div className={`transition-all duration-300 h-full w-full flex ${isSidebarOpen ? 'ml-64' : 'ml-14'}`}>
          <div className="w-full h-full px-2 py-2">
            <ResizableSplitPane
              initialLeftWidth={45}
              leftPane={EditorWithExplorer}
              maxLeftWidth={70}
              minLeftWidth={30}
              rightPane={RightContent}
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
