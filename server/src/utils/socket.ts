import { Server } from 'socket.io';

let ioInstance: Server | null = null;

/**
 * Store the Socket.io Server instance globally for routing/broadcasting from controllers or services.
 */
export const setIO = (io: Server): void => {
  ioInstance = io;
};

/**
 * Retrieve the active Socket.io Server instance.
 */
export const getIO = (): Server | null => {
  return ioInstance;
};

/**
 * Helper to emit real-time events to all connected clients.
 */
export const emitRealtimeEvent = (event: string, data: unknown): void => {
  if (ioInstance) {
    ioInstance.emit(event, data);
  } else {
    console.log(`⚠️ Realtime: Tried to emit event "${event}" but Socket.io is not initialized yet.`);
  }
};
