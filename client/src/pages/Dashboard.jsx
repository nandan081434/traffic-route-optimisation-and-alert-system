import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Sparkles,
  HelpCircle,
  Car,
  Compass,
  Radio,
  Activity,
  AlertTriangle,
  Construction
} from 'lucide-react';

import MapView from '../components/MapView.jsx';
import RouteSummaryBanner from '../components/RouteSummaryBanner.jsx';
import CandidateRouteTable from '../components/CandidateRouteTable.jsx';
import TrafficCorridorsTable from '../components/TrafficCorridorsTable.jsx';
import TrafficKitTable from '../components/TrafficKitTable.jsx';
import SignalCardsSection from '../components/SignalCardsSection.jsx';
import ConstructionSection from '../components/ConstructionSection.jsx';
import IncidentSection from '../components/IncidentSection.jsx';
import AnalyticsCards from '../components/AnalyticsCards.jsx';
import DemoSimulatorBar from '../components/DemoSimulatorBar.jsx';

import { api } from '../services/api.js';

export default function Dashboard({
  kits = [],
  signals = [],
  incidents = [],
  construction = [],
  network = { roads: [] },
  routes = [],
  selectedRoute,
  recommendedRoute,
  selectedRouteId,
  setSelectedRouteId,
  explanation,
  isRecalculating,
  calcStatusText,
  savedMinutes,
  refreshTraffic,
  refreshRoutes,
  presentationMode,
  setPresentationMode
}) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [routeSaved, setRouteSaved] = useState(false);
  const [focusedCoord, setFocusedCoord] = useState(null);

  const mapSectionRef = useRef(null);

  const handleSaveRoute = () => {
    setRouteSaved(true);
    setTimeout(() => setRouteSaved(false), 2500);
  };

  const handleFocusOnMap = (coord) => {
    setFocusedCoord(coord);
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSendMockTelemetry = async (kit) => {
    try {
      await api.sendHardwareTelemetry({
        kitId: kit.id,
        vehicleUnits: Math.min(50, kit.vehicleUnits + 5),
        queueLength: Math.min(220, kit.queueLength + 30),
        averageSpeed: Math.max(5, kit.averageSpeed - 4),
        waitingTime: kit.waitingTime + 15,
        signalStatus: kit.signalStatus
      });
      refreshTraffic();
      refreshRoutes();
    } catch (err) {
      console.error(err);
    }
  };

  const activeDisplayRoute = selectedRoute || recommendedRoute || routes[0];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* 1. PAGE TITLE (Section 2 Hierarchy) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
              SMARTROUTE INTELLIGENCE
            </h1>
            <span className="hidden xs:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
              ROAD MONITORING ACTIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic route recalculation powered by roadside kits & signal telemetry.
          </p>
        </div>

        {/* Action: Save Route */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSaveRoute}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center gap-1.5 shadow-md hover:-translate-y-0.5 active:scale-95 ${
              routeSaved
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Bookmark size={14} className={routeSaved ? 'text-emerald-400' : 'text-slate-400'} />
            <span>{routeSaved ? 'Route Saved!' : 'Save Route'}</span>
          </button>
        </div>
      </div>

      {/* 2. LARGE LIVE MAP SECTION (Section 7, 8, 9, 10, 11, 12, 31) */}
      <div ref={mapSectionRef} className="space-y-2.5 w-full">
        {/* Map Header (Section 7) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">
                  LIVE NETWORK MAP
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium -mt-0.5">
                Dynamic Polyline Routing
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 sm:text-right font-normal">
            Tap any road, signal, kit, or candidate route
          </span>
        </div>

        {/* Large Map View (Dominant visual component) */}
        <MapView
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={(r) => setSelectedRouteId(r.id)}
          kits={kits}
          signals={signals}
          incidents={incidents}
          construction={construction}
          network={network}
          isRecalculating={isRecalculating}
          calcStatusText={calcStatusText}
          savedMinutes={savedMinutes}
          presentationMode={presentationMode}
          focusedCoord={focusedCoord}
        />
      </div>

      {/* 3. ROUTE SUMMARY / TRAFFIC STATUS (Section 13) */}
      <RouteSummaryBanner
        route={activeDisplayRoute}
        savedMinutes={savedMinutes || 17}
        onStartNavigation={() => {}}
        onViewAllRoutes={() => {
          const tableElem = document.getElementById('candidate-routes-table');
          if (tableElem) tableElem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 4. CANDIDATE ROUTE TABLE (Section 14 Desktop Table, Section 15 Mobile Cards) */}
      <div id="candidate-routes-table">
        <CandidateRouteTable
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={(r) => setSelectedRouteId(r.id)}
        />
      </div>

      {/* 5. TRAFFIC CORRIDORS TABLE (Section 16: 1 vehicle = 1 unit rule) */}
      <TrafficCorridorsTable networkRoads={network?.roads || []} />

      {/* 6. TRAFFIC MONITORING KITS TABLE (Section 17) */}
      <TrafficKitTable
        kits={kits}
        onSelectKit={(kit) => handleFocusOnMap([kit.latitude, kit.longitude])}
        onSendMockTelemetry={handleSendMockTelemetry}
      />

      {/* 7. TRAFFIC SIGNALS STATUS (Section 18 with animated countdowns) */}
      <SignalCardsSection
        signals={signals}
        onSelectSignal={(sig) => sig.latitude && handleFocusOnMap([sig.latitude, sig.longitude])}
      />

      {/* 8. ROAD CONSTRUCTION SECTION (Section 19 with View on Map) */}
      <ConstructionSection
        construction={construction}
        onViewOnMap={handleFocusOnMap}
      />

      {/* 9. ACTIVE INCIDENTS SECTION (Section 20 with location focus) */}
      <IncidentSection
        incidents={incidents}
        onFocusIncident={handleFocusOnMap}
      />

      {/* 10. SYSTEM ANALYTICS CARDS (Section 21) */}
      <AnalyticsCards />

      {/* 11. TRAFFIC SIMULATION ENGINE CONTROLS */}
      <DemoSimulatorBar
        onRefresh={() => {
          refreshTraffic();
          refreshRoutes();
        }}
        presentationMode={presentationMode}
        setPresentationMode={setPresentationMode}
        savedMinutes={savedMinutes}
      />

      {/* 12. WHAT MAKES SMARTROUTE DIFFERENT? */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800/90 bg-slate-950/70 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                WHAT MAKES SMARTROUTE DIFFERENT?
              </h4>
              <p className="text-[11px] text-slate-400">
                Next-generation roadside edge telemetry vs. conventional delayed GPS tracking
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 transition-colors"
          >
            <HelpCircle size={13} />
            <span>{showHowItWorks ? 'Hide Workflow' : 'How it works'}</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Traditional navigation systems rely on delayed aggregate smartphone tracking.
          <b> SmartRoute continuously measures real roadside ground truth</b> by uniting four pillars:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="font-bold text-cyan-300 block text-xs">Traffic Kits</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">1 unit per vehicle</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="font-bold text-emerald-300 block text-xs">Smart Signals</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Cycle countdowns</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="font-bold text-amber-300 block text-xs">Road Events</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Accidents & work</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="font-bold text-purple-300 block text-xs">Dynamic Engine</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Sub-minute reroute</span>
          </div>
        </div>

        {/* 7-Step Workflow */}
        {showHowItWorks && (
          <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 border border-cyan-500/30">1</span>
              <span>Roadside traffic kit detects individual vehicle units passing through stop lines.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 border border-cyan-500/30">2</span>
              <span>Sensor calculates exact queue length in meters backwards from intersection.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 border border-cyan-500/30">3</span>
              <span>Discrete traffic status (LOW, MODERATE, HIGH, SEVERE) is dynamically updated.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 border border-cyan-500/30">4</span>
              <span>Backend receives real-time edge telemetry via WebSocket & REST hardware endpoints.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 border border-cyan-500/30">5</span>
              <span>Weighted route cost engine evaluates traffic, red light queues, construction and hazards.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 border border-cyan-500/30">6</span>
              <span>Optimal bypass route is highlighted on the live map in bright emerald green.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 border border-cyan-500/30">7</span>
              <span>Commuter receives instant dynamic notification highlighting exact travel time saved.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
