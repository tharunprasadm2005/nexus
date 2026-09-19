import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { projectService } from './project.service';

export class ProjectController {
  async getAll(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const result = await projectService.findAll(user, page, limit, search);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const project = await projectService.findById(req.params.id as string, user);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const project = await projectService.create(req.body, user.userId);
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const project = await projectService.update(req.params.id as string, req.body, user);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: Function) {
    try {
      const result = await projectService.delete(req.params.id as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();
