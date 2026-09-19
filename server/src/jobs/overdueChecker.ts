import cron from 'node-cron';
import { prisma } from '../config/database';

export function startOverdueChecker() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const overdueTasks = await prisma.task.findMany({
        where: {
          isOverdue: false,
          status: { not: 'DONE' },
          dueDate: { lt: new Date() },
        },
        include: {
          assignedTo: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      });

      if (overdueTasks.length === 0) return;

      console.log(`[Overdue Checker] Found ${overdueTasks.length} overdue tasks`);

      for (const task of overdueTasks) {
        await prisma.task.update({
          where: { id: task.id },
          data: { isOverdue: true },
        });

        await prisma.activityLog.create({
          data: {
            taskId: task.id,
            userId: task.assignedToId || 'system',
            action: 'OVERDUE',
            oldValue: task.status,
            newValue: 'OVERDUE',
            message: `Task "${task.title}" is now overdue`,
          },
        });

        if (task.assignedToId) {
          await prisma.notification.create({
            data: {
              userId: task.assignedToId,
              type: 'TASK_OVERDUE',
              title: 'Task Overdue',
              message: `Task "${task.title}" in project "${task.project.name}" is now overdue`,
              relatedTaskId: task.id,
            },
          });
        }
      }
    } catch (error) {
      console.error('[Overdue Checker] Error:', error);
    }
  });

  console.log('[Overdue Checker] Scheduled to run every 5 minutes');
}
