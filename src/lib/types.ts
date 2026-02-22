export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'todo' | 'in-progress' | 'completed';
export type ProjectStatus = 'running' | 'stalled' | 'critical';

export interface Task {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    status: Status;
    projectId?: string; // Optional linkage to project
    subtasks?: Task[];
    dueDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    isVisible?: boolean;
    tags?: string[];
}

export interface Project {
    id: string;
    technicalId: string; // e.g., ORION_v2
    name: string;
    description?: string;
    status: ProjectStatus;
    progress: number; // 0-100
    totalTasks: number;
    completedTasks: number;
    tags: string[];
    color?: string; // For UI accents
    createdAt?: string | Date; // Appwrite returns string, we might convert to Date
    updatedAt?: string | Date;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    folderId?: string;
    isFavorite: boolean;
    tags: string[];
    projectId?: string;
    updatedAt?: Date;
}
