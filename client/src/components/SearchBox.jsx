import React, { useState } from 'react';
import { Search, MapPin, ArrowUpDown, Navigation, LocateFixed, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBox({ onSearch }) {
  const [start, setStart] = useState('North Gate Tech Hub (J1)');
  const [destination, setDestination] = useState('Metro Central Terminal (J8)');
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const handleSwap = () => {
    const temp = start;
    setStart(destination);
    setDestination(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSearching(true);
    if (onSearch) onSearch({ start, destination });
    setTimeout(() => {
      setIsSearching(false);
      setIsMobileExpanded(false);
    }, 400);
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
      {/* Mobile Collapsed Bar (Tappable bar: "Where do you want to go?") */}
      <div
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        className="md:hidden p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-850/60 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Search size={16} />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate">Where do you want to go?</h4>
            <p className="text-[10px] text-slate-400 truncate">
              {destination.replace(/\s*\(J\d+\)/, '')}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1 rounded-lg text-slate-400 hover:text-white"
          aria-label="Expand search"
        >
          {isMobileExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded form on mobile / Always visible on tablet & desktop */}
      <div className={`${isMobileExpanded ? 'block' : 'hidden'} md:block p-3.5 sm:p-4 border-t border-slate-800 md:border-t-0 space-y-3`}>
        <div className="hidden md:flex items-center justify-between pb-1 border-b border-slate-800/80">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Navigation size={13} className="text-cyan-400" />
            Plan Route
          </h3>
          <button
            type="button"
            onClick={() => setStart('Current Location (GPS)')}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
          >
            <LocateFixed size={12} />
            Current Location
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="relative flex flex-col gap-2">
            {/* Start Input */}
            <div className="relative flex items-center">
              <span className="absolute left-3 text-cyan-400 shrink-0">
                <MapPin size={15} />
              </span>
              <input
                type="text"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="Starting location..."
                className="w-full pl-9 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-medium"
              />
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwap}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-md active:scale-90"
              title="Swap Start & Destination"
              aria-label="Swap locations"
            >
              <ArrowUpDown size={14} />
            </button>

            {/* Destination Input */}
            <div className="relative flex items-center">
              <span className="absolute left-3 text-emerald-400 shrink-0">
                <MapPin size={15} />
              </span>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Destination location..."
                className="w-full pl-9 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStart('Current Location (GPS)')}
              className="md:hidden w-full py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <LocateFixed size={13} className="text-cyan-400" />
              Use Current Location
            </button>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Search size={14} />
              {isSearching ? 'Calculating Routes...' : 'Find Smart Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
