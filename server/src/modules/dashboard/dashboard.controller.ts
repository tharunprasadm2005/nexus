import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { dashboardService } from './dashboard.service';

export class DashboardController {
  async getAdminStats(req: AuthRequest, res: Response, next: Function) {
    try {
      const result = await dashboardService.getAdminStats();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getPMStats(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const result = await dashboardService.getPMStats(user);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getDeveloperStats(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const result = await dashboardService.getDeveloperStats(user);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
