import { Project, ProjectFile } from "@/components/project/ProjectExplorer.tsx";
import welcomeMarkdownZh from "@/data/welcome-zh.md?raw";
import welcomeMarkdownEn from "@/data/welcome-en.md?raw";

// 引入新的模板文件
import xiaohongshuTemplate from "@/data/templates/xiaohongshu/index.md?raw";
import resumeTemplate from "@/data/templates/resume/index.md?raw";
import websiteIndexTemplate from "@/data/templates/website/index.md?raw";
import websiteCompanyTemplate from "@/data/templates/website/about/company.md?raw";

// 本地存储键名
const PROJECTS_STORAGE_KEY = "md_friday_projects";
const CURRENT_PROJECT_ID_KEY = "md_friday_current_project_id";

// 生成随机ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// 获取所有项目
export const getAllProjects = (): Project[] => {
  const projectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
  return projectsJson ? JSON.parse(projectsJson) : [];
};

// 获取当前项目ID
export const getCurrentProjectId = (): string | null => {
  return localStorage.getItem(CURRENT_PROJECT_ID_KEY);
};

// 设置当前项目ID
export const setCurrentProjectId = (projectId: string): void => {
  localStorage.setItem(CURRENT_PROJECT_ID_KEY, projectId);
};

// 获取当前项目
export const getCurrentProject = (): Project | null => {
  const projectId = getCurrentProjectId();
  if (!projectId) {
    console.log('MD_FRIDAY_DEBUG: getCurrentProject - 没有当前项目ID');
    return null;
  }

  const projects = getAllProjects();
  return projects.find(p => p.id === projectId) || null;
};

// 获取指定项目
export const getProjectById = (projectId: string): Project | null => {
  const projects = getAllProjects();
  return projects.find(p => p.id === projectId) || null;
};

// 保存项目列表
export const saveProjects = (projects: Project[]): void => {
  try {
    const jsonStr = JSON.stringify(projects);
    localStorage.setItem(PROJECTS_STORAGE_KEY, jsonStr);
  } catch (error) {
    console.error('MD_FRIDAY_DEBUG: saveProjects - 保存失败，错误:', error);
  }
};

// 更新项目
export const updateProject = (project: Project): void => {
  const projects = getAllProjects();
  const index = projects.findIndex(p => p.id === project.id);
  
  if (index !== -1) {
    const now = new Date().toISOString();
    projects[index] = {
      ...project,
      updatedAt: now
    };
    saveProjects(projects);

  } else {
    console.warn('MD_FRIDAY_DEBUG: updateProject - 未找到项目，无法更新', project.id);
  }
};

// 获取文件内容
export const getFileById = (projectId: string, fileId: string): ProjectFile | null => {
  const project = getProjectById(projectId);
  if (!project) return null;
  
  const findFile = (files: ProjectFile[]): ProjectFile | null => {
    for (const file of files) {
      if (file.id === fileId) return file;
      if (file.isDirectory && file.children) {
        const found = findFile(file.children);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findFile(project.files);
};

// 更新文件内容
export const updateFileContent = (projectId: string, fileId: string, content: string): void => {
  const project = getProjectById(projectId);
  if (!project) {
    console.warn('MD_FRIDAY_DEBUG: updateFileContent - 未找到项目，无法更新', projectId);
    return;
  }

  const updateFileInArray = (files: ProjectFile[]): boolean => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].id === fileId) {
        files[i].content = content;
        return true;
      }
      if (files[i].isDirectory && files[i].children) {
        // 确保 children 不是 undefined
        const children = files[i].children || [];
        if (updateFileInArray(children)) return true;
      }
    }
    return false;
  };
  
  try {
    const filesCopy = JSON.parse(JSON.stringify(project.files));
    const fileUpdated = updateFileInArray(filesCopy);

    if (fileUpdated) {
      const updatedProject = {
        ...project,
        files: filesCopy,
        updatedAt: new Date().toISOString()
      };
      updateProject(updatedProject);
    } else {
      console.warn('MD_FRIDAY_DEBUG: updateFileContent - 未找到文件，无法更新', fileId);
    }
  } catch (error) {
    console.error('MD_FRIDAY_DEBUG: updateFileContent - 更新过程中发生错误', error);
  }
};

// 删除项目
export const deleteProject = (projectId: string): void => {
  const projects = getAllProjects().filter(p => p.id !== projectId);
  saveProjects(projects);
  
  // 如果删除的是当前项目，重置当前项目ID
  if (getCurrentProjectId() === projectId) {
    if (projects.length > 0) {
      setCurrentProjectId(projects[0].id);
    } else {
      localStorage.removeItem(CURRENT_PROJECT_ID_KEY);
    }
  }
};

// 初始化项目列表
export const initializeProjects = (language: "zh" | "en" = "zh"): Project | null => {
  const projects = getAllProjects();
  
  // 没有项目时，返回 null
  if (projects.length === 0) {
    // 不再自动创建默认项目，而是等待用户通过 shortcode 创建
    localStorage.removeItem(CURRENT_PROJECT_ID_KEY);
    return null;
  }
  
  // 确保有当前项目ID
  const currentProjectId = getCurrentProjectId();
  if (!currentProjectId || !projects.some(p => p.id === currentProjectId)) {
    setCurrentProjectId(projects[0].id);
    return projects[0];
  }
  
  return getCurrentProject();
}; 