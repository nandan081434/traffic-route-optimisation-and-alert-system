import React from 'react';
import { Activity, Car, Gauge, Layers, Info } from 'lucide-react';

export default function TrafficCorridorsTable({ networkRoads = [] }) {
  // Section 16 Canonical Corridors
  const defaultCorridors = [
    {
      id: 'corridor-metro',
      corridor: 'Metro Corridor',
      vehicles: 24,
      queue: '180m',
      speed: '6 km/h',
      status: 'HIGH'
    },
    {
      id: 'corridor-central',
      corridor: 'Central Junction',
      vehicles: 12,
      queue: '80m',
      speed: '14 km/h',
      status: 'MODERATE'
    },
    {
      id: 'corridor-tech',
      corridor: 'Tech Park Road',
      vehicles: 31,
      queue: '250m',
      speed: '4 km/h',
      status: 'SEVERE'
    },
    {
      id: 'corridor-airport',
      corridor: 'Airport Road',
      vehicles: 8,
      queue: '40m',
      speed: '28 km/h',
      status: 'LOW'
    }
  ];

  // If live network roads are available, map them or merge
  const corridors = networkRoads.length >= 4 ? networkRoads.slice(0, 4).map((r, idx) => ({
    id: r.id || `road-${idx}`,
    corridor: r.name || defaultCorridors[idx]?.corridor,
    vehicles: r.vehicleUnits !== undefined ? r.vehicleUnits : defaultCorridors[idx]?.vehicles,
    queue: r.queueLength !== undefined ? `${r.queueLength}m` : defaultCorridors[idx]?.queue,
    speed: r.currentSpeed !== undefined ? `${r.currentSpeed} km/h` : defaultCorridors[idx]?.speed,
    status: r.trafficLevel || defaultCorridors[idx]?.status
  })) : defaultCorridors;

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'SEVERE':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      case 'MODERATE':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  const getStatusDot = (status) => {
    switch (status?.toUpperCase()) {
      case 'SEVERE':
        return 'bg-rose-500 shadow-[0_0_6px_#ef4444]';
      case 'HIGH':
        return 'bg-orange-500 shadow-[0_0_6px_#f97316]';
      case 'MODERATE':
        return 'bg-amber-400 shadow-[0_0_6px_#f59e0b]';
      default:
        return 'bg-emerald-400 shadow-[0_0_6px_#10b981]';
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header (Section 25) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity size={16} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">
              TRAFFIC CORRIDORS
            </h3>
            <p className="text-[11px] text-slate-400">
              Live vehicle and queue measurements
            </p>
          </div>
        </div>

        {/* 1 Vehicle = 1 Unit Notice */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[10px] sm:text-[11px] text-cyan-300 self-start sm:self-auto">
          <Car size={12} className="text-cyan-400 shrink-0" />
          <span>Rule: <b>1 vehicle = 1 unit</b> (passengers excluded)</span>
        </div>
      </div>

      {/* Table Card Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/90 glass-panel bg-slate-950/70 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">Corridor</th>
                <th className="py-3 px-4">Vehicles</th>
                <th className="py-3 px-4">Queue</th>
                <th className="py-3 px-4">Speed</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {corridors.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-900/50 transition-colors text-slate-300"
                >
                  {/* Corridor Name */}
                  <td className="py-3 px-4 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{c.corridor}</span>
                    </div>
                  </td>

                  {/* Vehicles (1 vehicle = 1 unit) */}
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-white text-xs">{c.vehicles}</span>{' '}
                    <span className="text-[10px] text-slate-400">units</span>
                  </td>

                  {/* Queue */}
                  <td className="py-3 px-4 font-mono text-amber-300 font-semibold">
                    {c.queue}
                  </td>

                  {/* Speed */}
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {c.speed}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                        c.status
                      )}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(c.status)}`} />
                      <span>{c.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
