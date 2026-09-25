import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Info,
  Sparkles,
  AlertTriangle,
  Radio,
  Compass,
  X,
  Navigation,
  MapPin
} from 'lucide-react';
import { formatDistance, formatDuration, formatTimeAgo } from '../utils/formatters.js';
import { MAP_CONFIG, getActiveMapConfig } from '../config/mapConfig.js';
import { fallbackTolls } from '../data/fallbackData.js';

export default function MapView({
  routes = [],
  selectedRouteId = 'route-a',
  onSelectRoute,
  kits = [],
  signals = [],
  incidents = [],
  construction = [],
  tolls = fallbackTolls,
  network = { roads: [], junctions: [] },
  originLocation = null,
  destinationLocation = null,
  isRecalculating = false,
  calcStatusText = '',
  savedMinutes = 0,
  presentationMode = false,
  focusedCoord = null,
  isNavigating = false,
  navDetails = null,
  onStopNavigation = null,
  onTriggerMyLocation = null,
  isRealMode = false
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    routes: L.layerGroup(),
    kits: L.layerGroup(),
    signals: L.layerGroup(),
    incidents: L.layerGroup(),
    construction: L.layerGroup(),
    tolls: L.layerGroup(),
    baseRoads: L.layerGroup(),
    markers: L.layerGroup()
  });

  // Layer toggles
  const [visibleLayers, setVisibleLayers] = useState({
    routes: true,
    traffic: true,
    signals: true,
    construction: true,
    incidents: true,
    tolls: true,
    kits: true
  });

  const [showLegend, setShowLegend] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeMobileSheet, setActiveMobileSheet] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [tileError, setTileError] = useState(false);

  // Check if real navigation mode is active
  const isReal = isRealMode ||
    routes.some(r => r.isReal) ||
    Boolean(originLocation && Math.abs(originLocation.latitude - 12.97) > 0.4);

  // Smoothly fly to focused coordinate when requested
  useEffect(() => {
    if (focusedCoord && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(focusedCoord, 15, { duration: 1.0 });
    }
  }, [focusedCoord]);

  // When originLocation changes, center the map on the origin
  useEffect(() => {
    if (originLocation && originLocation.latitude && originLocation.longitude && mapInstanceRef.current) {
      const selected = routes.find(r => r.id === selectedRouteId) || routes[0];
      if (!selected || !selected.coordinates || selected.coordinates.length < 2) {
        mapInstanceRef.current.flyTo([originLocation.latitude, originLocation.longitude], 12, { duration: 1.0 });
      }
    }
  }, [originLocation?.latitude, originLocation?.longitude]);

  // Fit bounds when routes change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const selected = routes.find(r => r.id === selectedRouteId) || routes[0];
    if (selected && selected.coordinates && selected.coordinates.length > 1) {
      try {
        const bounds = L.latLngBounds(selected.coordinates);
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch (err) {
        console.warn('fitBounds error:', err);
      }
    } else if (originLocation && destinationLocation && originLocation.latitude && destinationLocation.latitude) {
      try {
        const bounds = L.latLngBounds([
          [originLocation.latitude, originLocation.longitude],
          [destinationLocation.latitude, destinationLocation.longitude]
        ]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      } catch (err) {
        console.warn('fitBounds error:', err);
      }
    }
  }, [selectedRouteId, routes]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const mapConfig = getActiveMapConfig();
    const initialCenter = originLocation?.latitude
      ? [originLocation.latitude, originLocation.longitude]
      : (mapConfig.defaultCenter || MAP_CONFIG.defaultCenter);

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: mapConfig.defaultZoom || MAP_CONFIG.defaultZoom,
      minZoom: mapConfig.minZoom || MAP_CONFIG.minZoom,
      maxZoom: mapConfig.maxZoom || MAP_CONFIG.maxZoom,
      zoomControl: false,
      attributionControl: false
    });

    const tileLayer = L.tileLayer(mapConfig.tileUrl, {
      maxZoom: mapConfig.maxZoom || 19,
      subdomains: mapConfig.subdomains || ['a', 'b', 'c'],
      attribution: mapConfig.attribution,
      className: mapConfig.className || 'dark-map-tiles'
    });

    tileLayer.on('load', () => {
      setIsMapLoading(false);
      setTileError(false);
    });

    tileLayer.on('tileerror', () => {
      setTileError(true);
      setIsMapLoading(false);
    });

    const loadTimeout = setTimeout(() => {
      setIsMapLoading(false);
    }, 1200);

    tileLayer.addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors')
      .addTo(map);

    Object.values(layersRef.current).forEach((layer) => layer.addTo(map));

    mapInstanceRef.current = map;

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

  // Invalidate map size when presentation mode changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [presentationMode]);

  // Update Base Roads & Closures
  // IMPORTANT: When in Real Mode (e.g. Kamareddy/Hyderabad), REMOVE simulated Bengaluru network roads
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { baseRoads } = layersRef.current;
    baseRoads.clearLayers();

    if (!visibleLayers.traffic || isReal) return;

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
            <div style="font-weight: bold; font-size: 13px; color: ${color}; margin-bottom: 4px; border-bottom: 1px solid #334155; padding-bottom: 2px;">
              TRAFFIC CONDITION
            </div>
            <div>Road: <b>${road.name}</b></div>
            <div>Traffic: <b style="color: ${color}">${road.trafficLevel || 'MODERATE'}</b></div>
            <div>Estimated delay: <b>+${road.trafficDelayMin || 8} min</b></div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Source: ${road.simulated !== false ? 'Demo Data' : 'Live Data'}</div>
            ${road.isClosed ? '<div style="color: #ef4444; font-weight: bold; margin-top: 4px;">⛔ ROAD CLOSED</div>' : ''}
          </div>
        `);

        baseRoads.addLayer(poly);
      });
    }
  }, [network, visibleLayers.traffic, isReal]);

  // Update Candidate Routes (Route A, Route B)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { routes: routesLayer } = layersRef.current;
    routesLayer.clearLayers();

    if (!visibleLayers.routes || routes.length === 0) return;

    routes.forEach((route) => {
      if (!route.coordinates || route.coordinates.length < 2) return;
      const isSelected = route.id === selectedRouteId;
      const isRecommended = route.recommended || route.status === 'RECOMMENDED';

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

      let strokeColor = '#06b6d4';
      let dashArray = undefined;

      if (route.hasClosure || route.isClosed) {
        strokeColor = '#ef4444';
        dashArray = '8, 6';
      } else if (route.trafficLevel === 'SEVERE' || route.trafficLevel === 'HIGH') {
        strokeColor = '#f97316';
      } else if (isRecommended || isSelected) {
        strokeColor = '#10b981';
      } else if (route.trafficLevel === 'MODERATE') {
        strokeColor = '#eab308';
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
          <div>Status: <b style="color: ${isRecommended ? '#34d399' : '#38bdf8'}">${route.status || (isRecommended ? 'RECOMMENDED' : 'ALTERNATE')}</b></div>
          <div>Traffic: <b>${route.trafficLevel}</b></div>
          <div>Signals: <b>${route.trafficLights || 0}</b> | Tolls: <b>₹${route.tollCost || 0}</b></div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Source: ${route.source || (isReal ? 'Real Driving Route' : 'Simulated')}</div>
        </div>
      `);

      routesLayer.addLayer(line);
    });
  }, [routes, selectedRouteId, visibleLayers.routes, onSelectRoute, isReal]);

  // Update Origin and Destination Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { markers } = layersRef.current;
    markers.clearLayers();

    if (!originLocation && !destinationLocation) return;

    if (originLocation && originLocation.latitude && originLocation.longitude) {
      const startIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div class="marker-pulse-ring" style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background: rgba(56, 189, 248, 0.45); pointer-events: none;"></div>
            <div style="position: relative; background: #0284c7; color: #ffffff; font-weight: 800; font-size: 11px; padding: 3px 9px; border-radius: 9999px; box-shadow: 0 0 12px rgba(14,165,233,0.7); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
              📍 ${originLocation.isCurrentLocation ? 'My Location' : 'Start'}
            </div>
          </div>
        `,
        iconSize: [84, 24],
        iconAnchor: [42, 12]
      });

      const startMarker = L.marker([originLocation.latitude, originLocation.longitude], { icon: startIcon });
      startMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #f8fafc;">
          <div style="font-weight: bold; color: #38bdf8;">📍 Origin / Start Location</div>
          <div style="margin-top: 2px; font-weight: 600;">${originLocation.name}</div>
          <div style="font-size: 10px; color: #94a3b8; font-mono; margin-top: 2px;">
            ${originLocation.latitude.toFixed(4)}, ${originLocation.longitude.toFixed(4)}
          </div>
        </div>
      `);
      markers.addLayer(startMarker);
    }

    if (destinationLocation && destinationLocation.latitude && destinationLocation.longitude) {
      const endIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position: relative; background: #059669; color: #ffffff; font-weight: 800; font-size: 11px; padding: 3px 10px; border-radius: 9999px; box-shadow: 0 0 16px rgba(16,185,129,0.85); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            🎯 Destination
          </div>
        `,
        iconSize: [98, 24],
        iconAnchor: [49, 12]
      });

      const endMarker = L.marker([destinationLocation.latitude, destinationLocation.longitude], { icon: endIcon });
      endMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #f8fafc;">
          <div style="font-weight: bold; color: #34d399;">🎯 Destination</div>
          <div style="margin-top: 2px; font-weight: 600;">${destinationLocation.name}</div>
          <div style="font-size: 10px; color: #94a3b8; font-mono; margin-top: 2px;">
            ${destinationLocation.latitude.toFixed(4)}, ${destinationLocation.longitude.toFixed(4)}
          </div>
        </div>
      `);
      markers.addLayer(endMarker);
    }
  }, [originLocation, destinationLocation]);

  // Update Toll Plazas (Section 10)
  // In Real Mode, ONLY show tolls that lie along the active corridor (e.g. Manoharabad on NH 44)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const layer = layersRef.current.tolls;
    layer.clearLayers();

    if (!visibleLayers.tolls) return;

    const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
    let tollList = [];

    if (isReal) {
      if (selectedRoute?.tollPlazaDetails && selectedRoute.tollPlazaDetails.length > 0) {
        tollList = selectedRoute.tollPlazaDetails;
      } else if (selectedRoute?.coordinates) {
        tollList = (tolls || fallbackTolls).filter(t => {
          return selectedRoute.coordinates.some(([lat, lon]) => Math.abs(lat - t.latitude) < 0.04 && Math.abs(lon - t.longitude) < 0.04);
        });
      }
    } else {
      tollList = tolls && tolls.length > 0 ? tolls : fallbackTolls;
    }

    tollList.forEach((toll) => {
      if (!toll.latitude || !toll.longitude) return;

      const tollIcon = L.divIcon({
        className: 'custom-toll-marker',
        html: `
          <div style="background: #1e1b4b; border: 2px solid #818cf8; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(129,140,248,0.7); cursor: pointer; color: white;">
            <span style="font-size: 13px;">🛣️</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([toll.latitude, toll.longitude], { icon: tollIcon });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 175px;">
          <div style="font-weight: bold; font-size: 13px; color: #a5b4fc; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span>🛣️ TOLL PLAZA</span>
            <span style="background: rgba(129,140,248,0.2); color: #a5b4fc; font-size: 9px; padding: 1px 5px; border-radius: 4px; font-weight: bold;">
              ${toll.simulated ? 'SIMULATED' : 'HIGHWAY TOLL'}
            </span>
          </div>
          <div style="margin: 2px 0;">Name: <b>${toll.name}</b></div>
          <div style="margin: 2px 0;">Location: <b>${toll.location || 'Highway Corridor'}</b></div>
          <div style="margin: 2px 0;">Estimated Toll: <b style="color: #34d399;">₹${toll.estimatedCost || 85}</b></div>
          <div style="margin: 2px 0;">Estimated Stop: <b>${toll.estimatedDelayMinutes ? toll.estimatedDelayMinutes + ' min' : '2 min'}</b></div>
        </div>
      `);

      layer.addLayer(marker);
    });
  }, [tolls, visibleLayers.tolls, isReal, selectedRouteId, routes]);

  // Update Signals, Kits, Incidents, Construction
  // In Real Mode, suppress simulated demo pins unless specifically matching coordinates
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { signals: sigLayer, kits: kitLayer, incidents: incLayer, construction: conLayer } = layersRef.current;
    sigLayer.clearLayers();
    kitLayer.clearLayers();
    incLayer.clearLayers();
    conLayer.clearLayers();

    if (isReal) {
      // In real mode, don't show Bengaluru demo pins
      return;
    }

    // Render demo signals
    if (visibleLayers.signals) {
      signals.forEach((sig) => {
        if (!sig.latitude || !sig.longitude) return;
        const lightColor = sig.status === 'RED' ? '#f43f5e' : sig.status === 'GREEN' ? '#10b981' : '#fbbf24';
        const icon = L.divIcon({
          className: 'custom-signal-marker',
          html: `
            <div style="background: #020617; border: 2px solid ${lightColor}; border-radius: 8px; padding: 2px 5px; display: flex; align-items: center; gap: 3px; box-shadow: 0 0 10px ${lightColor}88;">
              <span>🚦</span>
              <span style="font-size: 10px; font-weight: 800; font-family: monospace; color: ${lightColor};">
                ${sig.status === 'RED' ? sig.redRemaining : (sig.greenRemaining || 24)}s
              </span>
            </div>
          `,
          iconSize: [44, 24],
          iconAnchor: [22, 12]
        });
        const marker = L.marker([sig.latitude, sig.longitude], { icon });
        sigLayer.addLayer(marker);
      });
    }

    // Render demo kits
    if (visibleLayers.kits) {
      kits.forEach((kit) => {
        if (!kit.latitude || !kit.longitude) return;
        const badgeColor = kit.trafficLevel === 'SEVERE' ? '#ef4444' : '#06b6d4';
        const icon = L.divIcon({
          className: 'custom-kit-marker',
          html: `
            <div style="background: #0f172a; border: 2px solid ${badgeColor}; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${badgeColor}66;">
              <span style="font-size: 13px;">📡</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        const marker = L.marker([kit.latitude, kit.longitude], { icon });
        kitLayer.addLayer(marker);
      });
    }

    // Render demo incidents
    if (visibleLayers.incidents) {
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
        incLayer.addLayer(marker);
      });
    }

    // Render demo construction
    if (visibleLayers.construction) {
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
        conLayer.addLayer(marker);
      });
    }
  }, [signals, kits, incidents, construction, visibleLayers, isReal]);

  const toggleLayer = (key) => {
    setVisibleLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCenterOnUser = () => {
    if (originLocation && originLocation.latitude && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([originLocation.latitude, originLocation.longitude], 14, { duration: 1.2 });
    } else if (onTriggerMyLocation) {
      onTriggerMyLocation();
    }
  };

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

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

      {/* Loading Animation */}
      {isMapLoading && (
        <div className="absolute inset-0 z-[450] bg-[#090d16]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 pointer-events-none transition-opacity duration-300">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse shadow-lg">
            <Compass size={28} className="animate-spin" />
          </div>
          <span className="text-xs font-bold text-white tracking-wider">
            LOADING MAP TILES...
          </span>
        </div>
      )}

      {/* Top Banner: Real Navigation or Demo Status */}
      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-[400] flex items-center gap-2 max-w-[calc(100%-110px)]">
        <div className="glass-panel px-2.5 py-1 rounded-xl border border-slate-700/80 bg-slate-900/90 text-[11px] sm:text-xs font-semibold text-slate-200 flex items-center gap-1.5 sm:gap-2 shadow-lg backdrop-blur-md truncate">
          <span className={`w-2 h-2 rounded-full ${isReal ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse shrink-0`} />
          <span className="font-mono text-cyan-400 font-bold shrink-0">SMARTROUTE</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-300 truncate">
            {originLocation && destinationLocation
              ? `${originLocation.name.split(',')[0]} → ${destinationLocation.name.split(',')[0]}`
              : 'Highway Navigation'}
          </span>
          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${
            isReal
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            {isReal ? 'REAL NAVIGATION' : 'DEMO CORRIDOR'}
          </span>
        </div>
      </div>

      {/* Active Navigation HUD */}
      {isNavigating && (
        <div className="absolute top-12 left-2.5 right-2.5 sm:left-auto sm:right-3 sm:top-14 sm:w-96 z-[420] glass-panel-elevated bg-slate-950/95 border border-cyan-400/50 p-3.5 rounded-2xl shadow-2xl space-y-2.5 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 font-mono">
                NAVIGATING TO
              </span>
            </div>
            {onStopNavigation && (
              <button
                onClick={onStopNavigation}
                className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold transition-colors"
              >
                END
              </button>
            )}
          </div>

          <div className="text-sm font-black text-white truncate">
            {destinationLocation?.name || 'Destination'}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">ETA</span>
              <span className="font-extrabold text-white font-mono text-sm">
                {selectedRoute?.estimatedDurationMin || 98} min
              </span>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">DISTANCE</span>
              <span className="font-extrabold text-cyan-300 font-mono text-sm">
                {selectedRoute?.distanceKm || 114.5} km
              </span>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">TRAFFIC</span>
              <span className="font-extrabold text-emerald-400 font-mono text-sm">
                {selectedRoute?.trafficLevel || 'LOW'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-800/40 text-xs text-cyan-200">
            <Compass size={16} className="shrink-0 text-cyan-400 animate-spin-slow" />
            <span className="font-medium truncate">
              {navDetails?.stepText || 'Follow national highway corridor'}
            </span>
          </div>
        </div>
      )}

      {/* Map Controls (Top-Right): 7 Action Buttons */}
      <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-[400] flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* 📍 My Location */}
          <button
            onClick={handleCenterOnUser}
            title="Center on Origin / My Location"
            className="px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 backdrop-blur-md bg-cyan-500/10 text-cyan-300 border-cyan-400/40 hover:bg-cyan-500/20 active:scale-95 shadow-sm"
          >
            <span>📍</span>
            <span className="hidden sm:inline">My Location</span>
          </button>

          {/* 🚦 Signals */}
          <button
            onClick={() => toggleLayer('signals')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 backdrop-blur-md active:scale-95 ${
              visibleLayers.signals
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-sm font-bold'
                : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:text-slate-200'
            }`}
          >
            <span>🚦</span>
            <span className="hidden md:inline">Signals</span>
          </button>

          {/* 🚧 Construction */}
          <button
            onClick={() => toggleLayer('construction')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 backdrop-blur-md active:scale-95 ${
              visibleLayers.construction
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-sm font-bold'
                : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:text-slate-200'
            }`}
          >
            <span>🚧</span>
            <span className="hidden md:inline">Construction</span>
          </button>

          {/* ⚠️ Incidents */}
          <button
            onClick={() => toggleLayer('incidents')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 backdrop-blur-md active:scale-95 ${
              visibleLayers.incidents
                ? 'bg-rose-500/20 text-rose-300 border-rose-400/50 shadow-sm font-bold'
                : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:text-slate-200'
            }`}
          >
            <span>⚠️</span>
            <span className="hidden md:inline">Incidents</span>
          </button>

          {/* 🛣️ Tolls */}
          <button
            onClick={() => toggleLayer('tolls')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 backdrop-blur-md active:scale-95 ${
              visibleLayers.tolls
                ? 'bg-indigo-500/25 text-indigo-300 border-indigo-400/50 shadow-sm font-bold'
                : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:text-slate-200'
            }`}
          >
            <span>🛣️</span>
            <span className="hidden md:inline">Tolls</span>
          </button>

          {/* 🚗 Traffic */}
          <button
            onClick={() => toggleLayer('traffic')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 backdrop-blur-md active:scale-95 ${
              visibleLayers.traffic
                ? 'bg-teal-500/20 text-teal-300 border-teal-400/50 shadow-sm font-bold'
                : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:text-slate-200'
            }`}
          >
            <span>🚗</span>
            <span className="hidden md:inline">Traffic</span>
          </button>

          {/* 🗺️ Routes */}
          <button
            onClick={() => toggleLayer('routes')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 backdrop-blur-md active:scale-95 ${
              visibleLayers.routes
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm font-bold'
                : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:text-slate-200'
            }`}
          >
            <span>🗺️</span>
            <span className="hidden md:inline">Routes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
