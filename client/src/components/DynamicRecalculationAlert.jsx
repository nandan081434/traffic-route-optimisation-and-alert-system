import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Compass, CheckCircle2, ArrowRight, X } from 'lucide-react';

export default function DynamicRecalculationAlert({
  showAlert = false,
  previousEta = 31,
  currentEta = 39,
  alternateEta = 30,
  potentialSaving = 9,
  incidentText = 'Accident detected ahead on Central Expressway.',
  isSearchingAlt = false,
  onSwitchRoute,
  onDismiss
}) {
  if (!showAlert) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.98 }}
        className="w-full glass-panel-elevated p-4 sm:p-5 rounded-2xl border-2 border-amber-500/80 bg-gradient-to-r from-amber-950/90 via-slate-950/95 to-slate-900/90 shadow-2xl relative overflow-hidden"
      >
        {/* Soft background pulse */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            {/* Header Tag */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500/25 text-amber-300 border border-amber-500/50 flex items-center gap-1.5 font-mono shadow-sm animate-pulse">
                <AlertTriangle size={12} className="text-amber-400" />
                ⚠️ ROUTE CONDITION CHANGED
              </span>
              <span className="text-xs text-rose-300 font-bold font-mono">
                +{currentEta - previousEta} min delay
              </span>
            </div>

            {/* Description */}
            <p className="text-sm font-bold text-white">
              {incidentText}
            </p>

            {/* ETA Comparison */}
            <div className="flex items-center gap-4 text-xs font-mono text-slate-300 flex-wrap">
              <div>
                <span className="text-slate-400">Previous ETA: </span>
                <span className="text-slate-200 line-through">{previousEta} min</span>
              </div>
              <ArrowRight size={13} className="text-slate-500" />
              <div>
                <span className="text-slate-400">Current ETA: </span>
                <span className="text-rose-400 font-bold">{currentEta} min</span>
              </div>
            </div>

            {/* Alternative finding status */}
            {isSearchingAlt ? (
              <div className="flex items-center gap-2 text-xs text-cyan-300 pt-1">
                <Compass size={14} className="animate-spin text-cyan-400" />
                <span>SmartRoute is calculating an alternative...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium pt-1">
                <CheckCircle2 size={15} className="text-emerald-400 stroke-[2.5]" />
                <span>
                  <b>✓ ALTERNATIVE ROUTE FOUND:</b> Estimated time: <b>{alternateEta} min</b> (Potential saving: <b>{potentialSaving} min</b>)
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:self-center shrink-0">
            {!isSearchingAlt && onSwitchRoute && (
              <button
                onClick={onSwitchRoute}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-400/50 shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span>SWITCH ROUTE</span>
                <ArrowRight size={14} />
              </button>
            )}

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
                aria-label="Dismiss alert"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
