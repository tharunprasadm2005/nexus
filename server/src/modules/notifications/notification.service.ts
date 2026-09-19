import { prisma } from '../../config/database';
import { JwtPayload } from '../../types';
import { NotFoundError } from '../../utils/errors';

export class NotificationService {
  async getNotifications(user: JwtPayload, page = 1, limit = 20) {
    const where = { userId: user.userId };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUnreadCount(user: JwtPayload) {
    const count = await prisma.notification.count({
      where: { userId: user.userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(id: string, user: JwtPayload) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundError('Notification');
    if (notification.userId !== user.userId) throw new NotFoundError('Notification');

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(user: JwtPayload) {
    await prisma.notification.updateMany({
      where: { userId: user.userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All notifications marked as read' };
  }

  async create(userId: string, type: string, title: string, message: string, relatedTaskId?: string) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedTaskId,
      },
    });
  }
}

export const notificationService = new NotificationService();
