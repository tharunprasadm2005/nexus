import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getAccessToken } from '../services/api';
import { activityService } from '../services/api.service';

const WS_URL = import.meta.env.VITE_WS_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineCount: number;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  onlineCount: 0,
  joinProject: () => {},
  leaveProject: () => {},
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    try {
      const newSocket = io(WS_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        const lastSeen = localStorage.getItem('ws:lastSeen');
        if (lastSeen) {
          activityService.getMissedEvents(lastSeen).catch(() => {});
        }
        localStorage.setItem('ws:lastSeen', new Date().toISOString());
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        localStorage.setItem('ws:lastSeen', new Date().toISOString());
      });

      newSocket.on('connect_error', () => {
        setIsConnected(false);
      });

      newSocket.on('presence:update', (data: { onlineUsers: number }) => {
        setOnlineCount(data.onlineUsers);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    } catch (err) {
      console.error('WebSocket init error:', err);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user]);

  const joinProject = useCallback(
    (projectId: string) => {
      socket?.emit('join:project', projectId);
    },
    [socket]
  );

  const leaveProject = useCallback(
    (projectId: string) => {
      socket?.emit('leave:project', projectId);
    },
    [socket]
  );

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, onlineCount, joinProject, leaveProject }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
