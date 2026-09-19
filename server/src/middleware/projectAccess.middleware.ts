import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { prisma } from '../config/database';
import { Role } from '@prisma/client';

export function checkProjectAccess(paramName: string = 'projectId') {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
        return;
      }

      if (user.role === Role.ADMIN) {
        next();
        return;
      }

      const projectId = req.params[paramName] as string;
      if (!projectId) {
        next();
        return;
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { createdById: true },
      });

      if (!project) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Project not found' },
        });
        return;
      }

      if (user.role === Role.PROJECT_MANAGER && project.createdById !== user.userId) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You can only access your own projects' },
        });
        return;
      }

      if (user.role === Role.DEVELOPER) {
        const hasAssignedTask = await prisma.task.findFirst({
          where: {
            projectId,
            assignedToId: user.userId,
          },
        });

        if (!hasAssignedTask) {
          res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'You have no tasks in this project' },
          });
          return;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function checkTaskAccess() {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
        return;
      }

      if (user.role === Role.ADMIN) {
        next();
        return;
      }

      const taskId = (req.params.taskId || req.params.id) as string;
      if (!taskId) {
        next();
        return;
      }

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
          assignedToId: true,
          project: { select: { createdById: true } },
        },
      });

      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      if (user.role === Role.PROJECT_MANAGER && task.project.createdById !== user.userId) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You can only access tasks in your projects' },
        });
        return;
      }

      if (user.role === Role.DEVELOPER && task.assignedToId !== user.userId) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You can only access your own tasks' },
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
