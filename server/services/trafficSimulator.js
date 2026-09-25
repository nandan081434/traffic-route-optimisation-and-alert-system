/**
 * SmartRoute - Real-time Traffic Simulator
 * Periodically updates traffic sensors, signal countdowns, and triggers scenario events.
 */

import {
  getAllKits,
  updateKitData,
  getAllSignals,
  updateSignal,
  createIncident,
  createConstruction,
  closeRoad,
  reopenRoad,
  initTrafficData
} from './trafficService.js';
import { recalculateRoutes } from './routeService.js';
import { createNotification } from './notificationService.js';

let isRunning = true;
let timerInterval = null;
let ioInstance = null;
let currentDemoStep = 0;
let demoTimer = null;

export function setIoInstance(io) {
  ioInstance = io;
}

export function isSimulatorRunning() {
  return isRunning;
}

/**
 * Standard tick running every 3.5 seconds
 * Creates realistic, subtle fluctuations in traffic parameters
 */
export function tick() {
  if (!isRunning) return;

  const kits = getAllKits();
  const signals = getAllSignals();

  // 1. Advance signal timers
  for (const sig of signals) {
    if (sig.status === 'RED') {
      const redRemaining = Math.max(0, sig.redRemaining - 3);
      if (redRemaining === 0) {
        updateSignal(sig.id, {
          status: 'GREEN',
          redRemaining: 0,
          greenRemaining: Math.round(sig.cycleSeconds * 0.45),
          yellowRemaining: 0
        });
      } else {
        updateSignal(sig.id, { redRemaining });
      }
    } else if (sig.status === 'GREEN') {
      const greenRemaining = Math.max(0, sig.greenRemaining - 3);
      if (greenRemaining === 0) {
        updateSignal(sig.id, {
          status: 'YELLOW',
          redRemaining: 0,
          greenRemaining: 0,
          yellowRemaining: 4
        });
      } else {
        updateSignal(sig.id, { greenRemaining });
      }
    } else if (sig.status === 'YELLOW') {
      const yellowRemaining = Math.max(0, sig.yellowRemaining - 3);
      if (yellowRemaining === 0) {
        updateSignal(sig.id, {
          status: 'RED',
          redRemaining: Math.round(sig.cycleSeconds * 0.5),
          greenRemaining: 0,
          yellowRemaining: 0
        });
      } else {
        updateSignal(sig.id, { yellowRemaining });
      }
    }
  }

  // 2. Fluctuate roadside traffic kits slightly within realistic bounds
  for (const kit of kits) {
    // Only randomize non-TS-001 or general kits if not in locked demo state
    if (kit.status === 'ONLINE') {
      const deltaUnits = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
      const newUnits = Math.max(2, Math.min(55, kit.vehicleUnits + deltaUnits));

      const deltaQueue = (Math.floor(Math.random() * 7) - 3) * 2; // -6 to +6 meters
      const newQueue = Math.max(10, Math.min(260, kit.queueLength + deltaQueue));

      // Speed inversely relates to queue
      let targetSpeed = 50;
      if (newQueue > 150) targetSpeed = 8;
      else if (newQueue > 90) targetSpeed = 18;
      else if (newQueue > 50) targetSpeed = 30;

      const deltaSpeed = Math.floor(Math.random() * 3) - 1;
      const newSpeed = Math.max(4, Math.min(55, Math.round((kit.averageSpeed * 0.7 + targetSpeed * 0.3) + deltaSpeed)));

      // Waiting time matches queue & signal
      const newWaiting = Math.max(5, Math.round((newQueue / 2.2) + (kit.signalStatus === 'RED' ? 20 : 0)));

      // Sync with nearby signal if any
      const matchingSignal = signals.find(s => s.location.includes(kit.name.split(' ')[0]));
      const signalStatus = matchingSignal ? matchingSignal.status : kit.signalStatus;

      updateKitData(kit.id, {
        vehicleUnits: newUnits,
        queueLength: newQueue,
        averageSpeed: newSpeed,
        waitingTime: newWaiting,
        signalStatus
      });
    }
  }

  // 3. Recalculate routes based on updated traffic kit metrics
  const routeResult = recalculateRoutes();

  // 4. Emit live updates via Socket.IO
  if (ioInstance) {
    ioInstance.emit('traffic:update', {
      kits: getAllKits(),
      signals: getAllSignals(),
      timestamp: new Date().toISOString()
    });

    ioInstance.emit('route:update', routeResult);

    if (routeResult.routeChanged) {
      const notif = createNotification({
        type: 'ROUTE_UPDATE',
        title: 'Dynamic Route Recalculation',
        message: `Traffic conditions changed. Recommended route switched to ${routeResult.recommendedRoute.name}. Saved ${routeResult.timeSavedMinutes} min!`,
        severity: 'SUCCESS',
        data: routeResult
      });
      ioInstance.emit('notification:new', notif);
    }
  }
}

