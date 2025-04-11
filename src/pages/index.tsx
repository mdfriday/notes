import { useEffect, useState, useMemo } from "react";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { useTranslation } from "react-i18next";
import markedKatex from "marked-katex-extension";

import DefaultLayout from "@/layouts/default";
import ResizableSplitPane from "@/components/resizable-split-pane";
import inlineStyles from "@/core/utils/inline-styles.tsx";
import { replaceImgSrc } from "@/core/utils/image-store.tsx";
import { TypewriterHero } from "@/components/typewriter-hero";
import { MarkdownEditor } from "@/components/markdown-editor.tsx";
import welcomeMarkdownZh from "@/data/welcome-zh.md?raw";
import welcomeMarkdownEn from "@/data/welcome-en.md?raw";
import { ToolbarState } from "@/core/state/toolbarState";
import Sidebar from "@/components/sidebar/Sidebar";
import ProjectExplorer, { Project, ProjectFile } from "@/components/project/ProjectExplorer";
import {
  getCurrentProject,
  getFileById,
  updateFileContent,
  updateProject,
  initializeProjects
} from "@/core/services/projectService";
import { useProject } from "@/core/domain";
import { shortcodeService } from "@/core/services/shortcodeService";

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

  // 首先获取语言配置
  const language = i18n.language as "zh" | "en";
  
  // 状态初始化逻辑，使用更简化直接的方式
  // 直接从 localStorage 获取项目和第一个文件
  const initialProjectData = useMemo(() => {
    const project = getCurrentProject();
    if (!project) return { project: null, fileId: "", file: null, content: "" };
    
    // 找到第一个非目录文件
    const firstFile = project.files.find(file => !file.isDirectory);

    return {
      project,
      fileId: firstFile?.id || "",
      file: firstFile || null,
      content: firstFile?.content || ""
    };
  }, []);
  
  // 初始化状态
  const [currentProject, setCurrentProject] = useState<Project | null>(initialProjectData.project);
  const [selectedFileId, setSelectedFileId] = useState<string>(initialProjectData.fileId);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(initialProjectData.file);
  const [markdown, setMarkdown] = useState(() => {
    // 如果有文件内容，使用文件内容
    if (initialProjectData.content) {
      return initialProjectData.content;
    }
    // 否则使用默认欢迎内容
    return language === "zh" ? welcomeMarkdownZh : welcomeMarkdownEn;
  });
  
  const [isModified, setIsModified] = useState(false);
  const [inlineStyledHTML, setInlineStyledHTML] = useState("");
  const [showRenderedHTML, setShowRenderedHTML] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProjectExplorerCollapsed, setIsProjectExplorerCollapsed] = useState(false);

  // 处理项目初始化和shortcode注册
  useEffect(() => {
    // 检查状态一致性
    if (currentProject && selectedFile) {
      // 确保内容相等
      if (selectedFile.content !== markdown) {
        if (!isModified) {
          setMarkdown(selectedFile.content);
        } else {
          console.log('MD_FRIDAY_DEBUG: useEffect - 内容不一致但已修改，不更新markdown');
        }
      }
      
      // 确保shortcodes已注册
      const ensureShortcodes = async () => {
        try {
          await shortcodeService.ensureShortcodesRegistered(selectedFile.content);
        } catch (error) {
          console.error('Error processing shortcodes:', error);
        }
      };
      
      ensureShortcodes();
    }
    // 如果没有项目，尝试初始化
    else if (!currentProject) {
      const initialProject = initializeProjects(language);

      if (initialProject) {
        setCurrentProject(initialProject);
        
        // 设置初始选中的文件
        if (initialProject.files.length > 0) {
          const firstFile = initialProject.files.find(file => !file.isDirectory);
          if (firstFile) {
            setSelectedFileId(firstFile.id);
            setSelectedFile(firstFile);
            
            // 加载文件内容
            const loadFileContent = async () => {
              try {
                // 确保所有shortcode都已注册
                await shortcodeService.ensureShortcodesRegistered(firstFile.content);
                setMarkdown(firstFile.content);
              } catch (error) {
                console.error('Error processing shortcodes:', error);
                setMarkdown(firstFile.content);
              }
            };
            
            loadFileContent();
          }
        }
      } else {
        // 无项目时显示欢迎页面
        setMarkdown(language === "zh" ? welcomeMarkdownZh : welcomeMarkdownEn);
      }
    } 
    // 如果已有项目但没有选中文件，尝试选择第一个文件
    else if (currentProject && !selectedFile) {
      const firstFile = currentProject.files.find(file => !file.isDirectory);
      if (firstFile) {
        setSelectedFileId(firstFile.id);
        setSelectedFile(firstFile);
        
        // 加载文件内容
        const loadFileContent = async () => {
          try {
            await shortcodeService.ensureShortcodesRegistered(firstFile.content);
            setMarkdown(firstFile.content);
          } catch (error) {
            console.error('Error processing shortcodes:', error);
            setMarkdown(firstFile.content);
          }
        };
        
        loadFileContent();
      }
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
              
              // 加载文件内容
              const loadFileContent = async () => {
                try {
                  await shortcodeService.ensureShortcodesRegistered(firstFile.content);
                  setMarkdown(firstFile.content);
                  setIsModified(false); // 重置修改状态
                } catch (error) {
                  console.error('Error processing shortcodes:', error);
                  setMarkdown(firstFile.content);
                  setIsModified(false); // 重置修改状态
                }
              };
              
              loadFileContent();
            }
          }
        }
      }
    };
    
    window.addEventListener("project-changed", handleProjectChange);
    
    return () => {
      window.removeEventListener("project-changed", handleProjectChange);
    };
  }, [language, currentProject, selectedFile, selectedFileId, markdown, isModified]); // 添加更多依赖项

  // 文件选择处理
  const handleFileSelect = (fileId: string) => {
    if (!currentProject) {
      console.log('MD_FRIDAY_DEBUG: handleFileSelect - 无当前项目');
      return;
    }
    
    const file = getFileById(currentProject.id, fileId);
    if (file && !file.isDirectory) {
      // 保存状态变更
      setSelectedFileId(fileId);
      setSelectedFile(file);
      setIsModified(false); // 重要：重置修改状态
      
      // 在设置 markdown 内容之前，确保所有 shortcode 都已注册
      const loadFileWithShortcodes = async () => {
        try {
          // 检查内容中的 shortcode 并确保它们已注册
          await shortcodeService.ensureShortcodesRegistered(file.content);
          setMarkdown(file.content);
          setIsModified(false);
        } catch (error) {
          setMarkdown(file.content);
          setIsModified(false);
        }
      };
      
      loadFileWithShortcodes();
    } else {
      console.log('MD_FRIDAY_DEBUG: handleFileSelect - 文件不存在或是目录');
    }
  };

  // 项目更新处理
  const handleProjectUpdate = (updatedProject: Project) => {
    if (updatedProject) {
      updateProject(updatedProject);
      setCurrentProject(updatedProject);
    }
  };

  // 替换为一个更可控的useEffect
  useEffect(() => {
    // 只在没有项目或文件时应用模板或欢迎内容
    if (!currentProject || !selectedFile) {
      if (template !== "") {
        setMarkdown(template);
      } else {
        setMarkdown(i18n.language === "zh" ? welcomeMarkdownZh : welcomeMarkdownEn);
      }
    }
  }, [i18n.language, template, currentProject, selectedFile]);

  // Parse markdown to HTML and apply inline themes
  useEffect(() => {
    const parseMarkdown = async () => {
      try {
        // 处理 markdown 内容
        let parsedHTML = '';

        // 确保所有 shortcode 都已注册
        await shortcodeService.ensureShortcodesRegistered(markdown);

        // Step 1: 替换 shortcodes 为占位符
        const withPlaceholders = shortcodeService.stepRender(markdown);

        // Step 2: 使用 marked 处理 markdown
        const htmlContent = await markedInstance.parse(withPlaceholders);

        // Step 3: 最终渲染，将占位符替换为渲染后的 shortcode 内容
        parsedHTML = shortcodeService.finalRender(htmlContent);
        
        // 处理图片链接并包装 HTML
        const wrappedHTML = wrapWithContainer(replaceImgSrc(parsedHTML));
        
        // 应用内联样式
        setInlineStyledHTML(inlineStyles(wrappedHTML, articleStyle));
      } catch (error) {
        console.error('Error parsing markdown:', error);
      }
    };

    parseMarkdown();
  }, [markdown, articleStyle]);

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
    setIsModified(true);
    
    if (currentProject && selectedFile) {
      // 保存文件内容
      updateFileContent(currentProject.id, selectedFile.id, newMarkdown);
      
      // 更新当前项目对象，确保显示最新的修改时间
      const now = new Date().toISOString();
      const updatedProject = {
        ...currentProject,
        updatedAt: now
      };
      
      // 更新视图中的项目对象
      setCurrentProject(updatedProject);
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
