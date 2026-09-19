import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { notificationService } from './notification.service';

export class NotificationController {
  async getNotifications(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await notificationService.getNotifications(user, page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const result = await notificationService.getUnreadCount(user);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const notification = await notificationService.markAsRead(req.params.id as string, user);
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const result = await notificationService.markAllAsRead(user);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
