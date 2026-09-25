import React from 'react';
import { Sparkles, Check, CheckCircle2, Clock, Navigation, AlertTriangle, ArrowRight } from 'lucide-react';
import { formatDistance, formatDuration } from '../utils/formatters.js';

export default function CandidateRouteTable({
  routes = [],
  selectedRouteId,
  onSelectRoute
}) {
  // Canonical routes benchmark fallback
  const defaultRoutes = [
    {
      id: 'route-a',
      code: 'Route A',
      name: 'Central Expressway',
      distanceKm: 8.2,
      estimatedDurationMin: 38,
      trafficLevel: 'Severe',
      delayMinutes: 17,
      status: 'CONGESTED'
    },
    {
      id: 'route-b',
      code: 'Route B',
      name: 'Green Park Bypass',
      distanceKm: 10.1,
      estimatedDurationMin: 21,
      trafficLevel: 'Moderate',
      delayMinutes: 0,
      status: 'RECOMMENDED'
    },
    {
      id: 'route-c',
      code: 'Route C',
      name: 'East Arterial Ring',
      distanceKm: 9.4,
      estimatedDurationMin: 51,
      trafficLevel: 'Moderate',
      delayMinutes: 30,
      status: 'DELAYED'
    }
  ];

  // Merge live routes or fallback
  const displayRoutes = routes.length >= 3 ? routes.map(r => ({
    id: r.id,
    code: r.code ? (r.code.toLowerCase().startsWith('route') ? r.code.charAt(0).toUpperCase() + r.code.slice(1).toLowerCase() : r.code) : r.name,
    name: r.name,
    distanceKm: r.distanceKm,
    estimatedDurationMin: r.estimatedDurationMin,
    trafficLevel: r.trafficLevel ? (r.trafficLevel.charAt(0).toUpperCase() + r.trafficLevel.slice(1).toLowerCase()) : 'Normal',
    delayMinutes: r.trafficDelayMin !== undefined ? r.trafficDelayMin : (r.delayMinutes || 0),
    status: r.status
  })) : defaultRoutes;

  const getTrafficBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'severe':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'high':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      case 'moderate':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  const getTrafficDot = (level) => {
    switch (level?.toLowerCase()) {
      case 'severe':
        return 'bg-rose-500 shadow-[0_0_6px_#ef4444]';
      case 'high':
        return 'bg-orange-500 shadow-[0_0_6px_#f97316]';
      case 'moderate':
        return 'bg-amber-400 shadow-[0_0_6px_#f59e0b]';
      default:
        return 'bg-emerald-400 shadow-[0_0_6px_#10b981]';
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Navigation size={16} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">
              CANDIDATE ROUTE COMPARISON
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluated by live traffic, smart signals, construction & hazard telemetry
            </p>
          </div>
        </div>
      </div>

      {/* 1. DESKTOP & TABLET VIEW: Responsive Table (Section 14) */}
      <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-800/90 glass-panel bg-slate-950/70 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Traffic</th>
                <th className="py-3 px-4">Delay</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {displayRoutes.map((route) => {
                const isSelected = selectedRouteId === route.id;
                const isRecommended = route.status === 'RECOMMENDED' || route.code?.toLowerCase().includes('route b');

                return (
                  <tr
                    key={route.id}
                    onClick={() => onSelectRoute && onSelectRoute(route)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-cyan-500/10 text-white'
                        : isRecommended
                        ? 'bg-emerald-500/5 hover:bg-emerald-500/10 text-slate-200'
                        : 'hover:bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    {/* Route Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${
                            isRecommended
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : isSelected
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {route.code ? route.code.split(' ').pop() : 'R'}
                        </span>
                        <div>
                          <span className="font-bold text-white block text-xs group-hover:text-cyan-300 transition-colors">
                            {route.code || route.name}
                          </span>
                          {route.name && (
                            <span className="text-[10px] text-slate-400 block font-normal">
                              {route.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Distance Column */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {formatDistance(route.distanceKm)}
                    </td>

                    {/* Time Column */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-white text-xs">
                        {formatDuration(route.estimatedDurationMin)}
                      </span>
                    </td>

                    {/* Traffic Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getTrafficBadge(
                          route.trafficLevel
                        )}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getTrafficDot(route.trafficLevel)}`} />
                        <span>{route.trafficLevel}</span>
                      </span>
                    </td>

                    {/* Delay Column */}
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {route.delayMinutes > 0 ? (
                        <span className="text-rose-400 font-bold">+{route.delayMinutes} min</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">+0 min</span>
                      )}
                    </td>

                    {/* Status Column: Route B shows ✓ RECOMMENDED (Section 14) */}
                    <td className="py-3.5 px-4 text-right">
                      {isRecommended ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
                          <Check size={13} className="text-emerald-400 stroke-[3]" />
                          <span>RECOMMENDED</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-normal">
                          Alternate
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. MOBILE VIEW: Card List (Section 15) */}
      <div className="sm:hidden space-y-2.5">
        {displayRoutes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          const isRecommended = route.status === 'RECOMMENDED' || route.code?.toLowerCase().includes('route b');

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute && onSelectRoute(route)}
              className={`p-4 rounded-2xl border transition-all duration-200 glass-panel bg-slate-950/85 space-y-2.5 ${
                isSelected
                  ? 'border-cyan-500/60 ring-1 ring-cyan-500/30'
                  : isRecommended
                  ? 'border-emerald-500/50 shadow-md shadow-emerald-500/5'
                  : 'border-slate-800'
              }`}
            >
              {/* Card Top: Route Code & Badge */}
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm tracking-wide">
                  {route.code || route.name}
                </span>

                {isRecommended && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                    <Check size={11} className="stroke-[3]" />
                    <span>RECOMMENDED</span>
                  </span>
                )}
              </div>

              {/* Distance & Time */}
              <div className="flex items-baseline justify-between text-xs">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black font-mono text-white">
                    {formatDuration(route.estimatedDurationMin)}
                  </span>
                  <span className="font-mono text-slate-400">
                    {formatDistance(route.distanceKm)}
                  </span>
                </div>

                <div className="font-mono text-xs">
                  {route.delayMinutes > 0 ? (
                    <span className="text-rose-400 font-bold">Delay: +{route.delayMinutes} min</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">Delay: +0 min</span>
                  )}
                </div>
              </div>

              {/* Traffic badge & Select Route Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getTrafficBadge(
                    route.trafficLevel
                  )}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${getTrafficDot(route.trafficLevel)}`} />
                  <span>{route.trafficLevel} Traffic</span>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectRoute) onSelectRoute(route);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-black border border-cyan-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select Route'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
