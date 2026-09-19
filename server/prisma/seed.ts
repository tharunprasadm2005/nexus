import { PrismaClient, Role, TaskStatus, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed script cannot be run in production');
  }

  console.log('Seeding database...');

  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const password = await hashPassword('password123');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@velozity.com',
      password,
      name: 'Alex Admin',
      role: Role.ADMIN,
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      email: 'pm1@velozity.com',
      password,
      name: 'Priya Manager',
      role: Role.PROJECT_MANAGER,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      email: 'pm2@velozity.com',
      password,
      name: 'Raj PM',
      role: Role.PROJECT_MANAGER,
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      email: 'dev1@velozity.com',
      password,
      name: 'Devon Developer',
      role: Role.DEVELOPER,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      email: 'dev2@velozity.com',
      password,
      name: 'Diana Coder',
      role: Role.DEVELOPER,
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      email: 'dev3@velozity.com',
      password,
      name: 'Dan Builder',
      role: Role.DEVELOPER,
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      email: 'dev4@velozity.com',
      password,
      name: 'Devi Engineer',
      role: Role.DEVELOPER,
    },
  });

  console.log('Created users');

  const client1 = await prisma.client.create({
    data: { name: 'Acme Corp', email: 'contact@acme.com', company: 'Acme Corporation' },
  });
  const client2 = await prisma.client.create({
    data: { name: 'TechStart Inc', email: 'hello@techstart.com', company: 'TechStart Inc' },
  });
  const client3 = await prisma.client.create({
    data: { name: 'DataCo', email: 'info@dataco.com', company: 'DataCo Analytics' },
  });

  console.log('Created clients');

  const project1 = await prisma.project.create({
    data: {
      name: 'E-Commerce Redesign',
      description: 'Complete redesign of the e-commerce platform with modern UI/UX',
      clientId: client1.id,
      createdById: pm1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App MVP',
      description: 'Build the first version of the mobile application',
      clientId: client2.id,
      createdById: pm1.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Analytics Dashboard',
      description: 'Real-time analytics dashboard for business intelligence',
      clientId: client3.id,
      createdById: pm2.id,
    },
  });

  console.log('Created projects');

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const tasks = [
    // Project 1: E-Commerce Redesign
    await prisma.task.create({
      data: {
        title: 'Design new homepage mockup',
        description: 'Create wireframes and high-fidelity mockups for the new homepage',
        projectId: project1.id,
        assignedToId: dev1.id,
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        dueDate: twoDaysAgo,
      },
    }),
    await prisma.task.create({
      data: {
        title: 'Implement product catalog API',
        description: 'Build REST API endpoints for product listing, search, and filtering',
        projectId: project1.id,
        assignedToId: dev2.id,
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: inThreeDays,
      },
    }),
    await prisma.task.create({
      data: {
        title: 'Set up payment gateway integration',
        description: 'Integrate Stripe payment processing for checkout flow',
        projectId: project1.id,
        assignedToId: dev1.id,
        status: TaskStatus.TODO,
        priority: Priority.CRITICAL,
        dueDate: nextWeek,
      },
    }),
    await prisma.task.create({
      data: {
        title: 'Write unit tests for cart module',
        description: 'Achieve 90% code coverage for shopping cart functionality',
        projectId: project1.id,
        assignedToId: dev3.id,
        status: TaskStatus.IN_REVIEW,
        priority: Priority.MEDIUM,
        dueDate: yesterday,
      },
    }),
    await prisma.task.create({
      data: {
        title: 'Fix checkout page mobile responsiveness',
        description: 'Layout breaks on screens smaller than 375px',
        projectId: project1.id,
        assignedToId: dev2.id,
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: twoDaysAgo,
        isOverdue: true,
      },
    }),

    // Project 2: Mobile App MVP
    await prisma.task.create({
      data: {
        title: 'Set up React Native project',
        description: 'Initialize project with navigation, state management, and CI/CD',
        projectId: project2.id,
        assignedToId: dev3.id,
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        dueDate: twoDaysAgo,
      },
    }),
    await prisma.task.create({
      data: {
        title: 'Implement user authentication screens',
        description: 'Login, register, and forgot password screens with form validation',
        projectId: project2.id,
        assignedToId: dev4.id,
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: inThreeDays,
      },
    }),
    await prisma.task.create({
      data: {
        title: 'Build home feed component',
        description: 'Implement infinite scroll feed with pull-to-refresh',
        projectId: project2.id,
        assignedToId: dev3.id,
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        dueDate: nextWeek,
      },
    }),
    await prisma.task.create({
      data: {
        title: 'Push notification setup',
        description: 'Configure Firebase Cloud Messaging for push notifications',
        projectId: project2.id,
        assignedToId: dev4.id,
        status: TaskStatus.TODO,
        priority: Priority.LOW,
        dueDate: nextWeek,
      },
    }),
    await prisma.task.create({
      data: {
        title: 'App store submission preparation',
        description: 'Prepare screenshots, descriptions, and metadata for App Store and Play Store',
        projectId: project2.id,
        assignedToId: dev3.id,
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      },
    }),
    await prisma.task.create({
      data: {
        title: 'Fix login crash on Android 12',
        description: 'App crashes when attempting login on Android 12 devices',
        projectId: project2.id,
        assignedToId: dev4.id,
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.CRITICAL,
        dueDate: yesterday,
        isOverdue: true,
      },
    }),

    // Project 3: Analytics Dashboard
    await prisma.task.create({
      data: {
        title: 'Design data visualization components',
        description: 'Create reusable chart components using D3.js or Recharts',
        projectId: project3.id,
        assignedToId: dev1.id,
        status: TaskStatus.IN_REVIEW,
        priority: Priority.HIGH,
        dueDate: inThreeDays,
      },
    }),
    await prisma.task.create({
      data: {
        title: 'Implement real-time data pipeline',
        description: 'Set up WebSocket connection for live dashboard updates',
        projectId: project3.id,
        assignedToId: dev2.id,
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.CRITICAL,
        dueDate: tomorrow(),
      },
    }),
    await prisma.task.create({
      data: {
        title: 'Build filter and date range selector',
        description: 'Add date range picker and multi-select filters for dashboard widgets',
        projectId: project3.id,
        assignedToId: dev1.id,
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        dueDate: nextWeek,
      },
    }),
    await prisma.task.create({
      data: {
        title: 'Export dashboard to PDF',
        description: 'Allow users to export current dashboard view as PDF report',
        projectId: project3.id,
        assignedToId: dev2.id,
        status: TaskStatus.TODO,
        priority: Priority.LOW,
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      },
    }),
    await prisma.task.create({
      data: {
        title: 'Performance optimization for large datasets',
        description: 'Dashboard loads slowly with 10k+ data points, implement virtualization',
        projectId: project3.id,
        assignedToId: dev1.id,
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        dueDate: twoDaysAgo,
      },
    }),
  ];

  console.log(`Created ${tasks.length} tasks`);

  // Create activity logs
  const activityLogs = [
    { taskId: tasks[0].id, userId: dev1.id, action: 'CREATED', newValue: 'TODO', message: 'Task was created' },
    { taskId: tasks[0].id, userId: dev1.id, action: 'STATUS_CHANGE', oldValue: 'TODO', newValue: 'IN_PROGRESS', message: 'moved from TODO → IN_PROGRESS' },
    { taskId: tasks[0].id, userId: dev1.id, action: 'STATUS_CHANGE', oldValue: 'IN_PROGRESS', newValue: 'IN_REVIEW', message: 'moved from IN_PROGRESS → IN_REVIEW' },
    { taskId: tasks[0].id, userId: pm1.id, action: 'STATUS_CHANGE', oldValue: 'IN_REVIEW', newValue: 'DONE', message: 'moved from IN_REVIEW → DONE' },

    { taskId: tasks[1].id, userId: pm1.id, action: 'CREATED', newValue: 'TODO', message: 'Task was created' },
    { taskId: tasks[1].id, userId: pm1.id, action: 'ASSIGNED', newValue: dev2.id, message: `Assigned to ${dev2.name}` },
    { taskId: tasks[1].id, userId: dev2.id, action: 'STATUS_CHANGE', oldValue: 'TODO', newValue: 'IN_PROGRESS', message: 'moved from TODO → IN_PROGRESS' },

    { taskId: tasks[3].id, userId: dev3.id, action: 'STATUS_CHANGE', oldValue: 'IN_PROGRESS', newValue: 'IN_REVIEW', message: 'moved from IN_PROGRESS → IN_REVIEW' },

    { taskId: tasks[4].id, userId: dev2.id, action: 'STATUS_CHANGE', oldValue: 'TODO', newValue: 'IN_PROGRESS', message: 'moved from TODO → IN_PROGRESS' },

    { taskId: tasks[6].id, userId: dev4.id, action: 'STATUS_CHANGE', oldValue: 'TODO', newValue: 'IN_PROGRESS', message: 'moved from TODO → IN_PROGRESS' },

    { taskId: tasks[11].id, userId: dev4.id, action: 'STATUS_CHANGE', oldValue: 'TODO', newValue: 'IN_PROGRESS', message: 'moved from TODO → IN_PROGRESS' },

    { taskId: tasks[12].id, userId: dev1.id, action: 'STATUS_CHANGE', oldValue: 'IN_PROGRESS', newValue: 'IN_REVIEW', message: 'moved from IN_PROGRESS → IN_REVIEW' },

    { taskId: tasks[13].id, userId: dev2.id, action: 'STATUS_CHANGE', oldValue: 'TODO', newValue: 'IN_PROGRESS', message: 'moved from TODO → IN_PROGRESS' },

    { taskId: tasks[15].id, userId: dev1.id, action: 'STATUS_CHANGE', oldValue: 'IN_PROGRESS', newValue: 'DONE', message: 'moved from IN_PROGRESS → DONE' },
  ];

  for (const log of activityLogs) {
    await prisma.activityLog.create({ data: log });
  }

  console.log('Created activity logs');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      { userId: dev2.id, type: 'TASK_ASSIGNED', title: 'New Task Assigned', message: `You have been assigned to "Implement product catalog API"`, relatedTaskId: tasks[1].id },
      { userId: dev1.id, type: 'TASK_ASSIGNED', title: 'New Task Assigned', message: `You have been assigned to "Set up payment gateway integration"`, relatedTaskId: tasks[2].id },
      { userId: pm1.id, type: 'TASK_IN_REVIEW', title: 'Task in Review', message: `"Write unit tests for cart module" has been moved to In Review`, relatedTaskId: tasks[3].id },
      { userId: pm1.id, type: 'TASK_IN_REVIEW', title: 'Task in Review', message: `"Design data visualization components" has been moved to In Review`, relatedTaskId: tasks[12].id },
    ],
  });

  console.log('Created notifications');
  console.log('Seed completed successfully!');
}

function tomorrow(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
