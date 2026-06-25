import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import testRouter from './routes/test.routes';
import incidentRouter from './routes/incident.routes';
import { errorHandler } from './middleware/error.middleware';
import { setIO } from './utils/socket';

// Load environment variables from .env file
dotenv.config();

// Create Express server instance
const app = express();

// Create HTTP server wrapping express app for Socket.io support
const server = http.createServer(app);

// Determine execution port (fallback to 5000 if not specified in .env)
const PORT = process.env.PORT || 5000;

// Middleware configurations
app.use(cors({
  origin: '*', // In development, allow connections from any origin (e.g. Vite port 5173)
  credentials: true
}));
app.use(express.json());

// Initialize Socket.io server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true
  }
});

// Save socket server instance globally
setIO(io);

// Socket connection listener for debugging / telemetry
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id} (Total: ${io.engine.clientsCount})`);
  
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id} (Reason: ${reason})`);
  });
});

// API Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    message: 'StrayAid AEOS Backend is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Register routes
app.use('/api/test', testRouter);
app.use('/api/incidents', incidentRouter);

// Register global error handler middleware (must be registered after routes)
app.use(errorHandler);

// Start listening for incoming connections
server.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🐾 StrayAid AEOS Server is running!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`⚡ WebSocket Server: Ready for real-time sync`);
  console.log(`=============================================`);
});

