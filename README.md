# SMARTROUTE
### Intelligent Traffic, Navigation & Dynamic Route Management System

> **"DO NOT SIMPLY FIND THE SHORTEST ROUTE. FIND THE MOST PRACTICAL AND CURRENTLY EFFICIENT ROUTE."**

---

## 1. Project Overview

**SmartRoute** is a next-generation navigation and traffic intelligence platform designed to eliminate the fundamental limitations of conventional GPS and map applications. Traditional navigation platforms primarily optimize paths using static distance or delayed aggregate traffic heuristics. 

SmartRoute bridges the gap between road hardware and dynamic navigation by integrating **live roadside traffic-monitoring kits**, automated traffic-signal countdowns, road construction zones, active accident hazards, and an intelligent **dynamic route-recalculation engine** that re-evaluates road costs and navigates drivers onto optimal alternate corridors in real time.

---

## 2. The Core Problem

Conventional map applications fail motorists during rapid, unforeseen roadside fluctuations:
1. **Blindness to Junction Queues**: Traditional navigation does not know how long the physical vehicle queue is at a red signal until hundreds of vehicles have already queued up.
2. **Delayed Recalculation**: Rerouting algorithms often wait until a driver is already trapped in a 20-minute bottleneck before suggesting an exit.
3. **Passenger vs. Vehicle Ambiguity**: Conventional mobile telemetry counts smartphone locations, which skews density (e.g. 40 passengers on one bus vs. 40 single-occupant cars).
4. **Disjointed Road Events**: Signals, construction lane drops, and accidents operate in informational silos rather than feeding a unified scoring algorithm.

---

## 3. The SmartRoute Solution

SmartRoute unifies roadside IoT sensors, signal coordination, and vehicle routing into a cohesive real-time pipeline:
- **Roadside Traffic Kits (TS-001, etc.)**: Installed at key junctions, measuring vehicle units, queue length in meters, average speed, and waiting time.
- **Strict Vehicle Counting Rule**: Every vehicle counts as exactly **ONE UNIT** (Car = 1, Bus = 1, Truck = 1, Auto = 1, Motorcycle = 1). A bus carrying 40 passengers is strictly 1 unit.
- **Dynamic Cost Scoring**: Routes are scored using weighted delays:
  $$\text{Total Route Cost} = \text{Base Travel Time} + (\text{trafficDelay} \times 1.0) + (\text{signalDelay} \times 0.8) + (\text{constructionDelay} \times 1.2) + (\text{accidentDelay} \times 2.0) + \text{closurePenalty}$$
- **Immediate Rerouting & Time Saved**: When a bottleneck develops, the system calculates alternate corridors, highlights the optimal route on the live Leaflet map, and presents exact time savings (e.g., *"17 minutes saved"*).
- **"Why this route?" Transparency**: Provides drivers and traffic controllers with clear, bulleted explanations for every route recommendation.

---

## 4. Key Features

- **Interactive Live Map**: Leaflet and OpenStreetMap integration featuring dark cartography, color-coded traffic corridors (Green/Yellow/Orange/Red/Dark), custom SVG markers for IoT kits, signals, and hazards, and animated route transitions.
- **Live Traffic Simulation Engine**: 1-click simulation triggers for *Heavy Traffic*, *Accident*, *Road Construction*, and *Emergency Road Closure*.
- **Interactive 8-Step Demo Script**: Automated step-by-step walkthrough for judges, teachers, and innovation presentations.
- **Microcontroller Hardware Telemetry Endpoint**: Dedicated `POST /api/traffic-kits/update` API ready for ESP32/Arduino integration with payload validation.
- **Smart Traffic Signals**: Realistic 3-light visual displays (Red, Yellow, Green) with synchronized countdown timers.
- **Historical Traffic Analytics**: Recharts visualizations for hourly vehicle throughput, queue length vs. average speed, and signal clearance efficiency.
- **Simulated Traffic Prediction**: 30-minute predictive forecast warning operators of imminent corridor surges.
- **Full Admin Panel**: Complete CRUD control over kits, signals, incidents, construction, and road closures.
- **User Incident Reporting**: Modal enabling citizens to report accidents, traffic jams, floods, or broken lights.
- **Presentation Mode**: Full-screen distraction-free view designed for demonstrations.

---

