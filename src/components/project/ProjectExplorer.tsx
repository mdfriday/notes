import { useState, useEffect } from "react";
import { Input } from "@nextui-org/input";
import { Tooltip } from "@nextui-org/tooltip";

// 项目类型定义
export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  path: string;
  isDirectory: boolean;
  children?: ProjectFile[];
}

export interface Project {
  id: string;
  name: string;
  type: "xiaohongshu" | "resume" | "website";
  templateId: string;
  files: ProjectFile[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectExplorerProps {
  project: Project;
  onFileSelect: (fileId: string) => void;
  onProjectUpdate: (project: Project) => void;
  selectedFileId: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

const ProjectExplorer: React.FC<ProjectExplorerProps> = ({
  project,
  onFileSelect,
  onProjectUpdate,
  selectedFileId,
  isCollapsed,
  onToggleCollapse,
  className = "",
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [updatedAt, setUpdatedAt] = useState(project.updatedAt);

  useEffect(() => {
    setProjectName(project.name);
  }, [project.name]);

  useEffect(() => {
    setUpdatedAt(project.updatedAt);
    console.log('ProjectExplorer - 项目更新时间已更新', new Date(project.updatedAt).toLocaleString());
  }, [project.updatedAt]);

  const handleNameChange = () => {
    if (projectName.trim() !== project.name) {
      const updatedProject = {
        ...project,
        name: projectName.trim(),
        updatedAt: new Date().toISOString(),
      };
      onProjectUpdate(updatedProject);
    }
    setIsEditingName(false);
  };

  const renderFile = (file: ProjectFile, depth = 0) => {
    const isSelected = file.id === selectedFileId;
    const paddingLeft = `${depth * 12 + 8}px`;

    if (file.isDirectory) {
      return (
        <div key={file.id}>
          <div
            className={`flex items-center px-2 py-1.5 hover:bg-gray-100 cursor-pointer`}
            style={{ paddingLeft }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-1.5 text-gray-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              />
            </svg>
            <span className="truncate">{file.name}</span>
          </div>
          {file.children?.map((child) => renderFile(child, depth + 1))}
        </div>
      );
    }

    return (
      <div
        key={file.id}
        className={`flex items-center px-2 py-1.5 hover:bg-gray-100 cursor-pointer ${
          isSelected ? "bg-blue-100 text-blue-700" : ""
        }`}
        style={{ paddingLeft }}
        onClick={() => onFileSelect(file.id)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 mr-1.5 text-gray-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <span className="truncate">{file.name}</span>
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <div className={`h-full flex flex-col border-r border-gray-200 ${className}`}>
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 text-center"
          title="展开项目浏览器"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 mx-auto"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col border-r border-gray-200 w-64 ${className}`}>
      {/* 项目信息头部 */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-gray-700">项目信息</h3>
          <button
            onClick={onToggleCollapse}
            className="text-gray-500 p-1 hover:bg-gray-100 rounded"
            title="收起项目浏览器"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
        </div>

        {isEditingName ? (
          <div className="mt-2 flex items-center">
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={handleNameChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameChange();
                if (e.key === "Escape") {
                  setProjectName(project.name);
                  setIsEditingName(false);
                }
              }}
              size="sm"
              autoFocus
              className="flex-1"
            />
          </div>
        ) : (
          <div
            className="mt-2 font-semibold cursor-pointer hover:bg-gray-100 py-1 px-2 rounded"
            onClick={() => setIsEditingName(true)}
          >
            {project.name}
            <Tooltip content="点击编辑项目名称">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3.5 h-3.5 ml-2 inline text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                />
              </svg>
            </Tooltip>
          </div>
        )}

        <div className="mt-1 text-xs text-gray-500 flex items-center">
          <span className="mr-2">类型:</span>
          <span>
            {project.type === "xiaohongshu" && "小红书"}
            {project.type === "resume" && "简历"}
            {project.type === "website" && "网站"}
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          更新时间: {new Date(updatedAt).toLocaleString()}
        </div>
      </div>

      {/* 文件列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-2">
          <h3 className="px-3 text-xs font-medium text-gray-700 mb-1">文件</h3>
          <div className="text-sm">
            {project.files.map((file) => renderFile(file))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectExplorer; 