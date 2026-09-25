/**
 * SmartRoute - Fallback Offline Sample Data
 * Ensures frontend resilience if backend is unavailable.
 */

export const fallbackKits = [
  {
    id: "TS-001",
    name: "Central Junction Kit",
    location: "Trinity Circle & Central Expressway",
    latitude: 12.9650,
    longitude: 77.6200,
    vehicleUnits: 24,
    queueLength: 180,
    averageSpeed: 6,
    waitingTime: 95,
    signalStatus: "RED",
    trafficLevel: "HIGH",
    status: "ONLINE",
    roadId: "road-central-exp",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "TS-002",
    name: "North Gate Sensor",
    location: "North Gate Tech Hub Entrance",
    latitude: 12.9760,
    longitude: 77.5920,
    vehicleUnits: 8,
    queueLength: 30,
    averageSpeed: 42,
    waitingTime: 15,
    signalStatus: "GREEN",
    trafficLevel: "LOW",
    status: "ONLINE",
    roadId: "road-north-arterial",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "TS-003",
    name: "East Corridor Kit",
    location: "Old Airport Flyover Junction",
    latitude: 12.9560,
    longitude: 77.6120,
    vehicleUnits: 22,
    queueLength: 115,
    averageSpeed: 18,
    waitingTime: 65,
    signalStatus: "RED",
    trafficLevel: "HIGH",
    status: "ONLINE",
    roadId: "road-east-arterial",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "TS-004",
    name: "Bypass South Sensor",
    location: "Innovation Blvd & Ring Road",
    latitude: 12.9400,
    longitude: 77.5950,
    vehicleUnits: 9,
    queueLength: 35,
    averageSpeed: 45,
    waitingTime: 18,
    signalStatus: "GREEN",
    trafficLevel: "LOW",
    status: "ONLINE",
    roadId: "road-bypass-south",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "TS-005",
    name: "Silk Board Interchange Kit",
    location: "Silk Board Junction Flyover",
    latitude: 12.9320,
    longitude: 77.6200,
    vehicleUnits: 28,
    queueLength: 140,
    averageSpeed: 14,
    waitingTime: 82,
    signalStatus: "RED",
    trafficLevel: "HIGH",
    status: "ONLINE",
    roadId: "road-silk-interchange",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "TS-006",
    name: "Metro Terminal Kit",
    location: "Metro Central Terminal South",
    latitude: 12.9250,
    longitude: 77.6350,
    vehicleUnits: 14,
    queueLength: 60,
    averageSpeed: 32,
    waitingTime: 35,
    signalStatus: "YELLOW",
    trafficLevel: "MODERATE",
    status: "ONLINE",
    roadId: "road-metro-approach",
    lastUpdated: new Date().toISOString()
  }
];

export const fallbackSignals = [
  {
    id: "TS-101",
    name: "North Gate Signal",
    location: "North Gate Tech Hub",
    latitude: 12.9760,
    longitude: 77.5920,
    status: "GREEN",
    redRemaining: 0,
    greenRemaining: 24,
    yellowRemaining: 0,
    vehiclesWaiting: 8,
    queueLength: 30,
    averageWaitingTime: 15,
    cycleSeconds: 60
  },
  {
    id: "TS-104",
    name: "Trinity Circle Signal",
    location: "Trinity Circle & Central Expressway",
    latitude: 12.9650,
    longitude: 77.6200,
    status: "RED",
    redRemaining: 42,
    greenRemaining: 0,
    yellowRemaining: 0,
    vehiclesWaiting: 26,
    queueLength: 145,
    averageWaitingTime: 96,
    cycleSeconds: 90
  },
  {
    id: "TS-107",
    name: "Silk Board Interchange Signal",
    location: "Silk Board Main Cross",
    latitude: 12.9320,
    longitude: 77.6200,
    status: "RED",
    redRemaining: 51,
    greenRemaining: 0,
    yellowRemaining: 0,
    vehiclesWaiting: 34,
    queueLength: 165,
    averageWaitingTime: 110,
    cycleSeconds: 100
  },
  {
    id: "TS-108",
    name: "Green Park West Crossing",
    location: "Green Park Bypass Junction",
    latitude: 12.9600,
    longitude: 77.5850,
    status: "GREEN",
    redRemaining: 0,
    greenRemaining: 27,
    yellowRemaining: 0,
    vehiclesWaiting: 6,
    queueLength: 22,
    averageWaitingTime: 12,
    cycleSeconds: 50
  }
];

