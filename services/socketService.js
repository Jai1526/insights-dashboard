import { Server } from 'socket.io';

let io = null;

export function initSocketIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join a room for authenticated users
    const token = socket.handshake.auth?.token;
    if (token) {
      socket.join('authenticated');
    }

    socket.on('subscribe_range', (range) => {
      socket.join(`range:${range}`);
      console.log(`[Socket] ${socket.id} subscribed to range:${range}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[Socket] Socket.IO initialized');
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocketIO first.');
  }
  return io;
}

// Emit a real-time traffic event to all connected clients
export function emitTrafficEvent(event) {
  if (!io) return;
  io.to('authenticated').emit('traffic_event', event);
  io.to('authenticated').emit('dashboard_update', { type: 'traffic' });
}

// Emit dashboard data update notification
export function emitDashboardUpdate(data) {
  if (!io) return;
  io.to('authenticated').emit('dashboard_update', data);
}