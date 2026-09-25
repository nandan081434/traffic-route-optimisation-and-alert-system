import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Gauge, Clock, ArrowRight, Activity, Car, ChevronDown, ChevronUp } from 'lucide-react';
import { cardHover } from '../animations/variants.js';
import { formatTimeAgo, getTrafficLevelColor } from '../utils/formatters.js';

export default function TrafficKitCard({ kit, onSelect, onSendMockTelemetry }) {
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);
  const trafficColor = getTrafficLevelColor(kit.trafficLevel);

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      className="glass-panel p-3.5 sm:p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between relative group shadow-lg shadow-black/20"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Radio size={15} />
            </span>
            <div className="min-w-0">
              <span className="text-[11px] font-mono font-bold text-cyan-400 block leading-none">{kit.id}</span>
              <h4 className="text-xs sm:text-sm font-bold text-white leading-tight truncate">{kit.name}</h4>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border ${
                kit.status === 'ONLINE'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              {kit.status}
            </span>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border ${trafficColor.badge}`}>
              {kit.trafficLevel}
            </span>
          </div>
        </div>

        <p className="mt-1.5 text-[11px] sm:text-xs text-slate-400 truncate">{kit.location}</p>

        {/* Mobile Compact Overview Bar */}
        <div className="md:hidden mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[9px] text-slate-500 block">Vehicles</span>
              <span className="font-bold text-white font-mono">{kit.vehicleUnits} units</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">Queue</span>
              <span className="font-bold text-amber-300 font-mono">{kit.queueLength}m</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpandedMobile(!isExpandedMobile)}
            className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium py-1 px-2 rounded-lg bg-cyan-500/10"
          >
            <span>{isExpandedMobile ? 'Less' : 'Details'}</span>
            {isExpandedMobile ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Detailed Metrics Grid (Always visible on desktop, collapsible on mobile) */}
        <div className={`${isExpandedMobile ? 'block' : 'hidden'} md:block mt-3 md:mt-4 space-y-2`}>
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {/* Vehicle Units (1 vehicle = 1 unit rule) */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs">
                <span>Vehicle Units</span>
                <Car size={13} className="text-cyan-400" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-bold font-mono text-white">{kit.vehicleUnits}</span>
                <span className="text-[10px] text-slate-500">units</span>
              </div>
              <span className="text-[9px] text-slate-500 block mt-0.5">1 veh = 1 unit</span>
            </div>

            {/* Queue Length */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs">
                <span>Queue Length</span>
                <Activity size={13} className="text-amber-400" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-bold font-mono text-amber-300">{kit.queueLength}</span>
                <span className="text-[10px] text-slate-500">meters</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    kit.queueLength > 150 ? 'bg-rose-500' : kit.queueLength > 80 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, (kit.queueLength / 220) * 100)}%` }}
                />
              </div>
            </div>

            {/* Average Speed */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs">
                <span>Avg Speed</span>
                <Gauge size={13} className="text-blue-400" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-bold font-mono text-white">{kit.averageSpeed}</span>
                <span className="text-[10px] text-slate-500">km/h</span>
              </div>
            </div>

            {/* Waiting Time & Signal */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs">
                <span>Wait / Signal</span>
                <Clock size={13} className="text-purple-400" />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-lg sm:text-xl font-bold font-mono text-white">{kit.waitingTime}s</span>
                <span
                  className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    kit.signalStatus === 'RED'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : kit.signalStatus === 'GREEN'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {kit.signalStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Telemetry timestamp & Action */}
      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-[10px] sm:text-[11px] text-slate-500 truncate">
          {formatTimeAgo(kit.lastUpdated)}
        </span>
        {onSendMockTelemetry && (
          <button
            onClick={() => onSendMockTelemetry(kit)}
            className="text-[10px] sm:text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors shrink-0"
          >
            IoT Packet <ArrowRight size={10} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
