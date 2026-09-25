import React from 'react';
import { Menu, Bell, Radio, ShieldAlert, Award, Compass, User, X } from 'lucide-react';
import LiveIndicator from './LiveIndicator.jsx';

export default function Navbar({
  isLive = true,
  unreadCount = 0,
  onOpenNotifications,
  onOpenReportModal,
  presentationMode,
  setPresentationMode,
  onToggleMobileMenu,
  isMobileMenuOpen = false
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-3 sm:px-5 lg:px-7 py-2.5 sm:py-3 transition-all">
      <div className="w-full max-w-[2100px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Hamburger (Mobile) + Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Mobile Hamburger Button */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 active:scale-95 transition-all"
            aria-label="Toggle navigation drawer"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* SmartRoute Logo */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40 shrink-0">
            <Compass size={18} className="text-white sm:w-5 sm:h-5" />
          </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm md:text-base font-black tracking-wide text-white uppercase">
                  INTELLIGENT TRAFFIC MONITORING & ROUTE ALERT SYSTEM
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  v1.0
                </span>
              </div>
              <p className="hidden lg:block text-[11px] text-slate-400 font-medium">
                Real-Time Corridor Telemetry & Dynamic Navigation Platform
              </p>
            </div>
        </div>

        {/* Right: Live Indicator & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live indicator */}
          <LiveIndicator isLive={isLive} label="CONNECTED" className="text-[10px] sm:text-xs py-1 px-2.5" />

          {/* Report Issue Button (Tablet + Desktop) */}
          <button
            onClick={onOpenReportModal}
            className="hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all items-center gap-1.5 active:scale-95 hover:-translate-y-0.5 shrink-0"
          >
            <ShieldAlert size={15} className="text-rose-400" />
            <span className="hidden md:inline">Report Issue</span>
          </button>

          {/* Presentation Mode Toggle (Tablet + Desktop) */}
          <button
            onClick={() => setPresentationMode(!presentationMode)}
            className={`hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all items-center gap-1.5 shrink-0 hover:-translate-y-0.5 ${
              presentationMode
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle Pitch Mode"
          >
            <Award size={15} className={presentationMode ? 'text-purple-400' : 'text-slate-400'} />
            <span className="hidden lg:inline">{presentationMode ? 'Exit Demo' : 'Pitch Mode'}</span>
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all active:scale-95 hover:-translate-y-0.5"
            aria-label="Open notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-lg shadow-rose-500/50 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Profile Badge (Desktop) */}
          <div className="hidden lg:flex items-center pl-2.5 border-l border-slate-800/80">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-300 text-xs font-bold font-mono shadow-sm">
              <User size={15} className="text-cyan-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
