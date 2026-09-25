import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  LocateFixed,
  Loader2,
  ArrowUpDown,
  Sparkles,
  Check,
  AlertCircle,
  Compass,
  X
} from 'lucide-react';
import { geocodingService } from '../services/geocodingService.js';
import { geolocationService, GeolocationStatus } from '../services/geolocationService.js';
import { realPlacesDirectory } from '../data/fallbackData.js';

export default function DestinationSearchCard({
  currentOrigin = null,
  currentDestination = null,
  onOriginChange,
  onDestinationChange,
  onCalculateRoute,
  isCalculating = false
}) {
  const [originQuery, setOriginQuery] = useState(currentOrigin?.name || '');
  const [destQuery, setDestQuery] = useState(currentDestination?.name || '');

  const [originResults, setOriginResults] = useState([]);
  const [destResults, setDestResults] = useState([]);

  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const originSearchTimeoutRef = useRef(null);
  const destSearchTimeoutRef = useRef(null);
  const originDropdownRef = useRef(null);
  const destDropdownRef = useRef(null);

  // Sync external origin/destination when updated
  useEffect(() => {
    if (currentOrigin?.name && currentOrigin.name !== originQuery) {
      setOriginQuery(currentOrigin.name);
    }
  }, [currentOrigin]);

  useEffect(() => {
    if (currentDestination?.name && currentDestination.name !== destQuery) {
      setDestQuery(currentDestination.name);
    }
  }, [currentDestination]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (originDropdownRef.current && !originDropdownRef.current.contains(event.target)) {
        setShowOriginDropdown(false);
      }
      if (destDropdownRef.current && !destDropdownRef.current.contains(event.target)) {
        setShowDestDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Origin input changes
  const handleOriginInputChange = (text) => {
    setOriginQuery(text);
    setShowOriginDropdown(true);

    if (originSearchTimeoutRef.current) clearTimeout(originSearchTimeoutRef.current);
    originSearchTimeoutRef.current = setTimeout(async () => {
      if (text.trim().length > 1) {
        const results = await geocodingService.searchPlaces(text);
        setOriginResults(results);
      } else {
        setOriginResults(realPlacesDirectory.slice(0, 5));
      }
    }, 200);
  };

  // Handle Destination input changes
  const handleDestInputChange = (text) => {
    setDestQuery(text);
    setShowDestDropdown(true);

    if (destSearchTimeoutRef.current) clearTimeout(destSearchTimeoutRef.current);
    destSearchTimeoutRef.current = setTimeout(async () => {
      if (text.trim().length > 1) {
        const results = await geocodingService.searchPlaces(text);
        setDestResults(results);
      } else {
        setDestResults(realPlacesDirectory.slice(0, 5));
      }
    }, 200);
  };

  // Select an Origin from dropdown
  const handleSelectOrigin = (place) => {
    setOriginQuery(place.name);
    setShowOriginDropdown(false);

    const loc = {
      name: place.name,
      address: place.address || place.name,
      latitude: place.latitude,
      longitude: place.longitude,
      isReal: true
    };

    if (onOriginChange) {
      onOriginChange(loc);
    }
  };

  // Select a Destination from dropdown
  const handleSelectDestination = (place) => {
    setDestQuery(place.name);
    setShowDestDropdown(false);

    const loc = {
      name: place.name,
      address: place.address || place.name,
      latitude: place.latitude,
      longitude: place.longitude,
      isReal: true
    };

    if (onDestinationChange) {
      onDestinationChange(loc);
    }
  };

  // Browser Geolocation: "Use My Location" (Section 1)
  const handleUseMyLocation = async () => {
    setIsLocating(true);
    setStatusMsg({ type: 'info', text: 'Requesting GPS coordinates...' });

    const result = await geolocationService.getCurrentPosition();

    if (result.status === GeolocationStatus.GRANTED) {
      // Reverse geocode for clean readable name
      const readable = await geocodingService.reverseGeocode(
        result.location.latitude,
        result.location.longitude
      );

      const locObject = {
        name: readable.name || 'My Current Location',
        address: readable.address || `GPS: ${result.location.latitude.toFixed(4)}, ${result.location.longitude.toFixed(4)}`,
        latitude: result.location.latitude,
        longitude: result.location.longitude,
        accuracy: result.location.accuracy,
        isCurrentLocation: true,
        isReal: true
      };

      setOriginQuery(locObject.name);
      if (onOriginChange) {
        onOriginChange(locObject);
      }
      setStatusMsg({ type: 'success', text: `GPS location acquired (±${Math.round(result.location.accuracy || 15)}m)` });
    } else {
      setStatusMsg({
        type: 'warning',
        text: 'Location permission was denied. Please enter your starting location manually.'
      });
    }

    setIsLocating(false);
    setTimeout(() => setStatusMsg(null), 5000);
  };

  // Swap Origin and Destination
  const handleSwapLocations = () => {
    const tempOriginQuery = originQuery;
    const tempOrigin = currentOrigin;

    setOriginQuery(destQuery);
    setDestQuery(tempOriginQuery);

    if (currentDestination && onOriginChange) {
      onOriginChange(currentDestination);
    }
    if (tempOrigin && onDestinationChange) {
      onDestinationChange(tempOrigin);
    }
  };

  // Handle Form Submit: Geocode both inputs if needed & trigger route calculation
  const handleSubmit = async (e) => {
    e.preventDefault();

    let resolvedOrigin = currentOrigin;
    let resolvedDest = currentDestination;

    setIsGeocoding(true);
    setStatusMsg(null);

    // 1. Resolve Origin
    try {
      if (!resolvedOrigin || resolvedOrigin.name !== originQuery || !resolvedOrigin.latitude) {
        resolvedOrigin = await geocodingService.geocode(originQuery);
        if (onOriginChange) onOriginChange(resolvedOrigin);
      }
    } catch {
      setStatusMsg({
        type: 'error',
        text: 'Location not found. Please enter a valid place, area, city, or landmark.'
      });
      setIsGeocoding(false);
      return;
    }

    // 2. Resolve Destination
    try {
      if (!resolvedDest || resolvedDest.name !== destQuery || !resolvedDest.latitude) {
        resolvedDest = await geocodingService.geocode(destQuery);
        if (onDestinationChange) onDestinationChange(resolvedDest);
      }
    } catch {
      setStatusMsg({
        type: 'error',
        text: 'Location not found. Please enter a valid place, area, city, or landmark.'
      });
      setIsGeocoding(false);
      return;
    }

    setIsGeocoding(false);

    // 3. Trigger Route Calculation
    if (onCalculateRoute) {
      try {
        await onCalculateRoute({
          origin: resolvedOrigin,
          destination: resolvedDest
        });
      } catch (err) {
        setStatusMsg({
          type: 'error',
          text: 'Unable to calculate route. Please try again.'
        });
      }
    }
  };

  return (
    <div className="w-full glass-panel-elevated p-4 sm:p-5 rounded-2xl border border-cyan-500/40 bg-slate-950/90 shadow-2xl relative">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Compass size={14} />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
              SMART NAVIGATION PLANNER
            </h3>
            <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
              REAL LOCATION ENGINE
            </span>
          </div>

          {/* Quick status message */}
          {statusMsg && (
            <div
              className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border flex items-center gap-1.5 animate-fade-in ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : statusMsg.type === 'warning'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : statusMsg.type === 'error'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}
            >
              <span>{statusMsg.text}</span>
              <button
                type="button"
                onClick={() => setStatusMsg(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
          {/* 1. Origin Input ("📍 From") */}
          <div ref={originDropdownRef} className="space-y-1 relative">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <span className="text-cyan-400">📍</span>
                <span>From</span>
              </label>

              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="text-cyan-400 hover:text-cyan-300 text-[10px] font-bold flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all active:scale-95"
                title="Detect current location with GPS"
              >
                {isLocating ? (
                  <>
                    <Loader2 size={11} className="animate-spin" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <LocateFixed size={11} />
                    <span>Use My Location</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={originQuery}
                onChange={(e) => handleOriginInputChange(e.target.value)}
                onFocus={() => {
                  if (originResults.length === 0) setOriginResults(realPlacesDirectory.slice(0, 5));
                  setShowOriginDropdown(true);
                }}
                placeholder="Starting city, town, or address (e.g. Kamareddy)..."
                className="w-full pl-3 pr-8 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Search size={14} />
              </span>
            </div>

            {/* Origin Autocomplete Dropdown */}
            {showOriginDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 glass-panel-elevated bg-slate-950/98 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-800/60">
                <div className="px-3 py-1.5 bg-slate-900 text-[10px] font-bold text-slate-400 font-mono flex items-center justify-between">
                  <span>SELECT ORIGIN</span>
                  <span>Click to select & center map</span>
                </div>
                {(originResults.length > 0 ? originResults : realPlacesDirectory.slice(0, 5)).map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => handleSelectOrigin(place)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-900/90 transition-colors flex items-start gap-2.5 group"
                  >
                    <MapPin size={13} className="text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {place.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {place.address}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button (between origin and destination) */}
          <button
            type="button"
            onClick={handleSwapLocations}
            className="hidden md:flex absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 shadow-md items-center justify-center transition-all active:scale-90"
            title="Swap locations"
            aria-label="Swap origin and destination"
          >
            <ArrowUpDown size={14} />
          </button>

          {/* 2. Destination Input ("🎯 Where do you want to go?") */}
          <div ref={destDropdownRef} className="space-y-1 relative">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <span className="text-emerald-400">🎯</span>
                <span>Where do you want to go?</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Destination</span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={destQuery}
                onChange={(e) => handleDestInputChange(e.target.value)}
                onFocus={() => {
                  if (destResults.length === 0) setDestResults(realPlacesDirectory.slice(0, 5));
                  setShowDestDropdown(true);
                }}
                placeholder="Destination city, landmark, or address (e.g. Hyderabad)..."
                className="w-full pl-3 pr-8 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-medium transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Search size={14} />
              </span>
            </div>

            {/* Destination Autocomplete Dropdown */}
            {showDestDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 glass-panel-elevated bg-slate-950/98 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-800/60">
                <div className="px-3 py-1.5 bg-slate-900 text-[10px] font-bold text-slate-400 font-mono flex items-center justify-between">
                  <span>SELECT DESTINATION</span>
                  <span>Click to select</span>
                </div>
                {(destResults.length > 0 ? destResults : realPlacesDirectory.slice(0, 5)).map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => handleSelectDestination(place)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-900/90 transition-colors flex items-start gap-2.5 group"
                  >
                    <MapPin size={13} className="text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                        {place.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {place.address}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Real OpenStreetMap Geocoding & Driving Polyline Routing</span>
          </div>

          <button
            type="submit"
            disabled={isCalculating || isGeocoding}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isCalculating || isGeocoding ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{isGeocoding ? 'GEOCODING LOCATIONS...' : 'CALCULATING REAL ROUTE...'}</span>
              </>
            ) : (
              <>
                <Navigation size={15} />
                <span>FIND BEST ROUTE</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
