import { Role, TaskStatus, Priority, User, Project, Task, ActivityLog, Notification } from '@prisma/client';

export { Role, TaskStatus, Priority };
export type { User, Project, Task, ActivityLog, Notification };

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthRequest extends Express.Request {
  user?: JwtPayload;
}

export interface TaskWithRelations extends Task {
  assignedTo: Pick<User, 'id' | 'name' | 'email'> | null;
  project: Pick<Project, 'id' | 'name'>;
}

export interface ProjectWithRelations extends Project {
  client: { id: string; name: string; email: string; company: string | null };
  createdBy: Pick<User, 'id' | 'name' | 'email'>;
  _count?: { tasks: number };
}

export interface ActivityLogWithUser extends ActivityLog {
  user: Pick<User, 'id' | 'name' | 'email'>;
  task: Pick<Task, 'id' | 'title'> & {
    project: Pick<Project, 'id' | 'name'>;
  };
}

export interface NotificationWithTask extends Notification {
  task?: Pick<Task, 'id' | 'title'> | null;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  overdueTasks: number;
  onlineUsers?: number;
}

export interface PMDashboardStats {
  projects: ProjectWithRelations[];
  tasksByPriority: Record<Priority, number>;
  upcomingDueDates: TaskWithRelations[];
}

export interface DevDashboardStats {
  assignedTasks: TaskWithRelations[];
}
