import React from 'react';
import { Gauge, Activity, Clock, Zap, ArrowDown, ArrowUp, ChartNoAxesCombined } from 'lucide-react';

export default function AnalyticsCards() {
  const cards = [
    {
      title: 'AVERAGE SPEED',
      value: '18.4',
      unit: 'km/h',
      trend: '↓ 4.2%',
      trendType: 'down-bad', // lower speed is negative
      icon: Gauge,
      accent: 'cyan'
    },
    {
      title: 'TRAFFIC FLOW',
      value: '1,248',
      unit: 'units/hr',
      trend: '↑ 8.5%',
      trendType: 'up-good', // higher throughput
      icon: Activity,
      accent: 'emerald'
    },
    {
      title: 'AVERAGE DELAY',
      value: '6.4',
      unit: 'min',
      trend: '↓ 12%',
      trendType: 'down-good', // lower delay is positive
      icon: Clock,
      accent: 'amber'
    },
    {
      title: 'ROUTE SAVINGS',
      value: '17',
      unit: 'min',
      trend: '↑ 21%',
      trendType: 'up-good', // higher savings is positive
      icon: Zap,
      accent: 'cyan'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ChartNoAxesCombined size={16} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">
              NETWORK PERFORMANCE & SAVINGS
            </h3>
            <p className="text-[11px] text-slate-400">
              Aggregated corridor velocity, throughput, and commuter time efficiency
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 4 Compact Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          const isGood = c.trendType.includes('good');

          return (
            <div
              key={i}
              className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-all duration-200 bg-slate-950/70 shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                  {c.title}
                </span>
                <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                  <Icon size={14} className={c.accent === 'cyan' ? 'text-cyan-400' : c.accent === 'emerald' ? 'text-emerald-400' : 'text-amber-400'} />
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-1 flex-wrap">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                    {c.value}
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-medium">
                    {c.unit}
                  </span>
                </div>

                {/* Trend indicator */}
                <span
                  className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-md border ${
                    isGood
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {c.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
