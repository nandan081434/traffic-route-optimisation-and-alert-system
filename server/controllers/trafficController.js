/**
 * SmartRoute - Traffic Controller
 */

import { getAllKits, getNetwork, getAllSignals } from '../services/trafficService.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');

export function getTrafficOverview(req, res) {
  try {
    const kits = getAllKits();
    const network = getNetwork();
    const signals = getAllSignals();

    // Calculate system wide metrics
    const totalVehicles = kits.reduce((sum, k) => sum + (k.vehicleUnits || 0), 0);
    const avgSpeed = kits.length > 0 
      ? Math.round(kits.reduce((sum, k) => sum + (k.averageSpeed || 0), 0) / kits.length) 
      : 35;
    const avgQueue = kits.length > 0
      ? Math.round(kits.reduce((sum, k) => sum + (k.queueLength || 0), 0) / kits.length)
      : 50;

    const highCongestionCount = kits.filter(k => k.trafficLevel === 'HIGH' || k.trafficLevel === 'SEVERE').length;

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalVehicleUnits: totalVehicles,
        averageNetworkSpeedKmH: avgSpeed,
        averageQueueLengthMeters: avgQueue,
        highCongestionRoads: highCongestionCount,
        activeKitsCount: kits.filter(k => k.status === 'ONLINE').length
      },
      roads: network.roads || [],
      kits
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getRoadTraffic(req, res) {
  try {
    const { roadId } = req.params;
    const network = getNetwork();
    const road = network.roads?.find(r => r.id === roadId);
    if (!road) {
      return res.status(404).json({ success: false, error: 'Road segment not found' });
    }
    res.json({ success: true, road });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getHistoricalAnalytics(req, res) {
  try {
    const data = JSON.parse(readFileSync(join(DATA_DIR, 'historicalAnalytics.json'), 'utf8'));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
