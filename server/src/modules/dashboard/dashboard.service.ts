import { prisma } from '../../config/database';
import { JwtPayload } from '../../types';
import { Role } from '@prisma/client';

export class DashboardService {
  async getAdminStats() {
    const [totalProjects, totalTasks, tasksByStatus, overdueTasks] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.task.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.task.count({ where: { isOverdue: true } }),
    ]);

    const statusMap: Record<string, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
    };
    tasksByStatus.forEach((item) => {
      statusMap[item.status] = item._count.id;
    });

    return {
      totalProjects,
      totalTasks,
      tasksByStatus: statusMap,
      overdueTasks,
    };
  }

  async getPMStats(user: JwtPayload) {
    const projects = await prisma.project.findMany({
      where: { createdById: user.userId },
      include: {
        client: { select: { id: true, name: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const tasksByPriority = await prisma.task.groupBy({
      by: ['priority'],
      where: { project: { createdById: user.userId } },
      _count: { id: true },
    });

    const priorityMap: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };
    tasksByPriority.forEach((item) => {
      priorityMap[item.priority] = item._count.id;
    });

    const upcomingDueDates = await prisma.task.findMany({
      where: {
        project: { createdById: user.userId },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: { not: 'DONE' },
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    return {
      projects,
      tasksByPriority: priorityMap,
      upcomingDueDates,
    };
  }

  async getDeveloperStats(user: JwtPayload) {
    const assignedTasks = await prisma.task.findMany({
      where: { assignedToId: user.userId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });

    return { assignedTasks };
  }
}

export const dashboardService = new DashboardService();
