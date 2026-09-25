import React, { useState, useEffect } from 'react';
import { Clock, Navigation } from 'lucide-react';

export default function SignalCardsSection({ signals = [], onSelectSignal }) {
  // Simulated initial signals matching Section 18
  const [signalList, setSignalList] = useState([
    {
      id: 'SIG-01',
      name: 'Central Junction',
      status: 'RED',
      remaining: 42,
      vehicles: 18,
      queue: '90m'
    },
    {
      id: 'SIG-02',
      name: 'Metro Junction',
      status: 'GREEN',
      remaining: 18,
      vehicles: 6,
      queue: '30m'
    },
    {
      id: 'SIG-03',
      name: 'Tech Park Junction',
      status: 'YELLOW',
      remaining: 5,
      vehicles: 14,
      queue: '75m'
    }
  ]);

  // Synchronize or animate the countdown every second (Section 18)
  useEffect(() => {
    const timer = setInterval(() => {
      setSignalList((prev) =>
        prev.map((sig) => {
          if (sig.remaining > 1) {
            return { ...sig, remaining: sig.remaining - 1 };
          }
          // Cycle phases when timer hits 0
          if (sig.status === 'RED') {
            return { ...sig, status: 'GREEN', remaining: 30 };
          } else if (sig.status === 'GREEN') {
            return { ...sig, status: 'YELLOW', remaining: 5 };
          } else {
            return { ...sig, status: 'RED', remaining: 45 };
          }
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'RED':
        return {
          text: 'text-rose-400',
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/30',
          dot: 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'
        };
      case 'YELLOW':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/30',
          dot: 'bg-amber-400 shadow-[0_0_12px_#fbbf24]'
        };
      case 'GREEN':
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/30',
          dot: 'bg-emerald-500 shadow-[0_0_12px_#10b981]'
        };
      default:
        return {
          text: 'text-cyan-400',
          bg: 'bg-cyan-500/15',
          border: 'border-cyan-500/30',
          dot: 'bg-cyan-400 shadow-[0_0_12px_#38bdf8]'
        };
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <span>🚦</span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">
              SIGNAL STATUS
            </h3>
            <p className="text-[11px] text-slate-400">
              Live cycle countdowns and phase synchronization
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 3 Signal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {signalList.map((sig) => {
          const styling = getStatusColor(sig.status);

          return (
            <div
              key={sig.id}
              onClick={() => onSelectSignal && onSelectSignal(sig)}
              className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-200 bg-slate-950/70 shadow-lg flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {sig.id}
                  </span>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${styling.bg} ${styling.text} ${styling.border}`}
                  >
                    {sig.status}
                  </span>
                </div>

                <h4 className="mt-2.5 text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {sig.name}
                </h4>
              </div>

              {/* Countdown Display with Animated Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${styling.dot} transition-colors duration-300`} />
                  <span className="text-xs font-semibold text-slate-400">Phase Cycle</span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${styling.text} transition-colors duration-300`}>
                    {sig.remaining}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">sec</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
