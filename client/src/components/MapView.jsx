import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Info,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  Radio,
  TrafficCone,
  Compass,
  Zap,
  X,
  ChevronUp,
  ChevronDown,
  Navigation,
  Loader2
} from 'lucide-react';
import { formatDistance, formatDuration, formatTimeAgo, getTrafficLevelColor } from '../utils/formatters.js';
import { MAP_CONFIG, getActiveMapConfig } from '../config/mapConfig.js';

export default function MapView({
  routes = [],
  selectedRouteId = 'route-a',
  onSelectRoute,
  kits = [],
  signals = [],
  incidents = [],
  construction = [],
  network = { roads: [], junctions: [] },
  isRecalculating = false,
  calcStatusText = '',
  savedMinutes = 0,
  presentationMode = false,
  focusedCoord = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    routes: L.layerGroup(),
    kits: L.layerGroup(),
    signals: L.layerGroup(),
    incidents: L.layerGroup(),
    construction: L.layerGroup(),
    baseRoads: L.layerGroup()
  });

  const [visibleLayers, setVisibleLayers] = useState({
    routes: true,
    kits: true,
    signals: true,
    incidents: true,
    construction: true
  });

  const [showLegend, setShowLegend] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeMobileSheet, setActiveMobileSheet] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [tileError, setTileError] = useState(false);

  // Smoothly fly to focused coordinate when requested
  useEffect(() => {
    if (focusedCoord && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(focusedCoord, 16, { duration: 1.0 });
    }
  }, [focusedCoord]);

  // Initialize Leaflet Map with OpenStreetMap Standard Tiles (Zero API Key)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const mapConfig = getActiveMapConfig();

    const map = L.map(mapContainerRef.current, {
      center: mapConfig.defaultCenter || MAP_CONFIG.defaultCenter,
      zoom: mapConfig.defaultZoom || MAP_CONFIG.defaultZoom,
      minZoom: mapConfig.minZoom || MAP_CONFIG.minZoom,
      maxZoom: mapConfig.maxZoom || MAP_CONFIG.maxZoom,
      zoomControl: false,
      attributionControl: false
    });

    // OpenStreetMap Standard Tiles (No API Key Required)
    const tileLayer = L.tileLayer(mapConfig.tileUrl, {
      maxZoom: mapConfig.maxZoom || 19,
      subdomains: mapConfig.subdomains || ['a', 'b', 'c'],
      attribution: mapConfig.attribution,
      className: mapConfig.className || 'dark-map-tiles'
    });

    tileLayer.on('loading', () => {
      // Subtle loading
    });

    tileLayer.on('load', () => {
      setIsMapLoading(false);
      setTileError(false);
    });

    tileLayer.on('tileerror', () => {
      setTileError(true);
      setIsMapLoading(false);
    });

    // Safety timeout to ensure loading spinner fades even on slow connections
    const loadTimeout = setTimeout(() => {
      setIsMapLoading(false);
    }, 1200);

    tileLayer.addTo(map);

    // Zoom control at bottom right on tablet/desktop
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Proper OpenStreetMap attribution control
    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors')
      .addTo(map);

    // Add layer groups
    Object.values(layersRef.current).forEach((layer) => layer.addTo(map));

    mapInstanceRef.current = map;

    // ResizeObserver for automatic Leaflet size invalidation
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleWindowResize = () => {
      requestAnimationFrame(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
    };

    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);

    // Initial size calculation trigger
    const initialTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(loadTimeout);
      clearTimeout(initialTimer);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Invalidate map size when presentation mode or visibility changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [presentationMode]);

  // Update Base Roads, Closures & Candidate Routes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { baseRoads, routes: routesLayer } = layersRef.current;
    baseRoads.clearLayers();
    routesLayer.clearLayers();

    // 1. Draw base road segments with traffic colors & road closure markers
    if (network.roads && network.roads.length > 0) {
      network.roads.forEach((road) => {
        if (!road.coordinates || road.coordinates.length < 2) return;
        const color = road.isClosed
          ? '#475569'
          : road.trafficLevel === 'SEVERE'
          ? '#ef4444'
          : road.trafficLevel === 'HIGH'
          ? '#f97316'
          : road.trafficLevel === 'MODERATE'
          ? '#f59e0b'
          : '#10b981';

        const poly = L.polyline(road.coordinates, {
          color: color,
          weight: road.isClosed ? 4 : 5,
          opacity: road.isClosed ? 0.45 : 0.65,
          dashArray: road.isClosed ? '6, 8' : undefined
        });

        poly.on('click', () => {
          if (window.innerWidth < 768) {
            setActiveMobileSheet({ type: 'road', data: road });
          }
        });

        poly.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #f8fafc; padding: 2px;">
            <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px;">${road.name}</div>
            <div>Traffic: <b style="color: ${color}">${road.trafficLevel}</b></div>
            <div>Speed: <b>${road.currentSpeed} km/h</b> (Free: ${road.freeFlowSpeed})</div>
            <div>Vehicles: <b>${road.vehicleUnits} units</b></div>
            <div>Queue: <b>${road.queueLength} m</b></div>
            ${road.isClosed ? '<div style="color: #ef4444; font-weight: bold; margin-top: 4px;">⛔ ROAD CLOSED</div>' : ''}
          </div>
        `);

        baseRoads.addLayer(poly);

        // If road is closed, place an interactive closure marker at midpoint
        if (road.isClosed) {
          const midIdx = Math.floor(road.coordinates.length / 2);
          const midCoord = road.coordinates[midIdx];

          const closureIcon = L.divIcon({
            className: 'custom-closure-marker',
            html: `
              <div style="background: #ef4444; color: #fff; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(239,68,68,0.8); border: 2px solid white; font-size: 13px; cursor: pointer;">
                ⛔
              </div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          const closureMarker = L.marker(midCoord, { icon: closureIcon });

          closureMarker.on('click', () => {
            if (window.innerWidth < 768) {
              setActiveMobileSheet({ type: 'closure', data: road });
            }
          });

          closureMarker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 170px;">
              <div style="font-weight: bold; font-size: 13px; color: #ef4444; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
                ROAD CLOSURE
              </div>
              <div style="margin: 2px 0;">Status: <b style="color: #ef4444;">CLOSED</b></div>
              <div style="margin: 2px 0;">Corridor: <b>${road.name}</b></div>
              <div style="margin: 2px 0; color: #fbbf24;">Detour Recommended</div>
            </div>
          `);

          baseRoads.addLayer(closureMarker);
        }
      });
    }

    // 2. Candidate routes (Route A, Route B, Route C)
    if (visibleLayers.routes && routes.length > 0) {
      routes.forEach((route) => {
        if (!route.coordinates || route.coordinates.length < 2) return;
        const isSelected = route.id === selectedRouteId;
        const isRecommended = route.status === 'RECOMMENDED';

        // Glow layer for selected or recommended
        if (isSelected || isRecommended) {
          const glowColor = isRecommended ? '#10b981' : '#06b6d4';
          const glow = L.polyline(route.coordinates, {
            color: glowColor,
            weight: isSelected ? 12 : 8,
            opacity: isSelected ? 0.35 : 0.2,
            lineCap: 'round'
          });
          routesLayer.addLayer(glow);
        }

        // Section 12: Route Visualization Colors
        let strokeColor = '#06b6d4';
        let dashArray = undefined;

        if (route.isClosed) {
          strokeColor = '#ef4444';
          dashArray = '8, 6';
        } else if (route.events?.some(e => e.toLowerCase().includes('construction') || e.toLowerCase().includes('work'))) {
          strokeColor = '#f97316';
          dashArray = '8, 6';
        } else if (route.trafficLevel === 'SEVERE') {
          strokeColor = '#ef4444'; // Slow route: Red
        } else if (isRecommended || isSelected) {
          strokeColor = '#10b981'; // Active route: Bright cyan/green
        } else if (route.trafficLevel === 'MODERATE') {
          strokeColor = '#eab308'; // Alternate route: Yellow
        } else {
          strokeColor = '#06b6d4';
        }

        const line = L.polyline(route.coordinates, {
          color: strokeColor,
          weight: isSelected ? 6 : 4,
          opacity: isSelected ? 0.95 : 0.65,
          dashArray: isSelected ? '10, 8' : dashArray,
          className: isSelected ? 'animated-route-path' : ''
        });

        line.on('click', () => {
          if (onSelectRoute) onSelectRoute(route);
          if (window.innerWidth < 768) {
            setActiveMobileSheet({ type: 'route', data: route });
          }
        });

        line.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #f8fafc; padding: 2px;">
            <div style="font-weight: bold; font-size: 13px; color: ${strokeColor};">${route.code || route.name}</div>
            <div style="font-size: 14px; font-weight: 800; margin: 4px 0;">${formatDuration(route.estimatedDurationMin)} (${formatDistance(route.distanceKm)})</div>
            <div>Status: <b>${route.status}</b></div>
            <div>Traffic: <b>${route.trafficLevel}</b></div>
            ${route.events?.length ? `<div style="margin-top: 4px; color: #fbbf24;">⚠ ${route.events.join(', ')}</div>` : ''}
          </div>
        `);

        routesLayer.addLayer(line);
      });

      // Markers for Start and Destination (Section 11)
      const startCoord = [12.9760, 77.5920];
      const endCoord = [12.9250, 77.6350];

      const startIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div class="marker-pulse-ring" style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background: rgba(56, 189, 248, 0.45); pointer-events: none;"></div>
            <div style="position: relative; background: #0284c7; color: #ffffff; font-weight: 800; font-size: 11px; padding: 3px 9px; border-radius: 9999px; box-shadow: 0 0 12px rgba(14,165,233,0.7); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
              📍 Start
            </div>
          </div>
        `,
        iconSize: [68, 24],
        iconAnchor: [34, 12]
      });

      const endIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position: relative; background: #059669; color: #ffffff; font-weight: 800; font-size: 11px; padding: 3px 10px; border-radius: 9999px; box-shadow: 0 0 16px rgba(16,185,129,0.85); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            🏁 Destination
          </div>
        `,
        iconSize: [98, 24],
        iconAnchor: [49, 12]
      });

      routesLayer.addLayer(L.marker(startCoord, { icon: startIcon }));
      routesLayer.addLayer(L.marker(endCoord, { icon: endIcon }));
    }
  }, [routes, selectedRouteId, network, visibleLayers.routes, onSelectRoute]);

  // Update Traffic Kits Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const layer = layersRef.current.kits;
    layer.clearLayers();

    if (!visibleLayers.kits) return;

    kits.forEach((kit) => {
      if (!kit.latitude || !kit.longitude) return;

      const isHigh = kit.trafficLevel === 'HIGH' || kit.trafficLevel === 'SEVERE';
      const badgeColor = isHigh ? '#ef4444' : '#06b6d4';

      const icon = L.divIcon({
        className: 'custom-kit-marker',
        html: `
          <div style="background: #0f172a; border: 2px solid ${badgeColor}; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${badgeColor}66; cursor: pointer;">
            <span style="font-size: 13px;">📡</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([kit.latitude, kit.longitude], { icon });

      // When tapped on mobile, open bottom sheet
      marker.on('click', () => {
        if (window.innerWidth < 768) {
          setActiveMobileSheet({ type: 'kit', data: kit });
        }
      });

      // Marker popup matching Section 7 exact specification
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 180px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
            <b style="font-size: 13px; color: #38bdf8;">TRAFFIC KIT ${kit.id}</b>
            <span style="background: #10b98122; color: #34d399; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">${kit.status || 'ONLINE'}</span>
          </div>
          <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px;">${kit.location}</div>
          <div style="margin: 2px 0;">Vehicle Units: <b>${kit.vehicleUnits}</b></div>
          <div style="margin: 2px 0;">Queue Length: <b style="color: #fbbf24;">${kit.queueLength} m</b></div>
          <div style="margin: 2px 0;">Average Speed: <b>${kit.averageSpeed} km/h</b></div>
          <div style="margin: 2px 0;">Waiting Time: <b>${kit.waitingTime} sec</b></div>
          <div style="margin: 2px 0;">Signal: <b style="color: ${kit.signalStatus === 'RED' ? '#f43f5e' : '#34d399'};">${kit.signalStatus}</b></div>
          <div style="margin: 2px 0;">Traffic: <b style="color: ${kit.trafficLevel === 'SEVERE' || kit.trafficLevel === 'HIGH' ? '#f43f5e' : '#34d399'};">${kit.trafficLevel}</b></div>
          <div style="font-size: 10px; color: #64748b; margin-top: 6px; border-top: 1px solid #334155; padding-top: 4px;">Last updated: ${formatTimeAgo(kit.lastUpdated)}</div>
        </div>
      `);

      layer.addLayer(marker);
    });
  }, [kits, visibleLayers.kits]);

  // Update Signals Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const layer = layersRef.current.signals;
    layer.clearLayers();

    if (!visibleLayers.signals) return;

    signals.forEach((sig) => {
      if (!sig.latitude || !sig.longitude) return;

      const lightColor = sig.status === 'RED' ? '#f43f5e' : sig.status === 'GREEN' ? '#10b981' : '#fbbf24';

      const icon = L.divIcon({
        className: 'custom-signal-marker',
        html: `
          <div style="background: #020617; border: 2px solid ${lightColor}; border-radius: 8px; padding: 2px 5px; display: flex; align-items: center; gap: 3px; box-shadow: 0 0 10px ${lightColor}88;">
            <span>🚦</span>
            <span style="font-size: 10px; font-weight: 800; font-family: monospace; color: ${lightColor};">${sig.status === 'RED' ? sig.redRemaining : sig.greenRemaining}s</span>
          </div>
        `,
        iconSize: [44, 24],
        iconAnchor: [22, 12]
      });

      const marker = L.marker([sig.latitude, sig.longitude], { icon });

      marker.on('click', () => {
        if (window.innerWidth < 768) {
          setActiveMobileSheet({ type: 'signal', data: sig });
        }
      });

      // Marker popup matching Section 7 exact specification
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 180px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
            <b style="font-size: 13px; color: #f8fafc;">TRAFFIC SIGNAL</b>
            <span style="background: ${sig.status === 'RED' ? '#f43f5e22' : '#10b98122'}; color: ${lightColor}; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">${sig.status}</span>
          </div>
          <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px;">${sig.name || sig.location} (${sig.id})</div>
          <div style="margin: 2px 0;">Status: <b style="color: ${lightColor};">${sig.status}</b></div>
          <div style="margin: 2px 0;">Remaining: <b style="color: ${lightColor};">${sig.status === 'RED' ? sig.redRemaining : sig.greenRemaining} sec</b></div>
          <div style="margin: 2px 0;">Waiting Vehicles: <b>${sig.vehiclesWaiting} units</b></div>
          <div style="margin: 2px 0;">Queue: <b style="color: #fbbf24;">${sig.queueLength} m</b></div>
        </div>
      `);

      layer.addLayer(marker);
    });
  }, [signals, visibleLayers.signals]);

  // Update Incidents Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const layer = layersRef.current.incidents;
    layer.clearLayers();

    if (!visibleLayers.incidents) return;

    incidents.forEach((inc) => {
      if (!inc.latitude || !inc.longitude) return;

      const icon = L.divIcon({
        className: 'custom-incident-marker',
        html: `
          <div style="background: #ef4444; color: #fff; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(239,68,68,0.8); border: 2px solid white; font-size: 13px;">
            ⚠
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon });

      marker.on('click', () => {
        if (window.innerWidth < 768) {
          setActiveMobileSheet({ type: 'incident', data: inc });
        }
      });

      // Marker popup matching Section 7 exact specification
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 180px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
            <b style="font-size: 13px; color: #ef4444;">${inc.type ? inc.type.toUpperCase() : 'ACCIDENT'}</b>
            <span style="background: #ef444422; color: #f87171; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">${inc.severity}</span>
          </div>
          <div style="margin: 2px 0;">Severity: <b style="color: #ef4444;">${inc.severity}</b></div>
          <div style="margin: 2px 0;">Traffic Impact: <b style="color: #ef4444;">${inc.trafficImpact || 'SEVERE'}</b></div>
          <div style="margin: 2px 0;">Location: <b>${inc.location}</b></div>
          ${inc.description ? `<div style="margin: 2px 0; font-size: 11px; color: #cbd5e1;">${inc.description}</div>` : ''}
          <div style="font-size: 10px; color: #64748b; margin-top: 6px; border-top: 1px solid #334155; padding-top: 4px;">Reported: ${formatTimeAgo(inc.reportedAt)}</div>
        </div>
      `);

      layer.addLayer(marker);
    });
  }, [incidents, visibleLayers.incidents]);

  // Update Construction Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const layer = layersRef.current.construction;
    layer.clearLayers();

    if (!visibleLayers.construction) return;

    construction.forEach((con) => {
      if (!con.latitude || !con.longitude) return;

      const icon = L.divIcon({
        className: 'custom-construction-marker',
        html: `
          <div style="background: #f59e0b; color: #000; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(245,158,11,0.8); border: 2px solid white; font-size: 13px;">
            🚧
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([con.latitude, con.longitude], { icon });

      marker.on('click', () => {
        if (window.innerWidth < 768) {
          setActiveMobileSheet({ type: 'construction', data: con });
        }
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 170px;">
          <div style="font-weight: bold; font-size: 13px; color: #fbbf24; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
            ROAD CONSTRUCTION
          </div>
          <div style="margin: 2px 0;">Road: <b>${con.road}</b></div>
          <div style="margin: 2px 0;">Affected: <b style="color: #fbbf24;">${con.affectedDistance} m</b></div>
          <div style="margin: 2px 0;">Lanes: <b>${con.lanesBefore} → ${con.lanesAfter}</b></div>
          <div style="margin: 2px 0;">Impact: <b style="color: #fbbf24;">${con.trafficImpact}</b></div>
        </div>
      `);

      layer.addLayer(marker);
    });
  }, [construction, visibleLayers.construction]);

  const toggleLayer = (key) => {
    setVisibleLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#090d16] transition-all min-w-0 max-w-none ${
        presentationMode
          ? 'h-[calc(100dvh-100px)] min-h-[620px]'
          : 'h-[calc(100dvh-180px)] min-h-[460px] sm:h-[clamp(500px,64vh,740px)] lg:h-[clamp(560px,72vh,880px)]'
      }`}
    >
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Subtle Map Loading Animation */}
      {isMapLoading && (
        <div className="absolute inset-0 z-[450] bg-[#090d16]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 pointer-events-none transition-opacity duration-300">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse shadow-lg shadow-cyan-500/10">
            <Compass size={28} className="animate-spin" />
          </div>
          <span className="text-xs font-bold text-white tracking-wider">
            LOADING SMARTROUTE LIVE MAP...
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Connecting OpenStreetMap standard tiles
          </span>
        </div>
      )}

      {/* Fallback Notice if tiles fail */}
      {tileError && (
        <div className="absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 z-[410] max-w-sm w-[90%] pointer-events-none">
          <div className="glass-panel p-2 px-3 rounded-xl bg-amber-950/90 border border-amber-500/40 text-[11px] text-amber-200 flex items-center gap-2 shadow-lg">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <span>{MAP_CONFIG.fallbackNotice || 'Map tiles unavailable. Showing traffic network overlay.'}</span>
          </div>
        </div>
      )}

      {/* Top Banner: SIMULATED ENVIRONMENT */}
      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-[400] flex items-center gap-2 max-w-[calc(100%-110px)]">
        <div className="glass-panel px-2.5 py-1 rounded-xl border border-slate-700/80 bg-slate-900/90 text-[11px] sm:text-xs font-semibold text-slate-200 flex items-center gap-1.5 sm:gap-2 shadow-lg backdrop-blur-md truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-mono text-cyan-400 font-bold shrink-0">SMARTROUTE</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400 truncate">Metro Tech Corridor</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
            SIMULATED
          </span>
        </div>
      </div>

      {/* Dynamic Recalculation Alert Banner */}
      {isRecalculating && (
        <div className="absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 z-[400] max-w-sm sm:max-w-md w-[92%] px-2 animate-bounce">
          <div className="glass-panel-elevated p-2.5 sm:p-3 rounded-2xl bg-cyan-950/95 border border-cyan-400/60 shadow-2xl flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2">
              <span className="animate-spin text-cyan-400 shrink-0">
                <Compass size={18} />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-cyan-300 text-xs">Live Traffic Changed!</p>
                <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                  {calcStatusText || 'Calculating optimal alternate routes...'}
                </p>
              </div>
            </div>
            {savedMinutes > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 font-mono text-[11px] shrink-0">
                {savedMinutes}m saved
              </span>
            )}
          </div>
        </div>
      )}

      {/* Map Legend (Bottom-Left) - Section 9 */}
      <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 z-[400] max-w-[210px]">
        {/* Mobile floating button */}
        <div className="sm:hidden">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="glass-panel px-2.5 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/95 text-[10px] font-bold text-slate-200 flex items-center gap-1.5 shadow-lg backdrop-blur-md active:scale-95 transition-all"
            aria-label="Toggle legend"
          >
            <Info size={12} className="text-cyan-400" />
            <span>Legend</span>
          </button>
        </div>

        {/* Legend Content */}
        <div className={`glass-panel rounded-xl border border-slate-800/90 bg-slate-950/90 p-2.5 shadow-xl text-xs backdrop-blur-md ${
          showLegend ? 'block mt-1 sm:mt-0' : 'hidden sm:block'
        }`}>
          <div className="flex items-center justify-between w-full gap-2 font-bold text-slate-300 text-[10px] pb-1 border-b border-slate-800/80">
            <span className="tracking-wider uppercase font-mono text-[9px] text-slate-400">LEGEND</span>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="text-slate-500 text-[9px] hover:text-slate-300 sm:hidden"
            >
              ✕
            </button>
          </div>

          <div className="mt-1.5 grid grid-cols-2 gap-x-2.5 gap-y-1 text-[10px] text-slate-300 leading-tight">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_#10b981]" /> Low</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_#f59e0b]" /> Moderate</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 shadow-[0_0_6px_#f97316]" /> High</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 shadow-[0_0_6px_#ef4444]" /> Severe</div>
            <div className="flex items-center gap-1.5"><span>🚧</span> Construction</div>
            <div className="flex items-center gap-1.5"><span>⚠</span> Accident</div>
            <div className="flex items-center gap-1.5"><span>🚦</span> Signal</div>
            <div className="flex items-center gap-1.5"><span>📡</span> Traffic Kit</div>
            <div className="flex items-center gap-1.5 col-span-2"><span>⛔</span> Road Closure</div>
          </div>
        </div>
      </div>

      {/* Map Controls / Filter Chips (Top-Right) - Section 8 */}
      <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-[400] flex flex-col items-end gap-1.5">
        {/* Mobile floating layers button */}
        <div className="sm:hidden">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="glass-panel px-2.5 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/95 text-[10px] font-bold text-cyan-300 flex items-center gap-1.5 shadow-lg backdrop-blur-md active:scale-95 transition-all"
            aria-label="Toggle map filters"
          >
            <Layers size={13} />
            <span>Filters</span>
          </button>
        </div>

        {/* Mobile Filter Dropdown */}
        {showMobileFilters && (
          <div className="sm:hidden glass-panel p-2.5 rounded-xl border border-slate-800 bg-slate-950/95 shadow-xl text-xs space-y-2 backdrop-blur-md w-36">
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-200">
              <input
                type="checkbox"
                checked={visibleLayers.kits}
                onChange={() => toggleLayer('kits')}
                className="w-3.5 h-3.5 accent-cyan-500 rounded"
              />
              <span>📡 Kits</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-200">
              <input
                type="checkbox"
                checked={visibleLayers.signals}
                onChange={() => toggleLayer('signals')}
                className="w-3.5 h-3.5 accent-emerald-500 rounded"
              />
              <span>🚦 Signals</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-200">
              <input
                type="checkbox"
                checked={visibleLayers.incidents}
                onChange={() => toggleLayer('incidents')}
                className="w-3.5 h-3.5 accent-rose-500 rounded"
              />
              <span>⚠ Hazards</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-200">
              <input
                type="checkbox"
                checked={visibleLayers.construction}
                onChange={() => toggleLayer('construction')}
                className="w-3.5 h-3.5 accent-amber-500 rounded"
              />
              <span>🚧 Work</span>
            </label>
          </div>
        )}

        {/* Desktop / Tablet polished filter chips */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => toggleLayer('kits')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 backdrop-blur-md hover:-translate-y-0.5 active:scale-95 ${
              visibleLayers.kits
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm shadow-cyan-500/10 font-bold'
                : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-900/80'
            }`}
          >
            <span>📡</span>
            <span>Kits</span>
          </button>

          <button
            onClick={() => toggleLayer('signals')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 backdrop-blur-md hover:-translate-y-0.5 active:scale-95 ${
              visibleLayers.signals
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-sm shadow-emerald-500/10 font-bold'
                : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-900/80'
            }`}
          >
            <span>🚦</span>
            <span>Signals</span>
          </button>

          <button
            onClick={() => toggleLayer('incidents')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 backdrop-blur-md hover:-translate-y-0.5 active:scale-95 ${
              visibleLayers.incidents
                ? 'bg-rose-500/20 text-rose-300 border-rose-400/50 shadow-sm shadow-rose-500/10 font-bold'
                : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-900/80'
            }`}
          >
            <span>⚠</span>
            <span>Hazards</span>
          </button>
        </div>
      </div>

      {/* MOBILE MARKER BOTTOM SHEET */}
      <AnimatePresence>
        {activeMobileSheet && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="md:hidden absolute bottom-0 left-0 right-0 z-[500] glass-panel-elevated bg-slate-950/98 border-t border-cyan-500/40 p-4 rounded-t-2xl shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">
                  {activeMobileSheet.type === 'kit'
                    ? '📡'
                    : activeMobileSheet.type === 'signal'
                    ? '🚦'
                    : activeMobileSheet.type === 'incident'
                    ? '⚠'
                    : activeMobileSheet.type === 'construction'
                    ? '🚧'
                    : activeMobileSheet.type === 'closure'
                    ? '⛔'
                    : '🛣'}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase">
                    {activeMobileSheet.type === 'kit'
                      ? `TRAFFIC KIT ${activeMobileSheet.data.id}`
                      : activeMobileSheet.type === 'signal'
                      ? 'TRAFFIC SIGNAL'
                      : activeMobileSheet.type === 'incident'
                      ? (activeMobileSheet.data.type || 'ACCIDENT').toUpperCase()
                      : activeMobileSheet.type === 'closure'
                      ? 'ROAD CLOSURE'
                      : activeMobileSheet.data.name || 'Map Feature'}
                  </h4>
                  <p className="text-[10px] text-slate-400">{activeMobileSheet.data.location}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveMobileSheet(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition-colors"
                aria-label="Close details"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mobile Sheet Content matching Section 7 */}
            {activeMobileSheet.type === 'kit' && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                    {activeMobileSheet.data.status || 'ONLINE'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Vehicle Units</span>
                    <span className="text-sm font-bold text-white font-mono">
                      {activeMobileSheet.data.vehicleUnits}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Queue Length</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">
                      {activeMobileSheet.data.queueLength} m
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Average Speed</span>
                    <span className="text-sm font-bold text-cyan-400 font-mono">
                      {activeMobileSheet.data.averageSpeed} km/h
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Waiting Time</span>
                    <span className="text-sm font-bold text-purple-400 font-mono">
                      {activeMobileSheet.data.waitingTime} sec
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Signal: <b className={activeMobileSheet.data.signalStatus === 'RED' ? 'text-rose-400' : 'text-emerald-400'}>{activeMobileSheet.data.signalStatus}</b></span>
                  <span className="font-bold text-white">TRAFFIC: <span className="text-rose-400 font-mono">{activeMobileSheet.data.trafficLevel}</span></span>
                </div>
              </div>
            )}

            {activeMobileSheet.type === 'signal' && (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Status</span>
                    <span className={`text-sm font-bold font-mono ${activeMobileSheet.data.status === 'RED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {activeMobileSheet.data.status}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Remaining</span>
                    <span className="text-sm font-bold text-cyan-400 font-mono">
                      {activeMobileSheet.data.status === 'RED'
                        ? activeMobileSheet.data.redRemaining
                        : activeMobileSheet.data.greenRemaining} sec
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Waiting Vehicles</span>
                    <span className="text-sm font-bold text-white font-mono">
                      {activeMobileSheet.data.vehiclesWaiting} units
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Queue</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">
                      {activeMobileSheet.data.queueLength} m
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeMobileSheet.type === 'incident' && (
              <div className="text-xs space-y-2 text-slate-300">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Severity</span>
                    <span className="text-sm font-bold text-rose-400">{activeMobileSheet.data.severity}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Traffic Impact</span>
                    <span className="text-sm font-bold text-rose-400">{activeMobileSheet.data.trafficImpact || 'SEVERE'}</span>
                  </div>
                </div>
                {activeMobileSheet.data.description && (
                  <p className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                    {activeMobileSheet.data.description}
                  </p>
                )}
                <p className="text-[10px] text-slate-500">Reported: {formatTimeAgo(activeMobileSheet.data.reportedAt)}</p>
              </div>
            )}

            {activeMobileSheet.type === 'construction' && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Affected Distance</span>
                  <span className="text-sm font-bold text-amber-300 font-mono">
                    {activeMobileSheet.data.affectedDistance} m
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Lanes</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {activeMobileSheet.data.lanesBefore} → {activeMobileSheet.data.lanesAfter}
                  </span>
                </div>
              </div>
            )}

            {activeMobileSheet.type === 'closure' && (
              <div className="text-xs space-y-2 text-slate-300">
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-200">
                  <p className="font-bold">⛔ Road Corridor Closed</p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Corridor: <b>{activeMobileSheet.data.name}</b>. Route calculation automatically detours around this segment.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
