import React from 'react';
import { Construction, MapPin, ArrowUpRight } from 'lucide-react';

export default function ConstructionSection({ construction = [], onViewOnMap }) {
  // Canonical data matching Section 19
  const defaultConstruction = [
    {
      id: 'CONST-01',
      road: 'MG Road',
      description: 'Lane partially blocked',
      impact: 'HIGH',
      coord: [12.9730, 77.6150]
    },
    {
      id: 'CONST-02',
      road: 'Innovation Road',
      description: 'One lane closed',
      impact: 'MODERATE',
      coord: [12.9400, 77.5950]
    },
    {
      id: 'CONST-03',
      road: 'Airport Road',
      description: 'Maintenance work',
      impact: 'LOW',
      coord: [12.9560, 77.6120]
    }
  ];

  const items = construction.length > 0 ? construction.slice(0, 3).map((c, i) => ({
    id: c.id || `CONST-${i + 1}`,
    road: c.road || defaultConstruction[i]?.road,
    description: c.location || c.description || defaultConstruction[i]?.description,
    impact: c.trafficImpact || defaultConstruction[i]?.impact,
    coord: [c.latitude || defaultConstruction[i]?.coord[0], c.longitude || defaultConstruction[i]?.coord[1]]
  })) : defaultConstruction;

  const getImpactBadge = (impact) => {
    switch (impact?.toUpperCase()) {
      case 'HIGH':
      case 'SEVERE':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'MODERATE':
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span>🚧</span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">
              ROAD CONSTRUCTION
            </h3>
            <p className="text-[11px] text-slate-400">
              Active civil works and lane closures impacting network throughput
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800/80 hover:border-amber-500/40 transition-all duration-200 bg-slate-950/70 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {item.id}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getImpactBadge(
                    item.impact
                  )}`}
                >
                  Impact: {item.impact}
                </span>
              </div>

              <h4 className="mt-2.5 text-sm sm:text-base font-bold text-white">
                {item.road}
              </h4>
              <p className="mt-1 text-xs text-slate-400">
                {item.description}
              </p>
            </div>

            {/* View on Map Button (Section 19) */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Active Workzone</span>
              <button
                type="button"
                onClick={() => onViewOnMap && onViewOnMap(item.coord)}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all duration-200 flex items-center gap-1 hover:-translate-y-0.5 active:scale-95"
              >
                <span>View on Map</span>
                <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
