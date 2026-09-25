/**
 * SmartRoute - Incident & Hazard Service
 * Tracks collisions, road work, hazards, and closures.
 */

import { fallbackIncidents } from '../data/fallbackData.js';

export const incidentService = {
  async getIncidents() {
    return fallbackIncidents;
  },

  /**
   * Check route against active incidents & road closures
   */
  evaluateRouteIncidents(routeCoordinates = [], incidents = fallbackIncidents) {
    if (!routeCoordinates || routeCoordinates.length < 2) {
      return {
        incidentsCount: 0,
        closuresCount: 0,
        hazardsCount: 0,
        delayMinutes: 0,
        hasClosure: false,
        affectedIncidents: []
      };
    }

    const matched = incidents.filter((inc) => {
      if (inc.status !== 'ACTIVE' && inc.status !== 'IN_PROGRESS') return false;
      return routeCoordinates.some(([lat, lng]) => {
        const dLat = Math.abs(lat - inc.latitude);
        const dLng = Math.abs(lng - inc.longitude);
        return dLat < 0.012 && dLng < 0.012;
      });
    });

    const closures = matched.filter(i =>
      i.type?.toLowerCase().includes('closure') ||
      i.description?.toLowerCase().includes('closed')
    );
    const delay = matched.reduce((sum, i) => sum + (i.delayMinutes || 5), 0);

    return {
      incidentsCount: matched.length,
      closuresCount: closures.length,
      hazardsCount: matched.filter(i => !closures.includes(i)).length,
      delayMinutes: delay,
      hasClosure: closures.length > 0,
      affectedIncidents: matched
    };
  }
};
