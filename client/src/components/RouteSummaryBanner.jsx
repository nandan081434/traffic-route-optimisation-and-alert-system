import React from 'react';
import { Navigation, Sparkles, Check, Layers, AlertTriangle } from 'lucide-react';
import { formatDistance, formatDuration } from '../utils/formatters.js';

export default function RouteSummaryBanner({
  route,
  savedMinutes = 17,
  isNavigating = false,
  onStartNavigation,
  onStopNavigation,
  onViewAllRoutes
}) {
  const displayDistance = route ? formatDistance(route.distanceKm) : '14.1 km';
  const displayDuration = route ? formatDuration(route.estimatedDurationMin) : '27 min';
  const displayTraffic = route?.trafficLevel
    ? `${route.trafficLevel.charAt(0).toUpperCase() + route.trafficLevel.slice(1).toLowerCase()} Traffic`
    : 'Low Traffic';

  return (
    <div className="w-full glass-panel-elevated p-4 sm:p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-cyan-950/40 shadow-xl relative overflow-hidden">
      {/* Decorative soft glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10">
        {/* Left Side: Route Title, Metrics & Saved Time */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm font-mono">
              <Sparkles size={11} className="text-emerald-400" />
              SMARTROUTE RECOMMENDATION
            </span>
            <span className="text-xs text-slate-300 font-semibold font-mono">
              {route?.code || 'Route B'} • {route?.name || 'Express Bypass Corridor'}
            </span>
          </div>

          {/* Primary stats */}
          <div className="flex items-baseline gap-3 sm:gap-6 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                {displayDistance}
              </span>
              <span className="text-xs text-slate-400 uppercase font-semibold">Distance</span>
            </div>

            <div className="hidden xs:block w-px h-6 bg-slate-700/60 self-center" />

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-300 tracking-tight">
                {displayDuration}
              </span>
              <span className="text-xs text-slate-400 uppercase font-semibold">ETA</span>
            </div>

            <div className="hidden xs:block w-px h-6 bg-slate-700/60 self-center" />

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              <span className="text-sm sm:text-base font-bold text-slate-200">
                {displayTraffic}
              </span>
            </div>
          </div>

          {/* Route Highlights & Savings */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px]">
                ✓
              </span>
              <span>
                <b>{savedMinutes || 17} min saved</b> vs congested route
              </span>
            </div>

            {route?.trafficLights !== undefined && (
              <span className="text-slate-400 font-mono text-[11px]">
                🚦 {route.trafficLights} Signals
              </span>
            )}
            {route?.tollCost !== undefined && (
              <span className="text-slate-400 font-mono text-[11px]">
                🛣️ {route.tollCost > 0 ? `₹${route.tollCost} Toll` : '₹0 Toll'}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          {isNavigating ? (
            <button
              onClick={onStopNavigation}
              className="flex-1 sm:flex-none px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg bg-rose-500 hover:bg-rose-400 text-slate-950 border border-rose-400/40 shadow-rose-500/20 active:scale-95"
            >
              <span>END NAVIGATION</span>
            </button>
          ) : (
            <button
              onClick={() => onStartNavigation && onStartNavigation(route)}
              className="flex-1 sm:flex-none px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-300/40 shadow-cyan-500/20 active:scale-95"
            >
              <Navigation size={16} />
              <span>START NAVIGATION</span>
            </button>
          )}

          <button
            onClick={onViewAllRoutes}
            className="flex-1 sm:flex-none px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 shadow-md"
          >
            <Layers size={15} className="text-cyan-400" />
            <span>COMPARE ROUTES</span>
          </button>
        </div>
      </div>
    </div>
  );
}
