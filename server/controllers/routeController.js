/**
 * SmartRoute - Route Controller
 */

import { recalculateRoutes } from '../services/routeService.js';
import {
  simulateHeavyTraffic,
  simulateAccident,
  simulateConstruction,
  simulateRoadClosure,
  resetSimulator,
  runDemoScenario,
  startSimulator,
  pauseSimulator,
  isSimulatorRunning
} from '../services/trafficSimulator.js';
import { getRoutes } from '../services/trafficService.js';

export function calculateRoutesHandler(req, res) {
  try {
    const result = recalculateRoutes();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getCurrentRoutes(req, res) {
  try {
    const routes = getRoutes();
    const result = recalculateRoutes();
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function triggerHeavyTraffic(req, res) {
  try {
    const result = simulateHeavyTraffic();
    res.json({
      success: true,
      message: 'Simulated heavy traffic on Central Expressway (Kit TS-001). Route recalculation initiated.',
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function triggerAccident(req, res) {
  try {
    const result = simulateAccident();
    res.json({
      success: true,
      message: 'Simulated multi-vehicle accident on Central Expressway. Incident registered and route recalculated.',
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function triggerConstruction(req, res) {
  try {
    const result = simulateConstruction();
    res.json({
      success: true,
      message: 'Simulated lane reduction construction on Central Expressway.',
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function triggerRoadClosure(req, res) {
  try {
    const result = simulateRoadClosure();
    res.json({
      success: true,
      message: 'Simulated emergency road closure. Central Expressway marked CLOSED and bypassed.',
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function triggerResetTraffic(req, res) {
  try {
    const result = resetSimulator();
    res.json({
      success: true,
      message: 'Simulation reset to baseline conditions.',
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function triggerDemoStep(req, res) {
  try {
    const step = Number(req.body.step || 1);
    const result = runDemoScenario(step);
    res.json({
      success: true,
      step,
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function toggleSimulatorHandler(req, res) {
  try {
    const { action } = req.body;
    let result;
    if (action === 'pause') {
      result = pauseSimulator();
    } else {
      result = startSimulator();
    }
    res.json({ success: true, running: isSimulatorRunning(), result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
