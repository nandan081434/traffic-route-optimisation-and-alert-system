import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Navigation } from 'lucide-react';
import { cardHover } from '../animations/variants.js';

export default function TrafficSignal({ signal, onSelect }) {
  const isRed = signal.status === 'RED';
  const isYellow = signal.status === 'YELLOW';
  const isGreen = signal.status === 'GREEN';

  const countdown = isRed ? signal.redRemaining : isGreen ? signal.greenRemaining : signal.yellowRemaining;

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      onClick={() => onSelect && onSelect(signal)}
      className="glass-panel p-3.5 sm:p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-2.5 sm:gap-4">
        {/* Signal Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold bg-slate-800 text-cyan-400 border border-slate-700 shrink-0">
              {signal.id}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 truncate">{signal.location}</span>
          </div>
          <h4 className="mt-1.5 sm:mt-2 text-sm sm:text-base font-bold text-white truncate">{signal.name || signal.location}</h4>

          <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
            <div className="p-1.5 sm:p-2 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold block">Vehicles</span>
              <span className="text-xs sm:text-sm font-bold text-white font-mono">{signal.vehiclesWaiting}</span>
              <span className="text-[8px] sm:text-[9px] text-slate-500 block">units</span>
            </div>

            <div className="p-1.5 sm:p-2 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold block">Queue</span>
              <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono">{signal.queueLength}m</span>
              <span className="text-[8px] sm:text-[9px] text-slate-500 block">distance</span>
            </div>

            <div className="p-1.5 sm:p-2 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold block">Avg Wait</span>
              <span className="text-xs sm:text-sm font-bold text-cyan-400 font-mono">{signal.averageWaitingTime}s</span>
              <span className="text-[8px] sm:text-[9px] text-slate-500 block">delay</span>
            </div>
          </div>
        </div>

        {/* Realistic Traffic Light Graphic */}
        <div className="flex flex-col items-center">
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner flex flex-col gap-2.5 items-center">
            {/* Red Light */}
            <div
              className={`w-6 h-6 rounded-full transition-all duration-300 ${
                isRed
                  ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e] border border-rose-300'
                  : 'bg-rose-950/40 border border-rose-900/30 opacity-40'
              }`}
            />
            {/* Yellow Light */}
            <div
              className={`w-6 h-6 rounded-full transition-all duration-300 ${
                isYellow
                  ? 'bg-amber-400 shadow-[0_0_15px_#fbbf24] border border-amber-200'
                  : 'bg-amber-950/40 border border-amber-900/30 opacity-40'
              }`}
            />
            {/* Green Light */}
            <div
              className={`w-6 h-6 rounded-full transition-all duration-300 ${
                isGreen
                  ? 'bg-emerald-500 shadow-[0_0_15px_#10b981] border border-emerald-300'
                  : 'bg-emerald-950/40 border border-emerald-900/30 opacity-40'
              }`}
            />
          </div>

          {/* Countdown timer badge */}
          <div className="mt-2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-mono font-bold text-white flex items-center gap-1">
            <Clock size={11} className="text-slate-400" />
            <span className={isRed ? 'text-rose-400' : isGreen ? 'text-emerald-400' : 'text-amber-400'}>
              {countdown}s
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
