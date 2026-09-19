export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
  isActive: boolean;
  createdAt: string;
  _count?: { assignedTasks: number; createdProjects: number };
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  createdById: string;
  client: Client;
  createdBy: Pick<User, 'id' | 'name' | 'email'>;
  tasks?: Task[];
  _count?: { tasks: number };
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  assignedToId: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  isOverdue: boolean;
  assignedTo: Pick<User, 'id' | 'name' | 'email'> | null;
  project: Pick<Project, 'id' | 'name'>;
  activityLogs?: ActivityLog[];
  createdAt: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  message: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
  task: Pick<Task, 'id' | 'title'> & { project: Pick<Project, 'id' | 'name'> };
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedTaskId: string | null;
  task?: Pick<Task, 'id' | 'title'> | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string; fields?: Record<string, string> };
}
