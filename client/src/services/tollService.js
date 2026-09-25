/**
 * SmartRoute - Toll Plaza Service
 * Handles toll plaza detection, cost estimation, and stop delay calculations.
 */

import { fallbackTolls } from '../data/fallbackData.js';

export const tollService = {
  /**
   * Get all active toll plazas
   */
  async getTolls() {
    return fallbackTolls;
  },

  /**
   * Determine tolls applicable to a polyline route
   */
  calculateRouteTolls(routeCoordinates = [], customTolls = null) {
    const tolls = customTolls || fallbackTolls;
    if (!routeCoordinates || routeCoordinates.length < 2) {
      return {
        tollsCount: 0,
        tollCost: 0,
        currency: '₹',
        tollPlazas: []
      };
    }

    // Proximity threshold ~ 1.5 km to detect toll along corridor
    const matched = tolls.filter((toll) => {
      return routeCoordinates.some(([lat, lng]) => {
        const dLat = Math.abs(lat - toll.latitude);
        const dLng = Math.abs(lng - toll.longitude);
        return dLat < 0.012 && dLng < 0.012;
      });
    });

    const totalCost = matched.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
    const totalDelay = matched.reduce((sum, t) => sum + (t.estimatedDelayMinutes || 2), 0);

    return {
      tollsCount: matched.length,
      tollCost: totalCost,
      currency: '₹',
      estimatedDelayMinutes: totalDelay,
      tollPlazas: matched
    };
  }
};
