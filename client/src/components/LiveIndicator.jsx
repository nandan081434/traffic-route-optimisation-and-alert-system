import React from 'react';

export default function LiveIndicator({ isLive = true, label = "LIVE SENSORS", className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${
      isLive 
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    } ${className}`}>
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
      </span>
      <span>{isLive ? label : 'OFFLINE / DEMO'}</span>
    </div>
  );
}
