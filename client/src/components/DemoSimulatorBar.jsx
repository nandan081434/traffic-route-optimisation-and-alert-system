import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  Cone,
  Ban,
  Award,
  ChevronRight,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api.js';

export default function DemoSimulatorBar({
  onRefresh,
  presentationMode,
  setPresentationMode,
  savedMinutes = 0
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(true);

  const handleSimulate = async (actionType, apiCall) => {
    try {
      setLoadingAction(true);
      setActiveSimulation(actionType);
      await apiCall();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Simulation trigger failed:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDemoStep = async (step) => {
    try {
      setLoadingAction(true);
      setCurrentStep(step);
      await api.triggerDemoStep(step);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Demo step failed:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const nextDemoStep = () => {
    const next = currentStep >= 8 ? 1 : currentStep + 1;
    handleDemoStep(next);
  };

  const stepsText = [
    "Step 1: Normal baseline flow (Route A 14m)",
    "Step 2: Vehicle surge detected (TS-001: 24→31)",
    "Step 3: Queue length grows (80m→190m)",
    "Step 4: Severe traffic threshold reached",
    "Step 5: Route A delay jumps (14m→38m)",
    "Step 6: Dynamic recalculation engine triggers",
    "Step 7: Route B selected as optimal (21m)",
    "Step 8: 17 Minutes Saved notification!"
  ];

  return (
    <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-2.5 sm:space-y-3">
      {/* Top Demo Bar Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Zap size={16} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide truncate">
                TRAFFIC SIMULATION ENGINE
              </h3>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                PROTOTYPE
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-400">
              Trigger roadside events to observe dynamic route recalculation in real time.
            </p>
          </div>
        </div>

        {/* Mobile Collapse Toggle / Desktop Presentation Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setPresentationMode(!presentationMode)}
            className={`hidden md:flex px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all items-center gap-1.5 border ${
              presentationMode
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Award size={14} className={presentationMode ? 'text-purple-400' : 'text-slate-400'} />
            <span>{presentationMode ? 'Exit Pitch' : 'Pitch Mode'}</span>
          </button>

          {/* Mobile Collapse / Expand button */}
          <button
            onClick={() => setIsMobileCollapsed(!isMobileCollapsed)}
            className="md:hidden px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1"
          >
            <span>{isMobileCollapsed ? 'Show Controls' : 'Hide Controls'}</span>
            {isMobileCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Action Buttons Bar (Responsive: Horizontal scroll on mobile when collapsed or grid when expanded) */}
      <div className={`${isMobileCollapsed ? 'hidden md:flex' : 'flex flex-col sm:flex-row'} flex-wrap items-center gap-2 pt-0.5`}>
        <button
          onClick={() => handleSimulate('heavy', api.simulateHeavyTraffic)}
          disabled={loadingAction}
          className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
        >
          <AlertTriangle size={14} className="text-amber-400" />
          Simulate Heavy Traffic
        </button>

        <button
          onClick={() => handleSimulate('accident', api.simulateAccident)}
          disabled={loadingAction}
          className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
        >
          <ShieldAlert size={14} className="text-rose-400" />
          Simulate Accident
        </button>

        <button
          onClick={() => handleSimulate('construction', api.simulateConstruction)}
          disabled={loadingAction}
          className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Cone size={14} className="text-orange-400" />
          Simulate Construction
        </button>

        <button
          onClick={() => handleSimulate('closure', api.simulateClosure)}
          disabled={loadingAction}
          className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-800/40 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Ban size={14} className="text-red-400" />
          Simulate Road Closure
        </button>

        <button
          onClick={() => handleSimulate('reset', api.resetTraffic)}
          disabled={loadingAction}
          className="w-full sm:w-auto sm:ml-auto px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RotateCcw size={14} className="text-slate-400" />
          Reset Traffic
        </button>
      </div>

      {/* 8-Step Interactive Demo Stepper (Responsive wrapping) */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Demo:</span>
          <span className="font-medium text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 truncate text-[11px]">
            {stepsText[currentStep - 1]}
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
          {/* Step dots */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <button
                key={s}
                onClick={() => handleDemoStep(s)}
                className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center transition-all ${
                  currentStep === s
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={nextDemoStep}
            disabled={loadingAction}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 font-semibold flex items-center gap-1 transition-all disabled:opacity-50 text-xs shrink-0"
          >
            <span>Next Step</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
