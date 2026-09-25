/**
 * SmartRoute - Traffic Service & Data Store
 * Architecture structured for clean migration to PostgreSQL/Supabase.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { calculateTrafficLevel, calculateTrafficScore } from '../utils/trafficLogic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');

// In-Memory Data Store (Can be backed by PostgreSQL / Supabase)
let trafficKits = [];
let signals = [];
let incidents = [];
let construction = [];
let networkData = {};
let routes = [];

// Initialize data from local JSON
export function initTrafficData() {
  try {
    trafficKits = JSON.parse(readFileSync(join(DATA_DIR, 'trafficKits.json'), 'utf8'));
    signals = JSON.parse(readFileSync(join(DATA_DIR, 'signals.json'), 'utf8'));
    incidents = JSON.parse(readFileSync(join(DATA_DIR, 'incidents.json'), 'utf8'));
    construction = JSON.parse(readFileSync(join(DATA_DIR, 'construction.json'), 'utf8'));
    const routesDoc = JSON.parse(readFileSync(join(DATA_DIR, 'routes.json'), 'utf8'));
    networkData = routesDoc.network;
    routes = routesDoc.routes;
    console.log('[TrafficService] In-memory datasets loaded successfully.');
  } catch (err) {
    console.error('[TrafficService] Failed to load data files:', err);
  }
}

// ----------------- Traffic Kits -----------------
export function getAllKits() {
  return trafficKits;
}

export function getKitById(id) {
  return trafficKits.find(k => k.id === id);
}

export function updateKitData(kitId, updateFields) {
  const index = trafficKits.findIndex(k => k.id === kitId);
  if (index === -1) return null;

  const current = trafficKits[index];
  const vehicleUnits = updateFields.vehicleUnits !== undefined ? Number(updateFields.vehicleUnits) : current.vehicleUnits;
  const queueLength = updateFields.queueLength !== undefined ? Number(updateFields.queueLength) : current.queueLength;
  const averageSpeed = updateFields.averageSpeed !== undefined ? Number(updateFields.averageSpeed) : current.averageSpeed;
  const waitingTime = updateFields.waitingTime !== undefined ? Number(updateFields.waitingTime) : current.waitingTime;
  const signalStatus = updateFields.signalStatus || current.signalStatus;
  const status = updateFields.status || current.status;

  const trafficLevel = calculateTrafficLevel(vehicleUnits, queueLength);

  trafficKits[index] = {
    ...current,
    ...updateFields,
    vehicleUnits,
    queueLength,
    averageSpeed,
    waitingTime,
    signalStatus,
    trafficLevel,
    status,
    lastUpdated: new Date().toISOString()
  };

  // Sync associated road segment
  if (current.roadId) {
    updateRoadTraffic(current.roadId, {
      vehicleUnits,
      queueLength,
      currentSpeed: averageSpeed,
      trafficLevel
    });
  }

  return trafficKits[index];
}

export function createKit(newKit) {
  const id = newKit.id || `TS-${String(trafficKits.length + 1).padStart(3, '0')}`;
  const trafficLevel = calculateTrafficLevel(newKit.vehicleUnits || 0, newKit.queueLength || 0);
  const kit = {
    ...newKit,
    id,
    vehicleUnits: Number(newKit.vehicleUnits || 0),
    queueLength: Number(newKit.queueLength || 0),
    averageSpeed: Number(newKit.averageSpeed || 40),
    waitingTime: Number(newKit.waitingTime || 15),
    trafficLevel,
    status: newKit.status || 'ONLINE',
    lastUpdated: new Date().toISOString()
  };
  trafficKits.push(kit);
  return kit;
}

export function deleteKit(id) {
  const index = trafficKits.findIndex(k => k.id === id);
  if (index === -1) return false;
  trafficKits.splice(index, 1);
  return true;
}

// ----------------- Signals -----------------
export function getAllSignals() {
  return signals;
}

export function getSignalById(id) {
  return signals.find(s => s.id === id);
}

export function updateSignal(id, updateFields) {
  const index = signals.findIndex(s => s.id === id);
  if (index === -1) return null;
  signals[index] = { ...signals[index], ...updateFields };
  return signals[index];
}

export function createSignal(newSignal) {
  const id = newSignal.id || `TS-${String(signals.length + 101)}`;
  const signal = {
    ...newSignal,
    id,
    status: newSignal.status || 'GREEN',
    redRemaining: Number(newSignal.redRemaining || 0),
    greenRemaining: Number(newSignal.greenRemaining || 30),
    yellowRemaining: Number(newSignal.yellowRemaining || 0),
    vehiclesWaiting: Number(newSignal.vehiclesWaiting || 5),
    queueLength: Number(newSignal.queueLength || 25),
    averageWaitingTime: Number(newSignal.averageWaitingTime || 15),
    cycleSeconds: Number(newSignal.cycleSeconds || 60)
  };
  signals.push(signal);
  return signal;
}

// ----------------- Incidents -----------------
export function getAllIncidents() {
  return incidents;
}

export function getIncidentById(id) {
  return incidents.find(i => i.id === id);
}

export function createIncident(newIncident) {
  const id = newIncident.id || `INC-${Date.now().toString().slice(-4)}`;
  const incident = {
    ...newIncident,
    id,
    severity: newIncident.severity || 'MEDIUM',
    status: newIncident.status || 'ACTIVE',
    reportedAt: newIncident.reportedAt || new Date().toISOString(),
    delayMinutes: Number(newIncident.delayMinutes || 8)
  };
  incidents.unshift(incident);

  // If road is marked or closure
  if (incident.roadId) {
    if (incident.type === 'Emergency Closure' || incident.severity === 'CRITICAL') {
      closeRoad(incident.roadId);
    }
  }

  return incident;
}

export function updateIncident(id, updateFields) {
  const index = incidents.findIndex(i => i.id === id);
  if (index === -1) return null;
  incidents[index] = { ...incidents[index], ...updateFields };
  return incidents[index];
}

export function deleteIncident(id) {
  const index = incidents.findIndex(i => i.id === id);
  if (index === -1) return false;
  incidents.splice(index, 1);
  return true;
}

// ----------------- Construction -----------------
export function getAllConstruction() {
  return construction;
}

export function getConstructionById(id) {
  return construction.find(c => c.id === id);
}

export function createConstruction(newConst) {
  const id = newConst.id || `CONST-${Date.now().toString().slice(-4)}`;
  const item = {
    ...newConst,
    id,
    affectedDistance: Number(newConst.affectedDistance || 300),
    lanesBefore: Number(newConst.lanesBefore || 2),
    lanesAfter: Number(newConst.lanesAfter || 1),
    trafficImpact: newConst.trafficImpact || 'HIGH',
    status: newConst.status || 'IN_PROGRESS',
    delayMinutes: Number(newConst.delayMinutes || 5)
  };
  construction.unshift(item);
  return item;
}

export function updateConstruction(id, updateFields) {
  const index = construction.findIndex(c => c.id === id);
  if (index === -1) return null;
  construction[index] = { ...construction[index], ...updateFields };
  return construction[index];
}

export function deleteConstruction(id) {
  const index = construction.findIndex(c => c.id === id);
  if (index === -1) return false;
  construction.splice(index, 1);
  return true;
}

// ----------------- Road Network -----------------
export function getNetwork() {
  return networkData;
}

export function updateRoadTraffic(roadId, fields) {
  if (!networkData.roads) return;
  const road = networkData.roads.find(r => r.id === roadId);
  if (road) {
    Object.assign(road, fields);
  }
}

export function closeRoad(roadId) {
  if (!networkData.roads) return;
  const road = networkData.roads.find(r => r.id === roadId);
  if (road) {
    road.isClosed = true;
    road.trafficLevel = 'CLOSED';
    road.currentSpeed = 0;
  }
}

export function reopenRoad(roadId) {
  if (!networkData.roads) return;
  const road = networkData.roads.find(r => r.id === roadId);
  if (road) {
    road.isClosed = false;
    road.trafficLevel = 'LOW';
    road.currentSpeed = road.freeFlowSpeed;
  }
}

// ----------------- Routes -----------------
export function getRoutes() {
  return routes;
}

export function updateRoutes(newRoutes) {
  routes = newRoutes;
}

// Initialize on module load
initTrafficData();
