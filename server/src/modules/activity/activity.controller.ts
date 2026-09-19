import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { activityService } from './activity.service';

export class ActivityController {
  async getGlobalFeed(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await activityService.getGlobalFeed(user, page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getProjectFeed(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const projectId = req.params.projectId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await activityService.getProjectFeed(projectId, user, page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getMissedEvents(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const lastSeen = req.query.lastSeen as string | undefined;
      const result = await activityService.getMissedEvents(user, lastSeen);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getTaskFeed(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const taskId = req.params.taskId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await activityService.getTaskFeed(taskId, user, page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const activityController = new ActivityController();
