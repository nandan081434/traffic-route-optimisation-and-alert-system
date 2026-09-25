/**
 * SmartRoute - Socket.IO Client Wrapper
 * Handles environment-configurable WebSocket host (VITE_SOCKET_URL / VITE_API_URL)
 * with graceful fallback for static Netlify deployment.
 */

import { io } from 'socket.io-client';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    const SOCKET_HOST = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '';
    const isLocal = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    socketInstance = io(SOCKET_HOST || (isLocal ? undefined : ''), {
      reconnectionAttempts: isLocal ? 10 : 3,
      reconnectionDelay: 3000,
      transports: ['websocket', 'polling'],
      autoConnect: isLocal || Boolean(SOCKET_HOST),
      timeout: 5000
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to SmartRoute live stream:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      // Gentle debug in console; never block UI rendering
      if (isLocal) {
        console.warn('[Socket] Local stream connection standby:', err.message);
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });
  }

  return socketInstance;
}
