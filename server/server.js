/**
 * SmartRoute - Backend Server
 * Intelligent Traffic, Navigation & Dynamic Route Management System
 * 
 * Future Hardware Integration:
 * Microcontrollers (ESP32/Arduino) connect via HTTP POST /api/traffic-kits/update
 * or via WebSockets with payload { kitId, vehicleUnits, queueLength, averageSpeed, waitingTime, signalStatus, timestamp }
 * 
 * Future Database Integration:
 * Replace in-memory trafficService with PostgreSQL / Supabase client queries.
 */

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import trafficRoutes from './routes/trafficRoutes.js';
import kitRoutes from './routes/kitRoutes.js';
import signalRoutes from './routes/signalRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import constructionRoutes from './routes/constructionRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { setupSocketIO } from './sockets/socketHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SmartRoute',
    version: '1.0.0',
    mode: 'Simulated Road Intelligence Prototype',
    timestamp: new Date().toISOString()
  });
});

// Mount Feature Routers
app.use('/api/traffic', trafficRoutes);
app.use('/api/traffic-kits', kitRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/construction', constructionRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch-all 404 for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `Endpoint ${req.originalUrl} not found` });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Initialize HTTP & WebSocket Server
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSocketIO(io);

httpServer.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 SmartRoute Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server listening for real-time events`);
  console.log(`🚦 IoT Hardware Endpoint: POST /api/traffic-kits/update`);
  console.log(`====================================================`);
});
