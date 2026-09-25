import React from 'react';
import { Loader2, Inbox } from 'lucide-react';

export function LoadingSpinner({ label = "Loading data..." }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 size={28} className="animate-spin text-cyan-400" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-800 rounded w-1/3" />
        <div className="h-4 bg-slate-800 rounded w-1/4" />
      </div>
      <div className="h-3 bg-slate-800 rounded w-1/2" />
      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="h-14 bg-slate-800/60 rounded-xl" />
        <div className="h-14 bg-slate-800/60 rounded-xl" />
      </div>
    </div>
  );
}

export function EmptyState({ title = "No items found", description = "No active records in this category", icon: Icon = Inbox }) {
  return (
    <div className="py-16 px-4 text-center glass-panel rounded-2xl border border-slate-800/80 max-w-md mx-auto">
      <div className="w-12 h-12 rounded-full bg-slate-800/60 text-slate-500 mx-auto flex items-center justify-center mb-3">
        <Icon size={24} />
      </div>
      <h4 className="text-sm font-bold text-white">{title}</h4>
      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
    </div>
  );
}
