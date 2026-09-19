import { prisma } from '../../config/database';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { CreateProjectInput, UpdateProjectInput } from './project.validation';
import { Role, Prisma } from '@prisma/client';
import { JwtPayload } from '../../types';

export class ProjectService {
  async findAll(user: JwtPayload, page = 1, limit = 20, search?: string) {
    const where: Prisma.ProjectWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (user.role === Role.PROJECT_MANAGER) {
      where.createdById = user.userId;
    } else if (user.role === Role.DEVELOPER) {
      where.tasks = { some: { assignedToId: user.userId } };
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true, company: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    return {
      projects,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, user: JwtPayload) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        },
      },
    });

    if (!project) throw new NotFoundError('Project');

    if (user.role === Role.PROJECT_MANAGER && project.createdById !== user.userId) {
      throw new ForbiddenError('You can only access your own projects');
    }

    if (user.role === Role.DEVELOPER) {
      const hasAssignedTask = project.tasks.some((t) => t.assignedToId === user.userId);
      if (!hasAssignedTask) {
        throw new ForbiddenError('You have no tasks in this project');
      }
    }

    return project;
  }

  async create(data: CreateProjectInput, userId: string) {
    const client = await prisma.client.findUnique({ where: { id: data.clientId } });
    if (!client) throw new NotFoundError('Client');

    const project = await prisma.project.create({
      data: {
        ...data,
        createdById: userId,
      },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return project;
  }

  async update(id: string, data: UpdateProjectInput, user: JwtPayload) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundError('Project');

    if (user.role === Role.PROJECT_MANAGER && project.createdById !== user.userId) {
      throw new ForbiddenError('You can only update your own projects');
    }

    if (data.clientId) {
      const client = await prisma.client.findUnique({ where: { id: data.clientId } });
      if (!client) throw new NotFoundError('Client');
    }

    const updated = await prisma.project.update({
      where: { id },
      data,
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return updated;
  }

  async delete(id: string) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundError('Project');

    await prisma.project.delete({ where: { id } });
    return { message: 'Project deleted successfully' };
  }
}

export const projectService = new ProjectService();
