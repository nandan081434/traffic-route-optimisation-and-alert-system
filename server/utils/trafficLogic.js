/**
 * SmartRoute - Core Traffic Logic & Scoring Engine
 * 
 * IMPORTANT VEHICLE COUNTING RULE:
 * The roadside traffic kit counts VEHICLES, not passengers.
 * Every vehicle counts as exactly ONE UNIT.
 * (Car = 1, Bus = 1, Truck = 1, Auto = 1, Motorcycle = 1, Van = 1)
 * A bus carrying 40 passengers is still 1 vehicle unit.
 */

export const TRAFFIC_THRESHOLDS = {
  LOW: { maxUnits: 9, maxQueue: 49 },
  MODERATE: { minUnits: 10, maxUnits: 20, minQueue: 50, maxQueue: 100 },
  HIGH: { minUnits: 21, maxUnits: 40, minQueue: 101, maxQueue: 200 },
  SEVERE: { minUnits: 41, minQueue: 201 }
};

export const ROUTE_WEIGHTS = {
  trafficDelay: 1.0,
  signalDelay: 0.8,
  constructionDelay: 1.2,
  accidentDelay: 2.0,
  closurePenalty: 9999 // Effectively disables closed roads from recommended selection
};

/**
 * Calculates discrete traffic level from vehicle units and queue length.
 * Follows strict threshold guidelines:
 * LOW: vehicleUnits < 10 AND queueLength < 50
 * MODERATE: vehicleUnits 10-20 OR queue 50-100
 * HIGH: vehicleUnits 21-40 OR queue 100-200
 * SEVERE: vehicleUnits > 40 OR queue > 200
 */
export function calculateTrafficLevel(vehicleUnits, queueLength) {
  if (vehicleUnits > 40 || queueLength > 200) {
    return 'SEVERE';
  }
  if ((vehicleUnits >= 21 && vehicleUnits <= 40) || (queueLength >= 101 && queueLength <= 200)) {
    return 'HIGH';
  }
  if ((vehicleUnits >= 10 && vehicleUnits <= 20) || (queueLength >= 50 && queueLength <= 100)) {
    return 'MODERATE';
  }
  return 'LOW';
}

/**
 * Computes a normalized traffic score between 0 and 100
 * 0-25: LOW, 26-50: MODERATE, 51-75: HIGH, 76-100: SEVERE
 */
export function calculateTrafficScore({ vehicleUnits = 0, queueLength = 0, averageSpeed = 50, waitingTime = 0, freeFlowSpeed = 50 }) {
  // 1. Vehicle density contribution (0 to 30)
  const unitFactor = Math.min(30, (vehicleUnits / 50) * 30);
  
  // 2. Queue length contribution (0 to 35)
  const queueFactor = Math.min(35, (queueLength / 250) * 35);
  
  // 3. Speed deficit contribution (0 to 20)
  const speedDeficit = Math.max(0, freeFlowSpeed - averageSpeed);
  const speedFactor = Math.min(20, (speedDeficit / freeFlowSpeed) * 20);
  
  // 4. Waiting time contribution (0 to 15)
  const waitFactor = Math.min(15, (waitingTime / 120) * 15);
  
  const score = Math.round(unitFactor + queueFactor + speedFactor + waitFactor);
  return Math.min(100, Math.max(0, score));
}

/**
 * Maps traffic score to level string
 */
export function getLevelFromScore(score) {
  if (score <= 25) return 'LOW';
  if (score <= 50) return 'MODERATE';
  if (score <= 75) return 'HIGH';
  return 'SEVERE';
}

/**
 * Calculates total route cost using the formula:
 * Total Route Cost = Base Travel Time
 *                  + (trafficDelay * 1.0)
 *                  + (signalDelay * 0.8)
 *                  + (constructionDelay * 1.2)
 *                  + (accidentDelay * 2.0)
 *                  + closurePenalty
 */
export function calculateRouteCost({
  baseDurationMin,
  trafficDelayMin = 0,
  signalDelayMin = 0,
  constructionDelayMin = 0,
  accidentDelayMin = 0,
  isClosed = false,
  weights = ROUTE_WEIGHTS
}) {
  if (isClosed) {
    return 999999;
  }

  const cost = baseDurationMin 
    + (trafficDelayMin * (weights.trafficDelay ?? 1.0))
    + (signalDelayMin * (weights.signalDelay ?? 0.8))
    + (constructionDelayMin * (weights.constructionDelay ?? 1.2))
    + (accidentDelayMin * (weights.accidentDelay ?? 2.0));

  return Math.round(cost * 10) / 10;
}

/**
 * Formats time saved and generates "Why this route?" bullet points
 */
export function generateRouteExplanation(recommendedRoute, otherRoutes = []) {
  const reasons = [];

  // Compare against Route A (primary corridor) or highest other
  const routeA = otherRoutes.find(r => r.id === 'route-a' || r.code === 'ROUTE A');
  const compareDuration = (routeA && routeA.estimatedDurationMin > recommendedRoute.estimatedDurationMin)
    ? routeA.estimatedDurationMin
    : otherRoutes.reduce((max, r) => (r.estimatedDurationMin > max ? r.estimatedDurationMin : max), 0);

  const timeSaved = compareDuration > recommendedRoute.estimatedDurationMin 
    ? Math.round(compareDuration - recommendedRoute.estimatedDurationMin)
    : 0;

  if (timeSaved > 0) {
    reasons.push(`Estimated ${timeSaved} minutes faster than congested route`);
  }

  if (recommendedRoute.trafficLevel === 'LOW') {
    reasons.push('Avoids heavy traffic on central corridors');
  } else if (recommendedRoute.trafficLevel === 'MODERATE') {
    reasons.push('Steady, predictable traffic flow');
  }

  // Check queues
  const maxQueue = recommendedRoute.maxQueue || 35;
  if (maxQueue < 60) {
    reasons.push(`Minimal queue delays (under ${maxQueue} m)`);
  }

  // Check signals
  if ((recommendedRoute.signalDelayMin || 0) < 3) {
    reasons.push('Optimized signal green wave coordination');
  }

  // Check events
  const hasConstruction = recommendedRoute.events?.some(e => e.toLowerCase().includes('construction'));
  const hasAccident = recommendedRoute.events?.some(e => e.toLowerCase().includes('accident'));

  if (!hasConstruction) {
    reasons.push('Avoids active construction zones');
  }
  if (!hasAccident) {
    reasons.push('No reported accidents or lane obstructions');
  }

  return {
    timeSavedMinutes: timeSaved,
    bullets: reasons.slice(0, 5)
  };
}
