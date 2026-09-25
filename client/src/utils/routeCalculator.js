/**
 * SmartRoute - Client Route Helpers
 */

export const ROUTE_COLORS = {
  active: '#38bdf8',       // Glowing sky blue
  recommended: '#10b981',  // Emerald Green
  alternate: '#64748b',    // Muted slate
  severe: '#ef4444',       // Red for heavy congestion
  closed: '#334155'        // Dark slate for closed road
};

export function getRoutePolylineColor(route, isSelected) {
  if (route.isClosed) return ROUTE_COLORS.closed;
  if (isSelected) {
    if (route.trafficLevel === 'SEVERE') return ROUTE_COLORS.severe;
    return route.status === 'RECOMMENDED' ? ROUTE_COLORS.recommended : ROUTE_COLORS.active;
  }
  return ROUTE_COLORS.alternate;
}