export function startSimulator() {
  if (!timerInterval) {
    timerInterval = setInterval(tick, 3500);
  }
  isRunning = true;
  if (ioInstance) {
    ioInstance.emit('simulation:status', { running: true });
  }
  return { status: 'running' };
}

export function pauseSimulator() {
  isRunning = false;
  if (ioInstance) {
    ioInstance.emit('simulation:status', { running: false });
  }
  return { status: 'paused' };
}

export function resetSimulator() {
  if (demoTimer) clearTimeout(demoTimer);
  currentDemoStep = 0;
  initTrafficData();
  const routeResult = recalculateRoutes();
  
  if (ioInstance) {
    ioInstance.emit('traffic:reset', {
      kits: getAllKits(),
      signals: getAllSignals(),
      routes: routeResult.routes
    });
    ioInstance.emit('simulation:status', { running: isRunning, demoStep: 0 });
    
    const notif = createNotification({
      type: 'SYSTEM',
      title: 'Simulation Reset',
      message: 'All sensor kits, signals, and routes restored to baseline.',
      severity: 'INFO'
    });
    ioInstance.emit('notification:new', notif);
  }
  return { status: 'reset', routes: routeResult.routes };
}

/**
 * Scenario 1: Simulate Heavy Traffic on Central Expressway (TS-001)
 * Follows exact prompt scenario:
 * Vehicle Units: 24 -> 31 -> 37
 * Queue: 80m -> 130m -> 190m
 * Speed: 22 km/h -> 12 km/h -> 5 km/h
 * Notification: "Traffic conditions changed on your current route" -> "Calculating alternate route..." -> "Faster alternate route found: 17 min saved!"
 */
export function simulateHeavyTraffic() {
  const ts001 = updateKitData('TS-001', {
    vehicleUnits: 37,
    queueLength: 190,
    averageSpeed: 5,
    waitingTime: 110,
    signalStatus: 'RED'
  });

  // Also adjust signal TS-104 (Trinity Circle)
  updateSignal('TS-104', {
    status: 'RED',
    redRemaining: 55,
    vehiclesWaiting: 37,
    queueLength: 190,
    averageWaitingTime: 110
  });

  const routeResult = recalculateRoutes();

  if (ioInstance) {
    ioInstance.emit('kit:update', ts001);
    ioInstance.emit('route:update', routeResult);

    const alertNotif = createNotification({
      type: 'TRAFFIC_ALERT',
      title: 'Traffic Alert: Central Expressway',
      message: 'Severe congestion detected at Trinity Circle (Kit TS-001). Queue: 190m, Avg Speed: 5 km/h.',
      severity: 'WARNING'
    });
    ioInstance.emit('notification:new', alertNotif);

    const routeNotif = createNotification({
      type: 'ROUTE_UPDATE',
      title: 'Faster Alternate Route Found',
      message: 'Current route: 38 min. New route: 21 min. Saved: 17 min via Green Park Bypass!',
      severity: 'SUCCESS',
      data: routeResult
    });
    ioInstance.emit('notification:new', routeNotif);
  }

  return { kit: ts001, routeResult };
}

/**
 * Scenario 2: Simulate Accident on Central Expressway
 */