## 5. Technology Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS, Framer Motion, Leaflet, Recharts, Lucide React, Socket.IO Client.
- **Backend**: Node.js, Express.js (ES Modules), Socket.IO, CORS, Dotenv.
- **Mapping**: Leaflet 1.9 with OpenStreetMap & CartoDB Dark Matter tiles.
- **Real-time Protocol**: WebSocket via Socket.IO for bi-directional live telemetry.

---

## 6. Architecture & System Flow

```text
  [ Roadside Hardware / ESP32 ]
                 │
                 ▼ (HTTP POST / WebSocket)
     [ Express Ingest API ]
                 │
                 ▼
     [ Traffic Service & Logic ]
     - 1 Vehicle = 1 Unit Rule
     - Discrete Level (LOW, MOD, HIGH, SEVERE)
                 │
                 ▼
     [ Dynamic Route Engine ]
     - Weighted Cost Evaluation
     - "Why this route?" Generator
                 │
                 ▼
     [ Socket.IO Broadcaster ]
                 │
                 ▼
   [ React Frontend Dashboard ]
   - Animated Leaflet Polyline
   - Live KPI Counters
   - Route Comparison & Toast Notification ("17 min saved")
```

---

## 7. Folder Structure

```text
smartroute/
├── package.json               # Root workspace configuration
├── README.md                  # Comprehensive project documentation
├── .gitignore                 # Node, build, and environment ignores
├── .env.example               # Environment variables template
│
├── client/                    # React + Vite Frontend
│   ├── package.json
│   ├── vite.config.js         # Vite dev server with proxy to backend
│   ├── tailwind.config.js     # Dark smart-city theme and traffic colors
│   ├── index.html             # HTML entry point with fonts & Leaflet
│   └── src/
│       ├── animations/        # Framer Motion transitions (variants.js)
│       ├── components/        # MapView, RouteCard, TrafficSignal, etc.
│       ├── data/              # Fallback offline datasets (fallbackData.js)
│       ├── hooks/             # useTraffic, useRoute, useSocket
│       ├── layouts/           # DashboardLayout
│       ├── pages/             # Dashboard, Traffic, Kits, Signals, Admin, etc.
│       ├── services/          # api.js and socket.js
│       ├── utils/             # Formatters, trafficCalculator, routeCalculator
│       ├── App.jsx            # Main app shell & landing splash
│       ├── main.jsx           # React DOM mount
│       └── index.css          # Cartography overrides & glassmorphism
│
└── server/                    # Node.js + Express Backend
    ├── package.json
    ├── server.js              # Server entry point & Socket.IO mount
    ├── controllers/           # Route, kit, signal, incident controllers
    ├── data/                  # In-memory JSON datasets
    ├── routes/                # Express API routes
    ├── services/              # trafficSimulator, routeService, trafficService
    ├── sockets/               # socketHandler.js
    └── utils/                 # trafficLogic.js (Formulas & scoring)
```

---

## 8. Installation & Setup

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Install Dependencies
In the root directory, run:
```bash
npm install
```
*(On Windows PowerShell if script execution is restricted, run `npm.cmd install`)*

### 2. Run Locally
To run both backend server (port 5000) and frontend client (port 5173) concurrently:
```bash
npm run dev
```

Or run each workspace independently:
```bash
# Terminal 1: Run Backend API & Simulation Engine
npm run server

# Terminal 2: Run Frontend Client
npm run client
```

Open your browser at:
```text
http://localhost:5173
```

---

## 9. API Endpoints

### Traffic & Analytics
- `GET /api/traffic` — Overall network metrics, total vehicle units, and roads
- `GET /api/traffic/analytics` — Hourly throughput curves and signal efficiency
- `GET /api/traffic/:roadId` — Specific corridor traffic data

### Traffic Kits & IoT Ingest
- `GET /api/traffic-kits` — List all active traffic kits
- `GET /api/traffic-kits/:id` — Specific kit details
- `POST /api/traffic-kits` — Register new traffic kit
- `PUT /api/traffic-kits/:id` — Update kit configuration
- `DELETE /api/traffic-kits/:id` — Remove traffic kit
- `POST /api/traffic-kits/update` — **IoT Hardware Ingest API** (Receives ESP32/Arduino telemetry)

### Signals
- `GET /api/signals` — List all traffic lights with countdown timers
- `PUT /api/signals/:id` — Update light state or cycle timing

