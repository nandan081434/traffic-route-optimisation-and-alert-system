import React, { useState } from 'react';
import TrafficSignal from '../components/TrafficSignal.jsx';
import { Compass, Filter, Search } from 'lucide-react';

export default function Signals({ signals = [] }) {
  const [filterState, setFilterState] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSignals = signals.filter((sig) => {
    const matchesState = filterState === 'ALL' || sig.status === filterState;
    const matchesSearch =
      sig.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sig.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sig.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesState && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          SMART TRAFFIC SIGNALS
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Coordinated signal telemetry, green wave countdown timers, and waiting queue measurement.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search signals by ID or location..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {['ALL', 'GREEN', 'YELLOW', 'RED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterState(st)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap ${
                filterState === st
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSignals.map((signal) => (
          <TrafficSignal key={signal.id} signal={signal} />
        ))}
      </div>
    </div>
  );
}