export const fallbackIncidents = [
  {
    id: "INC-201",
    type: "Accident",
    location: "Junction 24 - Central Expressway Near Trinity",
    latitude: 12.9660,
    longitude: 77.6180,
    severity: "HIGH",
    description: "Multi-car collision on southbound lane. Left lane blocked.",
    status: "ACTIVE",
    reportedAt: new Date().toISOString(),
    trafficImpact: "SEVERE",
    roadId: "road-central-exp",
    delayMinutes: 15
  },
  {
    id: "INC-202",
    type: "Broken Signal",
    location: "MG Central Crossing (TS-103)",
    latitude: 12.9730,
    longitude: 77.6150,
    severity: "MEDIUM",
    description: "Traffic light stuck in flashing amber cycle. Manual traffic police oversight.",
    status: "ACTIVE",
    reportedAt: new Date().toISOString(),
    trafficImpact: "MODERATE",
    roadId: "road-mg-arterial",
    delayMinutes: 6
  }
];

export const fallbackConstruction = [
  {
    id: "CONST-301",
    road: "Old Airport Flyover & East Arterial",
    location: "Near Junction 5 Flyover Expansion",
    latitude: 12.9560,
    longitude: 77.6120,
    affectedDistance: 600,
    lanesBefore: 2,
    lanesAfter: 1,
    startDate: "2026-09-10",
    expectedEndDate: "2026-10-20",
    trafficImpact: "HIGH",
    status: "IN_PROGRESS",
    roadId: "road-east-arterial",
    delayMinutes: 7
  },
  {
    id: "CONST-302",
    road: "Outer Ring Road Metro Corridor",
    location: "Koramangala Section - Pier 142",
    latitude: 12.9460,
    longitude: 77.6210,
    affectedDistance: 450,
    lanesBefore: 3,
    lanesAfter: 2,
    startDate: "2026-08-15",
    expectedEndDate: "2026-11-30",
    trafficImpact: "MEDIUM",
    status: "IN_PROGRESS",
    roadId: "road-koramangala-ring",
    delayMinutes: 4
  }
];

export const fallbackNetwork = {
  center: [12.9520, 77.6100],
  zoom: 13,
  cityName: "Metro Tech Corridor (SmartRoute)",
  junctions: [
    { id: "J1", name: "North Gate Tech Hub", coords: [12.9760, 77.5920] },
    { id: "J2", name: "Cyber Expressway Junction", coords: [12.9680, 77.6080] },
    { id: "J3", name: "MG Central Crossing", coords: [12.9730, 77.6150] },
    { id: "J4", name: "Trinity Circle", coords: [12.9650, 77.6200] },
    { id: "J5", name: "Old Airport Flyover", coords: [12.9560, 77.6120] },
    { id: "J6", name: "Koramangala Outer Ring", coords: [12.9440, 77.6240] },
    { id: "J7", name: "Silk Board Interchange", coords: [12.9320, 77.6200] },
    { id: "J8", name: "Metro Central Terminal", coords: [12.9250, 77.6350] },
    { id: "J9", name: "Green Park Bypass North", coords: [12.9600, 77.5850] },
    { id: "J10", name: "Innovation Boulevard South", coords: [12.9400, 77.5950] }
  ],
  roads: [
    {
      id: "road-north-arterial",
      name: "North Gateway Avenue",
      lengthKm: 2.1,
      freeFlowSpeed: 50,
      currentSpeed: 45,
      vehicleUnits: 8,
      queueLength: 30,
      trafficLevel: "LOW",
      isClosed: false,
      coordinates: [
        [12.9760, 77.5920],
        [12.9740, 77.5980],
        [12.9710, 77.6040],
        [12.9680, 77.6080]
      ]
    },
    {
      id: "road-cyber-link",
      name: "Cyber Expressway",
      lengthKm: 1.6,
      freeFlowSpeed: 55,
      currentSpeed: 48,
      vehicleUnits: 14,
      queueLength: 40,
      trafficLevel: "LOW",
      isClosed: false,
      coordinates: [
        [12.9680, 77.6080],
        [12.9670, 77.6140],
        [12.9650, 77.6200]
      ]
    },
    {
      id: "road-central-exp",
      name: "Central Expressway Mainline",
      lengthKm: 2.6,
      freeFlowSpeed: 60,
      currentSpeed: 6,
      vehicleUnits: 24,
      queueLength: 180,
      trafficLevel: "HIGH",
      isClosed: false,
      coordinates: [
        [12.9650, 77.6200],
        [12.9580, 77.6220],
        [12.9510, 77.6230],
        [12.9440, 77.6240]
      ]
    },
    {
      id: "road-koramangala-ring",
      name: "Koramangala Outer Ring",
      lengthKm: 1.9,
      freeFlowSpeed: 50,
      currentSpeed: 40,
      vehicleUnits: 15,
      queueLength: 60,
      trafficLevel: "MODERATE",
      isClosed: false,
      coordinates: [
        [12.9440, 77.6240],
        [12.9370, 77.6280],
        [12.9300, 77.6320],
        [12.9250, 77.6350]
      ]
    },
    {
      id: "road-bypass-north",
      name: "Green Park West Bypass",
      lengthKm: 2.2,
      freeFlowSpeed: 50,
      currentSpeed: 48,
      vehicleUnits: 7,
      queueLength: 25,
      trafficLevel: "LOW",
      isClosed: false,
      coordinates: [
        [12.9760, 77.5920],
        [12.9700, 77.5870],
        [12.9600, 77.5850]
      ]
    },
    {
      id: "road-bypass-south",
      name: "Innovation Boulevard Bypass",
      lengthKm: 2.8,
      freeFlowSpeed: 55,
      currentSpeed: 48,
      vehicleUnits: 9,
      queueLength: 35,
      trafficLevel: "LOW",
      isClosed: false,
      coordinates: [
        [12.9600, 77.5850],
        [12.9520, 77.5880],
        [12.9450, 77.5910],
        [12.9400, 77.5950]
      ]
    },
    {
      id: "road-silk-interchange",
      name: "South Ring Link to Silk Board",
      lengthKm: 3.1,
      freeFlowSpeed: 50,
      currentSpeed: 44,
      vehicleUnits: 12,
      queueLength: 40,
      trafficLevel: "LOW",
      isClosed: false,
      coordinates: [
        [12.9400, 77.5950],
        [12.9360, 77.6040],
        [12.9340, 77.6120],
        [12.9320, 77.6200]
      ]
    }
  ]
};