export function simulateAccident() {
  const incident = createIncident({
    type: 'Accident',
    location: 'Central Expressway at Junction 24',
    severity: 'HIGH',
    description: 'Collision involving 2 cars and an auto. Central lane obstructed.',
    roadId: 'road-central-exp',
    delayMinutes: 18
  });

  // Kit TS-001 reacts
  updateKitData('TS-001', {
    vehicleUnits: 42,
    queueLength: 210,
    averageSpeed: 4,
    waitingTime: 125,
    signalStatus: 'RED'
  });

  const routeResult = recalculateRoutes();

  if (ioInstance) {
    ioInstance.emit('incident:new', incident);
    ioInstance.emit('route:update', routeResult);

    const notif = createNotification({
      type: 'INCIDENT_ALERT',
      title: '🚨 ACCIDENT DETECTED',
      message: 'Accident reported on Central Expressway. Recalculating optimal alternate route...',
      severity: 'CRITICAL',
      data: incident
    });
    ioInstance.emit('notification:new', notif);
  }

  return { incident, routeResult };
}

/**
 * Scenario 3: Simulate Construction on Road
 */
export function simulateConstruction() {
  const con = createConstruction({
    road: 'Central Expressway Overpass',
    location: 'Central Expressway KM 4.2',
    affectedDistance: 500,
    lanesBefore: 3,
    lanesAfter: 1,
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: '2026-10-15',
    trafficImpact: 'HIGH',
    status: 'IN_PROGRESS',
    roadId: 'road-central-exp',
    delayMinutes: 14
  });

  updateKitData('TS-001', {
    vehicleUnits: 34,
    queueLength: 175,
    averageSpeed: 8,
    waitingTime: 95
  });

  const routeResult = recalculateRoutes();

  if (ioInstance) {
    ioInstance.emit('construction:update', con);
    ioInstance.emit('route:update', routeResult);

    const notif = createNotification({
      type: 'CONSTRUCTION_ALERT',
      title: '🚧 Construction Zone Active',
      message: 'Lane reduction on Central Expressway (3 -> 1 lane). Route recalculation applied.',
      severity: 'WARNING',
      data: con
    });
    ioInstance.emit('notification:new', notif);
  }

  return { construction: con, routeResult };
}

/**
 * Scenario 4: Simulate Road Closure
 */
export function simulateRoadClosure() {
  closeRoad('road-central-exp');
  
  const incident = createIncident({
    type: 'Emergency Closure',
    location: 'Central Expressway Mainline',
    severity: 'CRITICAL',
    description: 'Emergency structural inspection. Road completely closed to through-traffic.',
    roadId: 'road-central-exp',
    delayMinutes: 90
  });

  const routeResult = recalculateRoutes();

  if (ioInstance) {
    ioInstance.emit('incident:new', incident);
    ioInstance.emit('route:update', routeResult);

    const notif = createNotification({
      type: 'ROAD_CLOSURE',
      title: '⛔ ROAD CLOSED: Central Expressway',
      message: 'Road closed. Central Expressway bypassed completely in dynamic routing.',
      severity: 'CRITICAL',
      data: incident
    });
    ioInstance.emit('notification:new', notif);
  }

  return { roadClosed: 'road-central-exp', routeResult };
}

/**
 * Automated 8-Step Interactive Demo Workflow
 * Demonstrates:
 * STEP 1: Normal traffic
 * STEP 2: Kit TS-001 detects vehicle surge (24 -> 31)
 * STEP 3: Queue length grows (80m -> 130m -> 190m)
 * STEP 4: Traffic level reaches HIGH / SEVERE
 * STEP 5: Current route travel time jumps from 14 min to 38 min
 * STEP 6: Route engine triggers recalculation
 * STEP 7: Alternate route selected (Route B: 21 min)
 * STEP 8: 17 minutes saved notification!
 */
