import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Map as MapIcon,
  Activity,
  Radio,
  Construction,
  AlertTriangle,
  ChartNoAxesCombined,
  ShieldCheck,
  Settings,
  Car,
  X,
  ShieldAlert,
  Award
} from 'lucide-react';

function TrafficLightIcon({ size = 17, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="7" y="2" width="10" height="20" rx="3" />
      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isMobileDrawerOpen,
  setIsMobileDrawerOpen,
  onOpenReportModal,
  presentationMode,
  setPresentationMode
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Live Map', icon: MapIcon },
    { id: 'traffic', label: 'Traffic Intelligence', icon: Activity },
    { id: 'kits', label: 'Traffic Kits', icon: Radio },
    { id: 'signals', label: 'Traffic Signals', icon: TrafficLightIcon },
    { id: 'construction', label: 'Construction', icon: Construction },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined },
    { id: 'admin', label: 'Admin Panel', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Close mobile drawer on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen, setIsMobileDrawerOpen]);

  const handleSelectTab = (id) => {
    setActiveTab(id);
    if (setIsMobileDrawerOpen) {
      setIsMobileDrawerOpen(false);
    }
  };

  return (
    <>
      {/* 1. DESKTOP & TABLET SIDEBAR */}
      <aside className="hidden md:flex flex-col w-full glass-panel border-r border-slate-800/80 bg-slate-950/70 p-3 lg:p-4 space-y-4 shrink-0 transition-all relative z-10 min-h-[calc(100vh-65px)]">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 lg:gap-3 px-3 py-2 lg:py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/10 text-white border border-cyan-500/40 shadow-sm shadow-cyan-500/10 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon size={17} className={`shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section 6: COUNTING RULE CARD */}
        <div className="mt-auto p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-cyan-300 font-bold tracking-wide">
            <div className="p-1 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Car size={13} />
            </div>
            <span className="uppercase text-[10px] tracking-wider font-mono">COUNTING RULE</span>
          </div>
          <div className="space-y-0.5 text-slate-300 text-[11px] leading-tight pl-0.5">
            <p className="font-medium text-slate-200">Every vehicle = <b>1 unit</b></p>
            <p className="text-slate-400 text-[10px]">Passengers are NOT counted</p>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE SLIDE-OUT DRAWER */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-72 max-w-[85vw] h-full bg-slate-950 border-r border-slate-800 shadow-2xl z-10 flex flex-col p-4 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/40">
                    <span className="text-white text-xs font-mono font-bold">SR</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wider">SMARTROUTE</h3>
                    <p className="text-[10px] text-cyan-400 font-mono">Mobile Navigation</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2 my-3">
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    if (onOpenReportModal) onOpenReportModal();
                  }}
                  className="p-2.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-bold flex flex-col items-center gap-1 active:scale-95 transition-all"
                >
                  <ShieldAlert size={16} />
                  <span>Report Issue</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    if (setPresentationMode) setPresentationMode(!presentationMode);
                  }}
                  className="p-2.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold flex flex-col items-center gap-1 active:scale-95 transition-all"
                >
                  <Award size={16} />
                  <span>{presentationMode ? 'Exit Pitch' : 'Pitch Mode'}</span>
                </button>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1 flex-1 py-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">
                  Menu
                </p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-cyan-500/10 text-white border border-cyan-500/40 shadow-sm shadow-cyan-500/10 font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Counting Rule Card */}
              <div className="mt-auto p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Car size={13} className="text-cyan-400" />
                  <span className="uppercase text-[10px] tracking-wider font-mono">COUNTING RULE</span>
                </div>
                <p className="font-semibold text-slate-200 text-xs">Every vehicle = 1 unit</p>
                <p className="text-[10px] text-slate-400">
                  Passengers are not counted
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
