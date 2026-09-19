import http from 'http';
import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { setupWebSocket } from './websocket/socketHandler';
import { startOverdueChecker } from './jobs/overdueChecker';

const server = http.createServer(app);
const io = setupWebSocket(server);

(app as any).io = io;

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL database');

    startOverdueChecker();

    server.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