export function runDemoScenario(step = 1) {
  currentDemoStep = step;

  if (step === 1) {
    // Normal traffic
    resetSimulator();
    if (ioInstance) {
      ioInstance.emit('demo:step', {
        step: 1,
        title: 'Step 1: Normal Traffic Flow',
        description: 'Route A is optimal at 14 min (8.2 km). Vehicle units at Trinity Circle: 12 units.',
        routeCode: 'ROUTE A',
        savedMin: 0
      });
    }
  } else if (step === 2) {
    // Vehicle surge detected by kit
    updateKitData('TS-001', {
      vehicleUnits: 31,
      queueLength: 130,
      averageSpeed: 14,
      waitingTime: 65,
      signalStatus: 'RED'
    });
    const result = recalculateRoutes();
    if (ioInstance) {
      ioInstance.emit('demo:step', {
        step: 2,
        title: 'Step 2: Traffic Kit TS-001 Influx',
        description: 'Roadside kit detects vehicles increasing: 12 → 24 → 31 vehicle units.',
        routeCode: 'ROUTE A',
        savedMin: 0
      });
      ioInstance.emit('route:update', result);
    }
  } else if (step === 3) {
    // Queue length builds up
    updateKitData('TS-001', {
      vehicleUnits: 37,
      queueLength: 190,
      averageSpeed: 6,
      waitingTime: 95,
      signalStatus: 'RED'
    });
    const result = recalculateRoutes();
    if (ioInstance) {
      ioInstance.emit('demo:step', {
        step: 3,
        title: 'Step 3: Traffic Queue Measurement',
        description: 'Roadside sensor kit measures queue extension: 80 m → 130 m → 190 m.',
        routeCode: 'ROUTE A',
        savedMin: 0
      });
      ioInstance.emit('route:update', result);
    }
  } else if (step === 4) {
    // Congestion triggers severe delay
    updateKitData('TS-001', {
      vehicleUnits: 42,
      queueLength: 210,
      averageSpeed: 5,
      waitingTime: 110,
      signalStatus: 'RED'
    });
    const result = recalculateRoutes();
    if (ioInstance) {
      ioInstance.emit('demo:step', {
        step: 4,
        title: 'Step 4: Severe Congestion Level',
        description: 'Threshold triggered: Vehicle units > 40 & Queue > 200m. Traffic level = SEVERE.',
        routeCode: 'ROUTE A',
        savedMin: 0
      });
      ioInstance.emit('route:update', result);
    }
  } else if (step === 5) {
    // Current route delay jumps to 38 min
    const result = recalculateRoutes();
    if (ioInstance) {
      ioInstance.emit('demo:step', {
        step: 5,
        title: 'Step 5: Current Route Delay Jumps',
        description: 'Route A travel time escalates from 14 min to 38 min due to corridor gridlock.',
        routeCode: 'ROUTE A',
        currentMin: 38,
        savedMin: 0
      });
      ioInstance.emit('route:update', result);
    }
  } else if (step === 6) {
    // Dynamic Route Recalculation Triggered
    if (ioInstance) {
      ioInstance.emit('demo:step', {
        step: 6,
        title: 'Step 6: Dynamic Recalculation Engine',
        description: 'SmartRoute scoring algorithm evaluates all corridor costs: Base + Traffic + Signal + Construction.',
        statusText: 'Analyzing live traffic & evaluating alternatives...',
        savedMin: 0
      });
    }
  } else if (step === 7) {
    // Alternate Route Selected
    const result = recalculateRoutes();
    if (ioInstance) {
      ioInstance.emit('demo:step', {
        step: 7,
        title: 'Step 7: Faster Alternate Route Selected',
        description: 'Route B (Green Park Bypass) identified as optimal: 21 min (vs 38 min on Route A).',
        routeCode: 'ROUTE B',
        newMin: 21,
        savedMin: 17
      });
      ioInstance.emit('route:update', result);
    }
  } else if (step === 8) {
    // 17 Minutes Saved - Final notification & celebration
    const result = recalculateRoutes();
    if (ioInstance) {
      ioInstance.emit('demo:step', {
        step: 8,
        title: 'Step 8: Route Transition & Time Saved',
        description: '17 MINUTES SAVED! Smooth animated polyline transition and user alert dispatched.',
        routeCode: 'ROUTE B',
        savedMin: 17
      });
      
      const savedNotif = createNotification({
        type: 'ROUTE_UPDATE',
        title: '17 Minutes Saved!',
        message: 'Dynamic rerouting avoided 190m queue at Trinity Circle. Route B is clear.',
        severity: 'SUCCESS',
        data: result
      });
      ioInstance.emit('notification:new', savedNotif);
      ioInstance.emit('route:update', result);
    }
  }

  return { step, currentDemoStep };
}

// Start simulation on engine initialization
startSimulator();
