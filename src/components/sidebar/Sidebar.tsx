import { useState, useEffect } from "react";
import { Button } from "@nextui-org/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import Gallery from "@/components/gallery/Gallery";
import { 
  getAllProjects, 
  setCurrentProjectId
} from "@/core/services/projectService";
import { Project } from "@/components/project/ProjectExplorer";
import { useTranslation } from "react-i18next";
import CreateProjectModal from "@/components/project/CreateProjectModal";
import ModalLayout from "@/components/ui/ModalLayout";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onProjectSelect?: (projectId: string) => void;
}

export default function Sidebar({ isOpen, onToggle, onProjectSelect }: SidebarProps) {
  const { i18n, t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectIdState] = useState<string | null>(null);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  // 初始化加载项目
  useEffect(() => {
    const loadProjects = () => {
      const allProjects = getAllProjects();
      setProjects(allProjects);
      
      // 获取当前项目ID
      const currentId = localStorage.getItem("md_friday_current_project_id");
      setCurrentProjectIdState(currentId);
    };
    
    loadProjects();
    
    // 监听本地存储变化
    const handleStorageChange = () => {
      loadProjects();
    };
    
    // 监听项目更新事件
    const handleProjectUpdate = () => {
      loadProjects();
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("project-updated", handleProjectUpdate);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("project-updated", handleProjectUpdate);
    };
  }, []);

  // 模板数据不再需要，已由后端接口提供
  
  const handleProjectClick = (id: string) => {
    setCurrentProjectId(id);
    setCurrentProjectIdState(id);
    
    if (onProjectSelect) {
      onProjectSelect(id);
    }
    
    // 触发一个自定义事件以通知其他组件
    window.dispatchEvent(new CustomEvent("project-changed", { detail: { projectId: id } }));
  };

  const handleProjectCreated = (projectId: string) => {
    // 重新加载项目列表
    const allProjects = getAllProjects();
    setProjects(allProjects);
    
    // 设置当前项目ID
    setCurrentProjectIdState(projectId);
    
    // 通知父组件
    if (onProjectSelect) {
      onProjectSelect(projectId);
    }
    
    // 触发项目变更事件
    window.dispatchEvent(new CustomEvent("project-changed", { detail: { projectId } }));
    
    console.log('Project created and selected:', projectId);
  };

  return (
    <>
      {/* Collapsible sidebar */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-white transition-all duration-300 z-10 border-r border-gray-200 shadow-sm flex flex-col ${
          isOpen ? "w-64" : "w-14"
        }`}
      >
        {/* Toggle button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-5 bg-white rounded-full p-1 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-0" : "rotate-180"
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        {/* Sidebar content - only show text when expanded */}
        <div className="p-3 overflow-y-auto flex-grow">
          {/* Projects section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3
                className={`font-medium text-sm ${
                  isOpen ? "opacity-100" : "opacity-0"
                } transition-opacity`}
              >
                {isOpen ? "项目" : ""}
              </h3>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 mr-1"
                title="创建新项目"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            </div>

            {/* Project list */}
            <div className="space-y-1.5">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                      project.id === currentProjectId
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="mr-2">
                      {project.type === "xiaohongshu" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
                          />
                        </svg>
                      )}
                      {project.type === "resume" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                          />
                        </svg>
                      )}
                      {project.type === "website" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                          />
                        </svg>
                      )}
                    </div>
                    <div
                      className={`truncate ${
                        isOpen ? "block" : "hidden"
                      }`}
                    >
                      {project.name}
                    </div>
                  </div>
                ))
              ) : (
                <div className={`p-2 ${isOpen ? "block" : "hidden"}`}>
                  <div className="text-sm text-gray-500">
                    还没有项目，点击上方 + 按钮创建
                  </div>
                  <button 
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="mt-2 w-full py-2 bg-blue-100 text-blue-600 rounded-md text-sm hover:bg-blue-200"
                  >
                    创建第一个项目
                  </button>
                </div>
              )}
            </div>
          </div>

          <Divider className="my-3" />

          {/* Gallery link */}
          <div
            className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
              isOpen ? "justify-start" : "justify-center"
            }`}
            onClick={() => setIsGalleryModalOpen(true)}
          >
            <div className="">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
            <div
              className={`truncate ${
                isOpen ? "block" : "hidden"
              }`}
            >
              素材库
            </div>
          </div>
        </div>
      </div>

      {/* 使用新的 CreateProjectModal 组件 */}
      <CreateProjectModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Gallery modal - 直接使用 Gallery 组件，它已经包含了所有所需的UI元素 */}
      <ModalLayout
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        title="素材库"
      >
        <Gallery />
      </ModalLayout>
    </>
  );
} 