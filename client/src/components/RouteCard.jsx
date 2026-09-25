import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Navigation, CheckCircle, ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';
import { formatDistance, formatDuration, getTrafficLevelColor } from '../utils/formatters.js';

export default function RouteCard({
  route,
  isSelected,
  onSelect,
  explanation = null,
  isRecalculating = false
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  const isRecommended = route.status === 'RECOMMENDED';
  const trafficColor = getTrafficLevelColor(route.trafficLevel);

  return (
    <motion.div
      layout
      onClick={onSelect}
      className={`glass-panel p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
        isRecommended
          ? 'border-emerald-500/50 bg-slate-900/90 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
          : isSelected
          ? 'border-cyan-500/50 bg-slate-900/80 shadow-md ring-1 ring-cyan-500/20'
          : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
      }`}
    >
      {/* Recommended Ribbon */}
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-300 border-b border-l border-emerald-500/30 px-2.5 sm:px-3 py-0.5 rounded-bl-xl text-[9px] sm:text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
          <Sparkles size={11} className="text-emerald-400" />
          Recommended
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 pr-20">
        <span
          className={`px-2 py-0.5 rounded text-xs font-mono font-bold shrink-0 ${
            isRecommended ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
          }`}
        >
          {route.code || route.id.toUpperCase()}
        </span>
        <h4 className="text-xs sm:text-sm font-bold text-white truncate">{route.name}</h4>
      </div>

      {/* Main Metric Stats */}
      <div className="mt-2.5 sm:mt-3 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-black font-mono text-white">
            {formatDuration(route.estimatedDurationMin)}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {formatDistance(route.distanceKm)}
          </span>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border shrink-0 ${trafficColor.badge}`}>
          {trafficColor.label}
        </span>
      </div>

      {/* Delays & Road Events */}
      <div className="mt-2 flex flex-wrap gap-1 items-center text-[10px] sm:text-[11px]">
        {route.trafficDelayMin > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">
            +{route.trafficDelayMin}m traffic
          </span>
        )}
        {route.accidentDelayMin > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">
            +{route.accidentDelayMin}m hazard
          </span>
        )}
        {route.constructionDelayMin > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
            +{route.constructionDelayMin}m work
          </span>
        )}
        {route.events?.map((ev, i) => (
          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 truncate max-w-[150px]">
            {ev}
          </span>
        ))}
      </div>

      {/* "Why this route?" Expandable Section */}
      {isRecommended && explanation && (
        <div className="mt-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowExplanation(!showExplanation);
            }}
            className="w-full flex items-center justify-between text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-1"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle size={13} />
              Why this route?
            </span>
            {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1.5 text-xs space-y-1.5 overflow-hidden bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80"
              >
                {explanation.bullets?.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-slate-300 text-[11px] leading-tight">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
