import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Car, Gauge, Ban } from 'lucide-react';
import { cardHover } from '../animations/variants.js';
import { getTrafficLevelColor } from '../utils/formatters.js';

export default function TrafficCard({ road, onSelect }) {
  const trafficColor = getTrafficLevelColor(road.trafficLevel);

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      onClick={() => onSelect && onSelect(road)}
      className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{road.name}</h4>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${trafficColor.badge}`}>
            {road.isClosed ? 'CLOSED' : road.trafficLevel}
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-400 font-mono">
          Length: {road.lengthKm} km • Corridor {road.id}
        </p>

        {/* Progress Congestion Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-slate-400">Queue Distance</span>
            <span className="font-mono text-amber-300 font-bold">{road.queueLength} m</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                road.isClosed
                  ? 'bg-slate-600'
                  : road.trafficLevel === 'SEVERE'
                  ? 'bg-rose-500'
                  : road.trafficLevel === 'HIGH'
                  ? 'bg-orange-500'
                  : road.trafficLevel === 'MODERATE'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (road.queueLength / 220) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Car size={13} className="text-cyan-400" />
          <span><b>{road.vehicleUnits}</b> units</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300 justify-end">
          <Gauge size={13} className="text-blue-400" />
          <span><b>{road.currentSpeed}</b> km/h</span>
        </div>
      </div>
    </motion.div>
  );
}
