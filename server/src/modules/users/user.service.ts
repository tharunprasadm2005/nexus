import { prisma } from '../../config/database';
import { hashPassword } from '../../utils/password';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { CreateUserInput, UpdateUserInput } from './user.validation';
import { Prisma } from '@prisma/client';

export class UserService {
  async findAll(page = 1, limit = 20, search?: string) {
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { assignedTasks: true, createdProjects: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { assignedTasks: true, createdProjects: true } },
      },
    });

    if (!user) throw new NotFoundError('User');
    return user;
  }

  async create(data: CreateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictError('Email already registered');

    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async update(id: string, data: UpdateUserInput) {
    await this.findById(id);

    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, id: { not: id } },
      });
      if (existing) throw new ConflictError('Email already in use');
    }

    const updateData: Prisma.UserUpdateInput = { ...data };
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  async findDevelopers() {
    return prisma.user.findMany({
      where: { role: 'DEVELOPER', isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
  }
}

export const userService = new UserService();
