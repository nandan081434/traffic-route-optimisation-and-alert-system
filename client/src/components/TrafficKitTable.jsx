import React from 'react';
import { Radio, ArrowRight, Activity, Clock, ShieldCheck } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters.js';

export default function TrafficKitTable({ kits = [], onSendMockTelemetry, onSelectKit }) {
  // Canonical fallback kits if not loaded yet
  const defaultKits = [
    {
      id: 'TS-001',
      location: 'Central Junction',
      vehicleUnits: 24,
      queueLength: 180,
      averageSpeed: 6,
      signalStatus: 'RED',
      trafficLevel: 'HIGH',
      status: 'ONLINE',
      latitude: 12.9650,
      longitude: 77.6200
    },
    {
      id: 'TS-002',
      location: 'North Gate Entrance',
      vehicleUnits: 8,
      queueLength: 30,
      averageSpeed: 42,
      signalStatus: 'GREEN',
      trafficLevel: 'LOW',
      status: 'ONLINE',
      latitude: 12.9760,
      longitude: 77.5920
    },
    {
      id: 'TS-003',
      location: 'East Corridor Flyover',
      vehicleUnits: 22,
      queueLength: 115,
      averageSpeed: 18,
      signalStatus: 'RED',
      trafficLevel: 'HIGH',
      status: 'ONLINE',
      latitude: 12.9560,
      longitude: 77.6120
    },
    {
      id: 'TS-004',
      location: 'Bypass South Junction',
      vehicleUnits: 14,
      queueLength: 70,
      averageSpeed: 24,
      signalStatus: 'GREEN',
      trafficLevel: 'LOW',
      status: 'ONLINE',
      latitude: 12.9400,
      longitude: 77.5950
    }
  ];

  const displayKits = kits.length > 0 ? kits.slice(0, 6) : defaultKits;

  const getTrafficLevelBadge = (level) => {
    switch (level?.toUpperCase()) {
      case 'SEVERE':
      case 'HIGH':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'MODERATE':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'ONLINE') {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Radio size={16} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">
              TRAFFIC MONITORING KITS
            </h3>
            <p className="text-[11px] text-slate-400">
              Roadside IoT sensors transmitting discrete vehicle units and queue measurements
            </p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/90 glass-panel bg-slate-950/70 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">Kit ID</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Vehicles</th>
                <th className="py-3 px-4">Queue</th>
                <th className="py-3 px-4">Avg Speed</th>
                <th className="py-3 px-4">Signal</th>
                <th className="py-3 px-4">Traffic</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {displayKits.map((kit) => (
                <tr
                  key={kit.id}
                  onClick={() => onSelectKit && onSelectKit(kit)}
                  className="hover:bg-slate-900/50 transition-colors text-slate-300 cursor-pointer group"
                >
                  {/* Kit ID */}
                  <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30">
                      {kit.id}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 text-white font-medium group-hover:text-cyan-200 transition-colors">
                    {kit.location}
                  </td>

                  {/* Vehicles */}
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-white text-xs">{kit.vehicleUnits}</span>{' '}
                    <span className="text-[10px] text-slate-400">units</span>
                  </td>

                  {/* Queue */}
                  <td className="py-3 px-4 font-mono text-amber-300 font-semibold">
                    {kit.queueLength} m
                  </td>

                  {/* Speed */}
                  <td className="py-3 px-4 font-mono text-slate-200">
                    {kit.averageSpeed} km/h
                  </td>

                  {/* Signal */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        kit.signalStatus === 'RED'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : kit.signalStatus === 'GREEN'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        kit.signalStatus === 'RED' ? 'bg-rose-400' : kit.signalStatus === 'GREEN' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`} />
                      <span>{kit.signalStatus}</span>
                    </span>
                  </td>

                  {/* Traffic Level */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTrafficLevelBadge(
                        kit.trafficLevel
                      )}`}
                    >
                      {kit.trafficLevel}
                    </span>
                  </td>

                  {/* Online/Offline Status */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${getStatusBadge(
                        kit.status
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{kit.status || 'ONLINE'}</span>
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
