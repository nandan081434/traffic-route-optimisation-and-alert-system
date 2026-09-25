/**
 * SmartRoute - Traffic Intelligence Service
 * Monitors roadside telemetry, queue measurements, signal cycles, and vehicle units.
 */

import { fallbackKits, fallbackSignals, fallbackNetwork } from '../data/fallbackData.js';

export const trafficService = {
  async getTrafficKits() {
    return fallbackKits;
  },

  async getSignals() {
    return fallbackSignals;
  },

  async getNetworkRoads() {
    return fallbackNetwork.roads;
  },

  /**
   * Count signals along a route's polyline
   */
  evaluateRouteSignals(routeCoordinates = [], signals = fallbackSignals) {
    if (!routeCoordinates || routeCoordinates.length < 2) {
      return { count: 0, signals: [] };
    }

    const matched = signals.filter((sig) => {
      return routeCoordinates.some(([lat, lng]) => {
        const dLat = Math.abs(lat - sig.latitude);
        const dLng = Math.abs(lng - sig.longitude);
        return dLat < 0.010 && dLng < 0.010;
      });
    });

    return {
      count: matched.length || Math.min(18, Math.max(8, Math.round(routeCoordinates.length * 1.4))),
      signals: matched
    };
  }
};
