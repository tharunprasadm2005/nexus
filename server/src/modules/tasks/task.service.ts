import { prisma } from '../../config/database';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { CreateTaskInput, UpdateTaskInput, TaskFilters } from './task.validation';
import { Role, Prisma, TaskStatus } from '@prisma/client';
import { JwtPayload } from '../../types';
import { notificationService } from '../notifications/notification.service';
import { getIO, sendNotification, broadcastTaskUpdate } from '../../websocket/socketHandler';

function formatStatusChange(oldStatus: TaskStatus, newStatus: TaskStatus): string {
  const format = (s: string) => s.replace('_', ' ');
  return `${format(oldStatus)} → ${format(newStatus)}`;
}

export class TaskService {
  async findByProject(projectId: string, user: JwtPayload, filters: TaskFilters) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError('Project');

    if (user.role === Role.PROJECT_MANAGER && project.createdById !== user.userId) {
      throw new ForbiddenError('Access denied');
    }

    if (user.role === Role.DEVELOPER) {
      const hasTask = await prisma.task.findFirst({
        where: { projectId, assignedToId: user.userId },
      });
      if (!hasTask) throw new ForbiddenError('No tasks in this project');
    }

    const where: Prisma.TaskWhereInput = { projectId };

    if (user.role === Role.DEVELOPER) {
      where.assignedToId = user.userId;
    }

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assignedToId && user.role !== Role.DEVELOPER) {
      where.assignedToId = filters.assignedToId;
    }
    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) where.dueDate.gte = new Date(filters.dueDateFrom);
      if (filters.dueDateTo) where.dueDate.lte = new Date(filters.dueDateTo);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, user: JwtPayload) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: {
          select: {
            id: true,
            name: true,
            createdById: true,
          },
        },
        activityLogs: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!task) throw new NotFoundError('Task');

    if (user.role === Role.PROJECT_MANAGER && task.project.createdById !== user.userId) {
      throw new ForbiddenError('Access denied');
    }

    if (user.role === Role.DEVELOPER && task.assignedToId !== user.userId) {
      throw new ForbiddenError('You can only view your own tasks');
    }

    return task;
  }

  async create(projectId: string, data: CreateTaskInput, userId: string, userRole: Role) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError('Project');

    if (userRole === Role.PROJECT_MANAGER && project.createdById !== userId) {
      throw new ForbiddenError('You can only add tasks to your own projects');
    }

    if (data.assignedToId) {
      const assignee = await prisma.user.findUnique({ where: { id: data.assignedToId } });
      if (!assignee || assignee.role !== Role.DEVELOPER) {
        throw new NotFoundError('Valid developer');
      }
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId,
        assignedToId: data.assignedToId || null,
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: data.status || 'TODO',
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        taskId: task.id,
        userId,
        action: 'CREATED',
        newValue: task.status,
        message: `Task "${task.title}" was created with status ${task.status.replace('_', ' ')}`,
      },
    });

    if (task.assignedToId) {
      const notification = await notificationService.create(
        task.assignedToId,
        'TASK_ASSIGNED',
        'New Task Assigned',
        `You have been assigned to "${task.title}"`,
        task.id,
      );
      const io = getIO();
      if (io) {
        const unread = await prisma.notification.count({ where: { userId: task.assignedToId, isRead: false } });
        sendNotification(io, task.assignedToId, notification, unread);
      }
    }

    return task;
  }

  async update(id: string, data: UpdateTaskInput, user: JwtPayload) {
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: { project: { select: { createdById: true } } },
    });

    if (!existingTask) throw new NotFoundError('Task');

    if (user.role === Role.PROJECT_MANAGER && existingTask.project.createdById !== user.userId) {
      throw new ForbiddenError('You can only update tasks in your projects');
    }

    if (user.role === Role.DEVELOPER && existingTask.assignedToId !== user.userId) {
      throw new ForbiddenError('You can only update your own tasks');
    }

    if (user.role === Role.DEVELOPER) {
      if (data.assignedToId !== undefined || data.title !== undefined || data.description !== undefined || data.priority !== undefined || data.dueDate !== undefined) {
        throw new ForbiddenError('Developers can only update task status');
      }
    }

    const statusChanged = data.status && data.status !== existingTask.status;
    const assigneeChanged = data.assignedToId !== undefined && data.assignedToId !== existingTask.assignedToId;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate === null ? null : undefined,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    const activityPromises: Promise<any>[] = [];

    if (statusChanged) {
      activityPromises.push(
        prisma.activityLog.create({
          data: {
            taskId: id,
            userId: user.userId,
            action: 'STATUS_CHANGE',
            oldValue: existingTask.status,
            newValue: data.status!,
            message: `moved from ${formatStatusChange(existingTask.status, data.status!)}`,
          },
        })
      );
    }

    if (assigneeChanged) {
      activityPromises.push(
        prisma.activityLog.create({
          data: {
            taskId: id,
            userId: user.userId,
            action: 'ASSIGNED',
            oldValue: existingTask.assignedToId,
            newValue: data.assignedToId,
            message: data.assignedToId ? `Assigned to ${task.assignedTo?.name || 'developer'}` : 'Unassigned',
          },
        })
      );
    }

    if (activityPromises.length === 0 && (data.title || data.description || data.priority || data.dueDate !== undefined)) {
      activityPromises.push(
        prisma.activityLog.create({
          data: {
            taskId: id,
            userId: user.userId,
            action: 'UPDATED',
            message: 'Task details were updated',
          },
        })
      );
    }

    await Promise.all(activityPromises);

    const io = getIO();
    if (io) {
      const latestActivity = activityPromises.length > 0
        ? await prisma.activityLog.findFirst({ where: { taskId: id }, orderBy: { createdAt: 'desc' } })
        : null;
      broadcastTaskUpdate(io, existingTask.projectId, task, latestActivity, user.userId);
    }

    if (statusChanged && data.status === 'IN_REVIEW') {
      const project = await prisma.project.findUnique({ where: { id: existingTask.projectId } });
      if (project) {
        const notification = await notificationService.create(
          project.createdById,
          'TASK_IN_REVIEW',
          'Task in Review',
          `"${task.title}" has been moved to In Review`,
          task.id,
        );
        const ioInstance = getIO();
        if (ioInstance) {
          const unread = await prisma.notification.count({ where: { userId: project.createdById, isRead: false } });
          sendNotification(ioInstance, project.createdById, notification, unread);
        }
      }
    }

    if (assigneeChanged && data.assignedToId) {
      const notification = await notificationService.create(
        data.assignedToId,
        'TASK_ASSIGNED',
        'New Task Assigned',
        `You have been assigned to "${task.title}"`,
        task.id,
      );
      const ioInstance = getIO();
      if (ioInstance) {
        const unread = await prisma.notification.count({ where: { userId: data.assignedToId, isRead: false } });
        sendNotification(ioInstance, data.assignedToId, notification, unread);
      }
    }

    return { task, statusChanged, assigneeChanged };
  }

  async getMyTasks(user: JwtPayload, filters: TaskFilters) {
    if (user.role !== Role.DEVELOPER) {
      throw new ForbiddenError('This endpoint is for developers only');
    }

    const where: Prisma.TaskWhereInput = { assignedToId: user.userId };

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) where.dueDate.gte = new Date(filters.dueDateFrom);
      if (filters.dueDateTo) where.dueDate.lte = new Date(filters.dueDateTo);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const taskService = new TaskService();
