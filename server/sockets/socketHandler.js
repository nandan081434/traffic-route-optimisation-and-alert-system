/**
 * SmartRoute - Real-time Socket.IO Handler
 */

import { setIoInstance, runDemoScenario } from '../services/trafficSimulator.js';
import {
  getAllKits,
  getAllSignals,
  getAllIncidents,
  getAllConstruction,
  getNetwork
} from '../services/trafficService.js';
import { recalculateRoutes } from '../services/routeService.js';

export function setupSocketIO(io) {
  setIoInstance(io);

  io.on('connection', socket => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Send complete initial state snapshot to connected client
    const routeData = recalculateRoutes();
    socket.emit('traffic:snapshot', {
      timestamp: new Date().toISOString(),
      kits: getAllKits(),
      signals: getAllSignals(),
      incidents: getAllIncidents(),
      construction: getAllConstruction(),
      network: getNetwork(),
      routes: routeData.routes,
      recommendedRoute: routeData.recommendedRoute,
      explanation: routeData.explanation
    });

    // Client requested immediate recalculation
    socket.on('client:recalculate', () => {
      const result = recalculateRoutes();
      io.emit('route:update', result);
    });

    // Client stepped through demo scenario
    socket.on('client:demo-step', data => {
      const step = data?.step || 1;
      runDemoScenario(step);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}
