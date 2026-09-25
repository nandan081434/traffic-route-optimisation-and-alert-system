import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({
  title,
  value,
  unit = "",
  change = null,
  icon: Icon,
  trend = "neutral",
  color = "cyan"
}) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = typeof value === 'number' ? value : parseFloat(value) || 0;
    if (isNaN(end) || typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    if (start === end) return;
    const duration = 500;
    const steps = 15;
    const increment = (end - start) / steps;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      start += increment;
      if (stepCount >= steps) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(start));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const colorStyles = {
    cyan: {
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    rose: {
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    },
    purple: {
      border: 'hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
  };

  const style = colorStyles[color] || colorStyles.cyan;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={`glass-panel p-3.5 sm:p-5 rounded-2xl border border-slate-800/80 transition-all ${style.border} relative overflow-hidden group shadow-lg shadow-black/20`}
    >
      <div className="flex items-center justify-between gap-1">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">{title}</p>
        {Icon && (
          <div className={`p-1.5 sm:p-2.5 rounded-xl border ${style.iconBg} transition-transform group-hover:scale-110 shrink-0`}>
            <Icon className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
          </div>
        )}
      </div>

      <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
          {displayValue}
        </span>
        {unit && <span className="text-[10px] sm:text-xs font-medium text-slate-400">{unit}</span>}
      </div>

      {change && (
        <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs flex items-center gap-1.5 font-medium truncate">
          <span className={trend === 'positive' ? 'text-emerald-400' : trend === 'negative' ? 'text-rose-400' : 'text-slate-400'}>
            {change}
          </span>
          <span className="text-slate-500">vs historical</span>
        </div>
      )}
    </motion.div>
  );
}
