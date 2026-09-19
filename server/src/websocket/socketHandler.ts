import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';
import { prisma } from '../config/database';
import { Role } from '@prisma/client';

const onlineUsers = new Map<string, Set<string>>();
const socketUserMap = new Map<string, JwtPayload>();
let ioInstance: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

export function setupWebSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
    transports: ['websocket'],
  });
  ioInstance = io;

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      socketUserMap.set(socket.id, decoded);
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socketUserMap.get(socket.id);
    if (!user) return;

    console.log(`User connected: ${user.email} (${socket.id})`);

    if (!onlineUsers.has(user.userId)) {
      onlineUsers.set(user.userId, new Set());
    }
    onlineUsers.get(user.userId)!.add(socket.id);

    socket.join(`user:${user.userId}`);

    io.emit('presence:update', { onlineUsers: onlineUsers.size });

    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      io.to(`project:${projectId}`).emit('user:online', {
        userId: user.userId,
        name: user.email,
        projectId,
      });
    });

    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(user.userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(user.userId);
        }
      }
      socketUserMap.delete(socket.id);
      io.emit('presence:update', { onlineUsers: onlineUsers.size });
      console.log(`User disconnected: ${user.email}`);
    });
  });

  return io;
}

export function broadcastTaskUpdate(
  io: SocketIOServer,
  projectId: string,
  task: any,
  activity: any,
  updatedBy: string
) {
  io.to(`project:${projectId}`).emit('task:updated', {
    task,
    activity,
    updatedBy,
  });

  io.to(`project:${projectId}`).emit('activity:new', activity);
}

export function sendNotification(
  io: SocketIOServer,
  userId: string,
  notification: any,
  unreadCount: number
) {
  io.to(`user:${userId}`).emit('notification:new', notification);
  io.to(`user:${userId}`).emit('notification:count', { count: unreadCount });
}

export function getOnlineUserCount(): number {
  return onlineUsers.size;
}
