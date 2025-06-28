import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { UseSocketReturn } from '@/types';
import { SERVER_CONFIG, WEBRTC_CONFIG, SOCKET_EVENTS } from '@/constants';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useSocket');

export const useSocket = (): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(SERVER_CONFIG.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: WEBRTC_CONFIG.CONNECTION_TIMEOUT,
      reconnection: true,
      reconnectionDelay: WEBRTC_CONFIG.RECONNECTION_DELAY,
      reconnectionAttempts: WEBRTC_CONFIG.MAX_RECONNECTION_ATTEMPTS,
      forceNew: true, // Force a new connection to avoid stale connections
      autoConnect: true,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on(SOCKET_EVENTS.CONNECT, () => {
      logger.log('Connected to signaling server');
      setIsConnected(true);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logger.log('Disconnected from signaling server:', reason);
      setIsConnected(false);
    });

    socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      logger.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socket.on(SOCKET_EVENTS.RECONNECT, (attemptNumber) => {
      logger.log('Reconnected to signaling server after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    socket.on(SOCKET_EVENTS.RECONNECT_ERROR, (error) => {
      logger.error('Socket reconnection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
  };
};