### Incidents & Construction
- `GET /api/incidents` — List active accidents and road blockages
- `POST /api/incidents` — Report new incident
- `GET /api/construction` — List active civil construction zones
- `POST /api/construction` — Register new construction zone

### Dynamic Routing & Simulation
- `GET /api/routes` — Get current routes with candidate scoring & recommended route
- `POST /api/routes/calculate` — Recalculate routes based on live network state
- `POST /api/routes/simulate-heavy-traffic` — Trigger heavy traffic on Central Expressway
- `POST /api/routes/simulate-accident` — Trigger multi-vehicle accident
- `POST /api/routes/simulate-construction` — Trigger lane reduction work zone
- `POST /api/routes/simulate-closure` — Trigger emergency road closure
- `POST /api/routes/reset-traffic` — Reset network to baseline conditions
- `POST /api/routes/demo-step` — Advance step in the 8-step demo walkthrough
- `POST /api/routes/simulation-control` — Pause or resume automatic simulator ticks

---

## 10. IoT Hardware API Integration

SmartRoute is engineered to ingest telemetry from roadside ESP32, Arduino, Raspberry Pi, ultrasonic sensors, or camera systems.

### Hardware Ingest Endpoint
`POST http://localhost:5000/api/traffic-kits/update`

### Sample JSON Payload
```json
{
  "kitId": "TS-001",
  "vehicleUnits": 24,
  "queueLength": 180,
  "averageSpeed": 6,
  "waitingTime": 95,
  "signalStatus": "RED",
  "timestamp": "2026-09-25T08:30:00Z"
}
```

### Arduino / ESP32 C++ Snippet
```cpp
#include <WiFi.h>
#include <HTTPClient.h>

void sendTelemetry(int vehicleUnits, int queueMeters, int avgSpeed) {
  HTTPClient http;
  http.begin("http://192.168.1.100:5000/api/traffic-kits/update");
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"kitId\":\"TS-001\",\"vehicleUnits\":" + String(vehicleUnits) +
                   ",\"queueLength\":" + String(queueMeters) +
                   ",\"averageSpeed\":" + String(avgSpeed) +
                   ",\"waitingTime\":95,\"signalStatus\":\"RED\"}";

  int httpCode = http.POST(payload);
  http.end();
}
```

---

## 11. Demonstration Guide

To showcase the system during a demo or evaluation:

1. **Open the Dashboard**: Navigate to `http://localhost:5173`.
2. **Observe Baseline Flow**:
   - Route A (Central Expressway) is currently optimal: **8.2 km, 14 min**.
   - Traffic Kit TS-001 indicates LOW traffic.
3. **Simulate Congestion / Accident**:
   - Click the **"Simulate Heavy Traffic"** button in the Demo Simulator bar (or click "Next Step" in the 8-step script).
   - Watch Kit TS-001 vehicle units jump: **24 → 31 → 37 units**, and queue extend: **80m → 190m**.
   - Route A turns RED as its estimated delay jumps to **38 minutes**.
4. **Watch Automatic Recalculation**:
   - The status bar displays *"Analyzing live traffic..."* followed by *"Faster alternate route found!"*.
   - Route B (Green Park & Innovation Bypass) lights up green.
   - The route card highlights **"17 minutes saved"**!
5. **Inspect "Why this route?"**:
   - Click the **Why this route?** dropdown on the Route B card to view the algorithmic explanation:
     - ✓ Avoids heavy traffic on Central Expressway
     - ✓ Avoids 190 m queue at Trinity Circle
     - ✓ Lower signal delay
     - ✓ Estimated 17 minutes faster
6. **Switch to Presentation Mode**:
   - Click **"Presentation Mode"** in the top navbar to maximize the map view and highlight live telemetry for audiences.

---

## 12. Future Database & AI Integration

- **PostgreSQL / Supabase**: The `server/services/trafficService.js` file is structured as an in-memory repository layer. Replacing the getter/setter functions with Prisma or Knex queries will persist records directly into PostgreSQL without requiring frontend changes.
- **Machine Learning**: The `server/services/` folder includes architecture provisions for deep learning congestion models (LSTM/Transformers) to replace simulated predictive forecasts.

---

## 13. License
SmartRoute is released under the **MIT License**.
Built with precision for intelligent urban transit and dynamic navigation.
