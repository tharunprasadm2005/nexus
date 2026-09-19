import { prisma } from '../../config/database';
import { Role, Prisma } from '@prisma/client';
import { JwtPayload } from '../../types';

export class ActivityService {
  async getGlobalFeed(user: JwtPayload, page = 1, limit = 20) {
    const where: Prisma.ActivityLogWhereInput = {};

    if (user.role === Role.PROJECT_MANAGER) {
      where.task = { project: { createdById: user.userId } };
    } else if (user.role === Role.DEVELOPER) {
      where.task = { assignedToId: user.userId };
    }

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          task: {
            select: {
              id: true,
              title: true,
              project: { select: { id: true, name: true } },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      activities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProjectFeed(projectId: string, user: JwtPayload, page = 1, limit = 20) {
    const where: Prisma.ActivityLogWhereInput = {
      task: { projectId },
    };

    if (user.role === Role.PROJECT_MANAGER) {
      where.task = { projectId, project: { createdById: user.userId } };
    } else if (user.role === Role.DEVELOPER) {
      where.task = { projectId, assignedToId: user.userId };
    }

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          task: {
            select: {
              id: true,
              title: true,
              project: { select: { id: true, name: true } },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      activities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getMissedEvents(user: JwtPayload, lastSeen?: string) {
    const where: Prisma.ActivityLogWhereInput = {};

    if (lastSeen) {
      where.createdAt = { gt: new Date(lastSeen) };
    }

    if (user.role === Role.PROJECT_MANAGER) {
      where.task = { project: { createdById: user.userId } };
    } else if (user.role === Role.DEVELOPER) {
      where.task = { assignedToId: user.userId };
    }

    const activities = await prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: {
          select: {
            id: true,
            title: true,
            project: { select: { id: true, name: true } },
          },
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return activities.reverse();
  }

  async getTaskFeed(taskId: string, user: JwtPayload, page = 1, limit = 20) {
    const where: Prisma.ActivityLogWhereInput = { taskId };

    if (user.role === Role.PROJECT_MANAGER) {
      where.task = { id: taskId, project: { createdById: user.userId } };
    } else if (user.role === Role.DEVELOPER) {
      where.task = { id: taskId, assignedToId: user.userId };
    }

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          task: {
            select: {
              id: true,
              title: true,
              project: { select: { id: true, name: true } },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      activities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const activityService = new ActivityService();
