import React from 'react';
import { AlertTriangle, Clock, MapPin, ArrowUpRight } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters.js';

export default function IncidentSection({ incidents = [], onFocusIncident }) {
  // Canonical data matching Section 20
  const defaultIncidents = [
    {
      id: 'INC-01',
      type: 'Accident',
      location: 'Central Junction',
      impact: 'HIGH IMPACT',
      timeAgo: '3 min ago',
      coord: [12.9660, 77.6180]
    },
    {
      id: 'INC-02',
      type: 'Road Obstruction',
      location: 'Metro Road',
      impact: 'MODERATE',
      timeAgo: '8 min ago',
      coord: [12.9560, 77.6120]
    },
    {
      id: 'INC-03',
      type: 'Vehicle Breakdown',
      location: 'Tech Park Road',
      impact: 'LOW',
      timeAgo: '12 min ago',
      coord: [12.9460, 77.6210]
    }
  ];

  const items = incidents.length > 0 ? incidents.slice(0, 3).map((inc, i) => ({
    id: inc.id || `INC-0${i + 1}`,
    type: inc.type || defaultIncidents[i]?.type,
    location: inc.location || defaultIncidents[i]?.location,
    impact: inc.severity?.toUpperCase().includes('HIGH') || inc.trafficImpact?.toUpperCase().includes('SEVERE')
      ? 'HIGH IMPACT'
      : inc.severity || defaultIncidents[i]?.impact,
    timeAgo: inc.reportedAt ? formatTimeAgo(inc.reportedAt) : defaultIncidents[i]?.timeAgo,
    coord: [inc.latitude || defaultIncidents[i]?.coord[0], inc.longitude || defaultIncidents[i]?.coord[1]]
  })) : defaultIncidents;

  const getImpactBadge = (impact) => {
    switch (impact?.toUpperCase()) {
      case 'HIGH IMPACT':
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'MODERATE':
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span>⚠</span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">
              ACTIVE INCIDENTS
            </h3>
            <p className="text-[11px] text-slate-400">
              Live traffic events and hazards — tap any card to locate on map
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 3 Incident Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onFocusIncident && onFocusIncident(item.coord)}
            className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800/80 hover:border-rose-500/50 transition-all duration-200 bg-slate-950/70 shadow-lg flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 active:scale-98"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                  {item.type}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getImpactBadge(
                    item.impact
                  )}`}
                >
                  {item.impact}
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-300">
                <MapPin size={13} className="text-slate-500 shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock size={11} />
                <span>{item.timeAgo}</span>
              </span>

              <span className="text-rose-400 font-semibold text-[11px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Focus on Map <ArrowUpRight size={11} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