export const fallbackRoutes = [
  {
    id: "route-a",
    code: "Route A",
    name: "Central Expressway Corridor",
    distanceKm: 8.2,
    baseDurationMin: 21,
    estimatedDurationMin: 38,
    status: "CONGESTED",
    trafficScore: 82,
    trafficLevel: "SEVERE",
    trafficDelayMin: 17,
    delayMinutes: 17,
    events: ["Heavy Congestion (+17m)"],
    coordinates: [
      [12.9760, 77.5920],
      [12.9740, 77.5980],
      [12.9710, 77.6040],
      [12.9680, 77.6080],
      [12.9670, 77.6140],
      [12.9650, 77.6200],
      [12.9580, 77.6220],
      [12.9510, 77.6230],
      [12.9440, 77.6240],
      [12.9370, 77.6280],
      [12.9300, 77.6320],
      [12.9250, 77.6350]
    ]
  },
  {
    id: "route-b",
    code: "Route B",
    name: "Green Park Bypass",
    distanceKm: 10.1,
    baseDurationMin: 21,
    estimatedDurationMin: 21,
    status: "RECOMMENDED",
    trafficScore: 18,
    trafficLevel: "MODERATE",
    trafficDelayMin: 0,
    delayMinutes: 0,
    events: ["Optimal Flow (17m saved)"],
    coordinates: [
      [12.9760, 77.5920],
      [12.9700, 77.5870],
      [12.9600, 77.5850],
      [12.9520, 77.5880],
      [12.9450, 77.5910],
      [12.9400, 77.5950],
      [12.9360, 77.6040],
      [12.9340, 77.6120],
      [12.9320, 77.6200],
      [12.9280, 77.6270],
      [12.9250, 77.6350]
    ]
  },
  {
    id: "route-c",
    code: "Route C",
    name: "East Arterial & Airport Flyover",
    distanceKm: 9.4,
    baseDurationMin: 21,
    estimatedDurationMin: 51,
    status: "DELAYED",
    trafficScore: 68,
    trafficLevel: "MODERATE",
    trafficDelayMin: 30,
    delayMinutes: 30,
    events: ["Road Construction (+30m)"],
    coordinates: [
      [12.9760, 77.5920],
      [12.9740, 77.5980],
      [12.9710, 77.6040],
      [12.9680, 77.6080],
      [12.9730, 77.6150],
      [12.9640, 77.6140],
      [12.9560, 77.6120],
      [12.9500, 77.6180],
      [12.9440, 77.6240],
      [12.9370, 77.6280],
      [12.9300, 77.6320],
      [12.9250, 77.6350]
    ]
  }
];

export const fallbackExplanation = {
  timeSavedMinutes: 17,
  bullets: [
    "Avoids 17 min severe traffic on Central Expressway",
    "Minimal junction queue delays (under 35 meters)",
    "Synchronized green waves across Green Park Corridor",
    "Bypasses active road construction zones",
    "No reported collision hazards or lane blocks"
  ]
};
