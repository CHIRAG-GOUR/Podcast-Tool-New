export interface SavedProject {
  id: string;
  name: string;
  fileKey: string | null;
  fileUrl: string | null;
  fileName: string;
  fileSize?: number;
  clips: any[];
  captions: any[];
  cuts: any[];
  updatedAt: string;
}

const STORAGE_KEY = "skilizee_podcast_projects";

export function getSavedProjects(): SavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load saved projects:", e);
    return [];
  }
}

export function saveProject(project: SavedProject): SavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    const projects = getSavedProjects();
    const index = projects.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      projects[index] = { ...projects[index], ...project, updatedAt: new Date().toISOString() };
    } else {
      projects.unshift({ ...project, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return projects;
  } catch (e) {
    console.error("Failed to save project:", e);
    return getSavedProjects();
  }
}

export function renameSavedProject(id: string, newName: string): SavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    const projects = getSavedProjects();
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      proj.name = newName;
      proj.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
    return projects;
  } catch (e) {
    console.error("Failed to rename project:", e);
    return getSavedProjects();
  }
}

export function deleteSavedProject(id: string): SavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    const projects = getSavedProjects().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return projects;
  } catch (e) {
    console.error("Failed to delete project:", e);
    return getSavedProjects();
  }
}
