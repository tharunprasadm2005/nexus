import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { taskService } from './task.service';
import { TaskFilters } from './task.validation';

export class TaskController {
  async getByProject(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const projectId = req.params.projectId as string;
      const filters: TaskFilters = {
        status: req.query.status as any,
        priority: req.query.priority as any,
        dueDateFrom: req.query.dueDateFrom as string,
        dueDateTo: req.query.dueDateTo as string,
        assignedToId: req.query.assignedToId as string,
        page: parseInt(req.query.page as string) || undefined,
        limit: parseInt(req.query.limit as string) || undefined,
      };
      const result = await taskService.findByProject(projectId, user, filters);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const task = await taskService.findById(req.params.id as string, user);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const projectId = req.params.projectId as string;
      const task = await taskService.create(projectId, req.body, user.userId, user.role);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const result = await taskService.update(req.params.id as string, req.body, user);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMyTasks(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const filters: TaskFilters = {
        status: req.query.status as any,
        priority: req.query.priority as any,
        dueDateFrom: req.query.dueDateFrom as string,
        dueDateTo: req.query.dueDateTo as string,
        page: parseInt(req.query.page as string) || undefined,
        limit: parseInt(req.query.limit as string) || undefined,
      };
      const result = await taskService.getMyTasks(user, filters);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
