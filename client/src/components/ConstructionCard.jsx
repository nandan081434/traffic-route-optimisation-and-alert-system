import React from 'react';
import { motion } from 'framer-motion';
import { Cone, Calendar, AlertCircle } from 'lucide-react';
import { cardHover } from '../animations/variants.js';

export default function ConstructionCard({ construction, onSelect }) {
  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      onClick={() => onSelect && onSelect(construction)}
      className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cone size={16} />
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">{construction.id}</span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase">
            {construction.trafficImpact} Impact
          </span>
        </div>

        <h4 className="mt-2 text-sm font-bold text-white leading-tight">{construction.road}</h4>
        <p className="mt-1 text-xs text-slate-400 truncate">{construction.location}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Affected Distance</span>
            <span className="text-base font-bold font-mono text-white mt-0.5 block">{construction.affectedDistance}m</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Lane Drop</span>
            <span className="text-base font-bold font-mono text-amber-400 mt-0.5 block">
              {construction.lanesBefore} → {construction.lanesAfter} lanes
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 text-[11px]">
          <Calendar size={12} className="text-slate-500" />
          End: {construction.expectedEndDate || 'Ongoing'}
        </span>
        <span className="font-mono text-amber-400 font-bold">
          +{construction.delayMinutes || 6} min
        </span>
      </div>
    </motion.div>
  );
}
