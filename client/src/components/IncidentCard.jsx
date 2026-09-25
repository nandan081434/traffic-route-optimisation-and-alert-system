import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Clock, MapPin, Zap } from 'lucide-react';
import { cardHover } from '../animations/variants.js';
import { formatTimeAgo } from '../utils/formatters.js';

export default function IncidentCard({ incident, onSelect }) {
  const getSeverityStyle = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'HIGH':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      onClick={() => onSelect && onSelect(incident)}
      className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-rose-500/40 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert size={16} />
            </span>
            <span className="text-sm font-bold text-white">{incident.type}</span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getSeverityStyle(incident.severity)}`}>
            {incident.severity}
          </span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-300">
          <MapPin size={13} className="text-slate-400 shrink-0" />
          <span className="truncate">{incident.location}</span>
        </div>

        <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-2">
          {incident.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Clock size={11} /> {formatTimeAgo(incident.reportedAt)}
        </span>
        <span className="text-xs font-mono font-bold text-rose-400">
          +{incident.delayMinutes || 8} min delay
        </span>
      </div>
    </motion.div>
  );
}
