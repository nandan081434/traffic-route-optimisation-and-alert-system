/**
 * SmartRoute - Traffic Kit Controller & IoT Hardware Ingest API
 * 
 * Supports both dashboard management and remote microcontrollers (ESP32/Arduino).
 */

import {
  getAllKits,
  getKitById,
  updateKitData,
  createKit,
  deleteKit
} from '../services/trafficService.js';
import { recalculateRoutes } from '../services/routeService.js';
import { createNotification } from '../services/notificationService.js';

export function getKits(req, res) {
  try {
    const kits = getAllKits();
    res.json({ success: true, count: kits.length, kits });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getKit(req, res) {
  try {
    const kit = getKitById(req.params.id);
    if (!kit) {
      return res.status(404).json({ success: false, error: `Kit ${req.params.id} not found` });
    }
    res.json({ success: true, kit });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function addKit(req, res) {
  try {
    const { name, location, latitude, longitude, roadId } = req.body;
    if (!name || !location) {
      return res.status(400).json({ success: false, error: 'Name and location are required' });
    }

    const kit = createKit(req.body);
    res.status(201).json({ success: true, kit });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function editKit(req, res) {
  try {
    const updated = updateKitData(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Kit ${req.params.id} not found` });
    }
    res.json({ success: true, kit: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function removeKit(req, res) {
  try {
    const deleted = deleteKit(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Kit ${req.params.id} not found` });
    }
    res.json({ success: true, message: `Kit ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * IoT Hardware API Endpoint: POST /api/traffic-kits/update
 * Consumes telemetry from roadside monitoring kits (ESP32, Arduino, Camera, Ultrasonic).
 * 
 * IMPORTANT VEHICLE COUNTING RULE:
 * The kit measures VEHICLE UNITS, not passenger capacity.
 * Car=1, Bus=1, Truck=1, Auto=1, Motorcycle=1.
 */
export function handleHardwareTelemetry(req, res) {
  try {
    const { kitId, vehicleUnits, queueLength, averageSpeed, waitingTime, signalStatus, timestamp } = req.body;

    // Strict validation
    if (!kitId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: kitId (e.g. "TS-001")'
      });
    }

    if (vehicleUnits === undefined || typeof Number(vehicleUnits) !== 'number' || isNaN(vehicleUnits) || vehicleUnits < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicleUnits. Must be non-negative integer count of vehicle units.'
      });
    }

    if (queueLength === undefined || typeof Number(queueLength) !== 'number' || isNaN(queueLength) || queueLength < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid queueLength. Must be non-negative distance in meters.'
      });
    }

    const kit = getKitById(kitId);
    if (!kit) {
      return res.status(404).json({
        success: false,
        error: `Registered traffic kit ${kitId} not found in SmartRoute network.`
      });
    }

    const updatedKit = updateKitData(kitId, {
      vehicleUnits: Number(vehicleUnits),
      queueLength: Number(queueLength),
      averageSpeed: averageSpeed !== undefined ? Number(averageSpeed) : kit.averageSpeed,
      waitingTime: waitingTime !== undefined ? Number(waitingTime) : kit.waitingTime,
      signalStatus: signalStatus || kit.signalStatus,
      status: 'ONLINE',
      lastTelemetryTimestamp: timestamp || new Date().toISOString()
    });

    // Check if reroute needed
    const routeResult = recalculateRoutes();

    res.json({
      success: true,
      message: `Hardware packet acknowledged for ${kitId}`,
      kit: updatedKit,
      trafficLevel: updatedKit.trafficLevel,
      routeRecalculated: routeResult.routeChanged
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
