import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  Sparkles,
  HelpCircle,
  Car,
  Compass,
  Radio,
  Activity,
  AlertTriangle,
  Construction,
  Navigation,
  MapPin,
  RefreshCw
} from 'lucide-react';

import MapView from '../components/MapView.jsx';
import DestinationSearchCard from '../components/DestinationSearchCard.jsx';
import DynamicRecalculationAlert from '../components/DynamicRecalculationAlert.jsx';
import DashboardStats from '../components/DashboardStats.jsx';
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
import { routingService } from '../services/routingService.js';
import { fallbackTolls, realPlacesDirectory } from '../data/fallbackData.js';

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

  // Real Navigation State: Initial default or user-entered locations
  const [originLocation, setOriginLocation] = useState(realPlacesDirectory[0]); // Kamareddy
  const [destinationLocation, setDestinationLocation] = useState(realPlacesDirectory[1]); // Hyderabad
  const [isRealMode, setIsRealMode] = useState(true);

  const [activeRoutes, setActiveRoutes] = useState([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [navDetails, setNavDetails] = useState({
    stepText: 'Head south on National Highway 44 toward Hyderabad',
    eta: 98,
    distance: 114.5,
    trafficLevel: 'LOW'
  });

  // Dynamic route condition recalculation alert
  const [recalcAlert, setRecalcAlert] = useState({
    show: false,
    previousEta: 98,
    currentEta: 112,
    alternateEta: 104,
    potentialSaving: 8,
    incidentText: 'Heavy congestion reported ahead near Toopran junction on NH 44.',
    isSearchingAlt: false
  });

  const mapSectionRef = useRef(null);

  // Initial calculation on load for Kamareddy -> Hyderabad
  useEffect(() => {
    let isMounted = true;
    async function initRoute() {
      try {
        const res = await routingService.calculateRoutes(realPlacesDirectory[0], realPlacesDirectory[1]);
        if (isMounted && res.routes && res.routes.length > 0) {
          setActiveRoutes(res.routes);
          if (res.recommendedRoute) {
            setSelectedRouteId(res.recommendedRoute.id);
          }
        }
      } catch (err) {
        console.warn('Initial route calculation error:', err);
      }
    }
    initRoute();
    return () => { isMounted = false; };
  }, []);

  // When originLocation changes, fly map to the new origin immediately
  const handleOriginChange = (loc) => {
    setOriginLocation(loc);
    setIsRealMode(true);
    if (loc?.latitude && loc?.longitude) {
      setFocusedCoord([loc.latitude, loc.longitude]);
    }
  };

  const handleDestinationChange = (loc) => {
    setDestinationLocation(loc);
    setIsRealMode(true);
  };

  // Calculate routes between origin and destination
  const handleCalculateRoute = async ({ origin, destination }) => {
    setIsCalculatingRoute(true);
    if (origin) {
      setOriginLocation(origin);
      setFocusedCoord([origin.latitude, origin.longitude]);
    }
    if (destination) {
      setDestinationLocation(destination);
    }
    setIsRealMode(true);

    try {
      const res = await routingService.calculateRoutes(origin, destination, {
        isDemoMode: false,
        customTolls: fallbackTolls
      });

      if (res.routes && res.routes.length > 0) {
        setActiveRoutes(res.routes);
        if (res.recommendedRoute) {
          setSelectedRouteId(res.recommendedRoute.id);
        } else {
          setSelectedRouteId(res.routes[0].id);
        }
      }

      if (mapSectionRef.current) {
        mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('Route calculation error:', err);
      throw err;
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleStartNavigation = (targetRoute) => {
    const route = targetRoute || activeDisplayRoute;
    setIsNavigating(true);
    setNavDetails({
      stepText: route?.steps?.[0]?.instruction || `Head toward ${route?.name || 'Highway Corridor'}. Follow highway signs.`,
      eta: route?.estimatedDurationMin || 98,
      distance: route?.distanceKm || 114.5,
      trafficLevel: route?.trafficLevel || 'LOW'
    });

    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Demo route condition change simulation after 10 seconds of navigation
    const demoTimer = setTimeout(() => {
      setRecalcAlert({
        show: true,
        previousEta: route?.estimatedDurationMin || 98,
        currentEta: (route?.estimatedDurationMin || 98) + 14,
        alternateEta: (route?.estimatedDurationMin || 98) + 5,
        potentialSaving: 9,
        incidentText: '⚠️ Incident Alert: Slow traffic and lane obstruction reported ahead.',
        isSearchingAlt: false
      });
    }, 10000);

    return () => clearTimeout(demoTimer);
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setRecalcAlert(prev => ({ ...prev, show: false }));
  };

  const handleSwitchRoute = () => {
    const altRoute = (activeRoutes && activeRoutes.find(r => r.id === 'real-route-2')) || activeRoutes[1];
    if (altRoute) {
      setSelectedRouteId(altRoute.id);
      setNavDetails(prev => ({
        ...prev,
        stepText: `Rerouted via ${altRoute.name}. Potential saving: ${recalcAlert.potentialSaving} min!`,
        eta: altRoute.estimatedDurationMin,
        distance: altRoute.distanceKm,
        trafficLevel: altRoute.trafficLevel
      }));
    }
    setRecalcAlert(prev => ({ ...prev, show: false }));
  };

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

  const candidateList = (activeRoutes && activeRoutes.length > 0) ? activeRoutes : routes;
  const activeDisplayRoute = candidateList.find(r => r.id === selectedRouteId) || candidateList[0];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* 1. APP TITLE & BRANDING */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
              INTELLIGENT TRAFFIC MONITORING AND ROUTE ALERT SYSTEM
            </h1>
            <span className="hidden xs:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
              REAL LOCATION ACTIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic real-time routing, corridor telemetry, traffic signal management & intelligent highway alerts.
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

      {/* 2. REAL DESTINATION SEARCH CARD */}
      <DestinationSearchCard
        currentOrigin={originLocation}
        currentDestination={destinationLocation}
        onOriginChange={handleOriginChange}
        onDestinationChange={handleDestinationChange}
        onCalculateRoute={handleCalculateRoute}
        isCalculating={isCalculatingRoute}
      />

      {/* 3. DYNAMIC RECALCULATION ALERT */}
      <DynamicRecalculationAlert
        showAlert={recalcAlert.show}
        previousEta={recalcAlert.previousEta}
        currentEta={recalcAlert.currentEta}
        alternateEta={recalcAlert.alternateEta}
        potentialSaving={recalcAlert.potentialSaving}
        incidentText={recalcAlert.incidentText}
        isSearchingAlt={recalcAlert.isSearchingAlt}
        onSwitchRoute={handleSwitchRoute}
        onDismiss={() => setRecalcAlert(prev => ({ ...prev, show: false }))}
      />

      {/* 4. DASHBOARD STATISTICS CARDS */}
      <DashboardStats
        kits={kits}
        signals={signals}
        incidents={incidents}
        construction={construction}
        routes={candidateList}
        tolls={activeDisplayRoute?.tollPlazaDetails || fallbackTolls}
      />

      {/* 5. LARGE LIVE MAP SECTION */}
      <div ref={mapSectionRef} className="space-y-2.5 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">
                  LIVE CORRIDOR MAP & NAVIGATION
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {isNavigating ? 'ACTIVE NAVIGATION' : 'REAL CORRIDOR VIEW'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium -mt-0.5">
                {originLocation?.name?.split(',')[0]} → {destinationLocation?.name?.split(',')[0]} ({activeDisplayRoute?.distanceKm || 0} km)
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 sm:text-right font-normal">
            Real driving polyline & toll plazas
          </span>
        </div>

        {/* Large Map View */}
        <MapView
          routes={candidateList}
          selectedRouteId={selectedRouteId}
          onSelectRoute={(r) => setSelectedRouteId(r.id)}
          kits={kits}
          signals={signals}
          incidents={incidents}
          construction={construction}
          tolls={fallbackTolls}
          network={network}
          originLocation={originLocation}
          destinationLocation={destinationLocation}
          isRecalculating={isRecalculating}
          calcStatusText={calcStatusText}
          savedMinutes={savedMinutes}
          presentationMode={presentationMode}
          focusedCoord={focusedCoord}
          isNavigating={isNavigating}
          navDetails={navDetails}
          onStopNavigation={handleStopNavigation}
          isRealMode={isRealMode}
        />
      </div>

      {/* 6. ROUTE SUMMARY BANNER */}
      <RouteSummaryBanner
        route={activeDisplayRoute}
        savedMinutes={savedMinutes || 9}
        isNavigating={isNavigating}
        onStartNavigation={() => handleStartNavigation(activeDisplayRoute)}
        onStopNavigation={handleStopNavigation}
        onViewAllRoutes={() => {
          const tableElem = document.getElementById('candidate-routes-table');
          if (tableElem) tableElem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 7. CANDIDATE ROUTE COMPARISON PANEL */}
      <div id="candidate-routes-table">
        <CandidateRouteTable
          routes={candidateList}
          selectedRouteId={selectedRouteId}
          onSelectRoute={(r) => setSelectedRouteId(r.id)}
          onStartNavigation={handleStartNavigation}
        />
      </div>

      {/* 8. TRAFFIC CORRIDORS TABLE */}
      <TrafficCorridorsTable networkRoads={network?.roads || []} />

      {/* 9. TRAFFIC MONITORING KITS TABLE */}
      <TrafficKitTable
        kits={kits}
        onSelectKit={(kit) => handleFocusOnMap([kit.latitude, kit.longitude])}
        onSendMockTelemetry={handleSendMockTelemetry}
      />

      {/* 10. TRAFFIC SIGNALS STATUS */}
      <SignalCardsSection
        signals={signals}
        onSelectSignal={(sig) => sig.latitude && handleFocusOnMap([sig.latitude, sig.longitude])}
      />

      {/* 11. ROAD CONSTRUCTION SECTION */}
      <ConstructionSection
        construction={construction}
        onViewOnMap={handleFocusOnMap}
      />

      {/* 12. ACTIVE INCIDENTS SECTION */}
      <IncidentSection
        incidents={incidents}
        onFocusIncident={handleFocusOnMap}
      />

      {/* 13. SYSTEM ANALYTICS CARDS */}
      <AnalyticsCards />

      {/* 14. TRAFFIC SIMULATION ENGINE CONTROLS */}
      <DemoSimulatorBar
        onRefresh={() => {
          refreshTraffic();
          refreshRoutes();
        }}
        presentationMode={presentationMode}
        setPresentationMode={setPresentationMode}
        savedMinutes={savedMinutes}
      />

      {/* 15. SYSTEM ARCHITECTURE & HOW IT WORKS */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800/90 bg-slate-950/70 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                INTELLIGENT TRAFFIC MONITORING ARCHITECTURE
              </h4>
              <p className="text-[11px] text-slate-400">
                Multi-corridor real-world navigation combined with roadside edge telemetry
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
          The system evaluates real road networks, highway toll plazas, and junction conditions:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="font-bold text-cyan-300 block text-xs">Real Geocoding</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Nominatim & Photon</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="font-bold text-emerald-300 block text-xs">Driving Polylines</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">OSRM highway routes</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="font-bold text-amber-300 block text-xs">Toll Detection</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Plazas & fees</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="font-bold text-purple-300 block text-xs">Dynamic Alerts</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Sub-minute rerouting</span>
          </div>
        </div>
      </div>
    </div>
  );
}
