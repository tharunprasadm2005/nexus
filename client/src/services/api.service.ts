import api from './api';
import { ApiResponse, User } from '../types';

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/login', { email, password });
    return data.data;
  },

  async register(email: string, password: string, name: string, role?: string) {
    const { data } = await api.post<ApiResponse<User>>('/auth/register', { email, password, name, role });
    return data.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },
};

export const userService = {
  async getAll(page = 1, limit = 20, search?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    const { data } = await api.get(`/users?${params}`);
    return data;
  },

  async getDevelopers() {
    const { data } = await api.get('/users/developers');
    return data.data;
  },

  async create(userData: any) {
    const { data } = await api.post('/users', userData);
    return data.data;
  },

  async update(id: string, userData: any) {
    const { data } = await api.put(`/users/${id}`, userData);
    return data.data;
  },

  async delete(id: string) {
    await api.delete(`/users/${id}`);
  },
};

export const projectService = {
  async getAll(page = 1, limit = 20, search?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    const { data } = await api.get(`/projects?${params}`);
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get(`/projects/${id}`);
    return data.data;
  },

  async create(projectData: any) {
    const { data } = await api.post('/projects', projectData);
    return data.data;
  },

  async update(id: string, projectData: any) {
    const { data } = await api.put(`/projects/${id}`, projectData);
    return data.data;
  },

  async delete(id: string) {
    await api.delete(`/projects/${id}`);
  },
};

export const taskService = {
  async getByProject(projectId: string, filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/projects/${projectId}/tasks?${params}`);
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get(`/tasks/${id}`);
    return data.data;
  },

  async create(projectId: string, taskData: any) {
    const { data } = await api.post(`/projects/${projectId}/tasks`, taskData);
    return data.data;
  },

  async update(id: string, taskData: any) {
    const { data } = await api.put(`/tasks/${id}`, taskData);
    return data.data;
  },

  async getMyTasks(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/tasks/my-tasks?${params}`);
    return data;
  },
};

export const activityService = {
  async getGlobalFeed(page = 1, limit = 20) {
    const { data } = await api.get(`/activity/global?page=${page}&limit=${limit}`);
    return data;
  },

  async getProjectFeed(projectId: string, page = 1, limit = 20) {
    const { data } = await api.get(`/activity/project/${projectId}?page=${page}&limit=${limit}`);
    return data;
  },

  async getMissedEvents(lastSeen?: string) {
    const params = lastSeen ? `?lastSeen=${lastSeen}` : '';
    const { data } = await api.get(`/activity/missed${params}`);
    return data.data;
  },
};

export const notificationService = {
  async getAll(page = 1, limit = 20) {
    const { data } = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return data;
  },

  async getUnreadCount() {
    const { data } = await api.get('/notifications/unread-count');
    return data.data.count;
  },

  async markAsRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await api.patch('/notifications/read-all');
  },
};

export const dashboardService = {
  async getAdminStats() {
    const { data } = await api.get('/dashboard/admin');
    return data.data;
  },

  async getPMStats() {
    const { data } = await api.get('/dashboard/pm');
    return data.data;
  },

  async getDeveloperStats() {
    const { data } = await api.get('/dashboard/developer');
    return data.data;
  },
};

export const clientService = {
  async getAll() {
    const { data } = await api.get('/clients');
    return data;
  },
};
