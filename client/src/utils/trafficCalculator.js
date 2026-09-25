/**
 * SmartRoute - Client Traffic Calculator
 * 
 * IMPORTANT VEHICLE COUNTING RULE:
 * 1 vehicle = 1 unit.
 * Passengers are NOT counted.
 */

export const TRAFFIC_THRESHOLDS = {
  LOW: { maxUnits: 9, maxQueue: 49 },
  MODERATE: { minUnits: 10, maxUnits: 20, minQueue: 50, maxQueue: 100 },
  HIGH: { minUnits: 21, maxUnits: 40, minQueue: 101, maxQueue: 200 },
  SEVERE: { minUnits: 41, minQueue: 201 }
};

export function calculateTrafficLevel(vehicleUnits, queueLength) {
  if (vehicleUnits > 40 || queueLength > 200) return 'SEVERE';
  if ((vehicleUnits >= 21 && vehicleUnits <= 40) || (queueLength >= 101 && queueLength <= 200)) return 'HIGH';
  if ((vehicleUnits >= 10 && vehicleUnits <= 20) || (queueLength >= 50 && queueLength <= 100)) return 'MODERATE';
  return 'LOW';
}

export function calculateTrafficScore({ vehicleUnits = 0, queueLength = 0, averageSpeed = 50, waitingTime = 0, freeFlowSpeed = 50 }) {
  const unitFactor = Math.min(30, (vehicleUnits / 50) * 30);
  const queueFactor = Math.min(35, (queueLength / 250) * 35);
  const speedDeficit = Math.max(0, freeFlowSpeed - averageSpeed);
  const speedFactor = Math.min(20, (speedDeficit / freeFlowSpeed) * 20);
  const waitFactor = Math.min(15, (waitingTime / 120) * 15);
  return Math.min(100, Math.max(0, Math.round(unitFactor + queueFactor + speedFactor + waitFactor)));
}
