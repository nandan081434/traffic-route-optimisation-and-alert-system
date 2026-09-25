import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, Zap, ShieldAlert, ArrowRight } from 'lucide-react';
import { notificationVariants } from '../animations/variants.js';
import { formatTimeAgo } from '../utils/formatters.js';

export function NotificationToast({ notifications, onDismiss, onViewRoute }) {
  const getIcon = (type) => {
    switch (type) {
      case 'ROUTE_UPDATE':
        return <Zap size={17} className="text-emerald-400" />;
      case 'INCIDENT_ALERT':
      case 'ROAD_CLOSURE':
        return <ShieldAlert size={17} className="text-rose-400" />;
      case 'TRAFFIC_ALERT':
      case 'CONSTRUCTION_ALERT':
        return <AlertTriangle size={17} className="text-amber-400" />;
      default:
        return <Info size={17} className="text-cyan-400" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'ROUTE_UPDATE':
        return 'border-emerald-500/50 bg-slate-950/95 ring-1 ring-emerald-500/20';
      case 'INCIDENT_ALERT':
      case 'ROAD_CLOSURE':
        return 'border-rose-500/50 bg-slate-950/95 ring-1 ring-rose-500/20';
      case 'TRAFFIC_ALERT':
      case 'CONSTRUCTION_ALERT':
        return 'border-amber-500/50 bg-slate-950/95 ring-1 ring-amber-500/20';
      default:
        return 'border-cyan-500/40 bg-slate-950/95 ring-1 ring-cyan-500/20';
    }
  };

  return (
    <div className="fixed top-14 sm:top-16 left-2 right-2 sm:left-auto sm:right-5 sm:max-w-md z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.slice(0, 3).map((notif) => {
          const isRouteRecalc = notif.type === 'ROUTE_UPDATE' || notif.title?.toLowerCase().includes('recalculation') || notif.title?.toLowerCase().includes('route');

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              layout
              className={`pointer-events-auto p-3.5 sm:p-4 rounded-2xl border ${getBorderColor(
                notif.type
              )} backdrop-blur-xl shadow-2xl flex flex-col gap-2.5 transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                      {isRouteRecalc && <span className="text-amber-400">⚡</span>}
                      <span>{notif.title || 'Dynamic Route Recalculation'}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                      {formatTimeAgo(notif.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                <button
                  onClick={() => onDismiss(notif.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
                  aria-label="Dismiss alert"
                >
                  <X size={15} />
                </button>
              </div>

              {/* View Route Action Button (Section 27) */}
              {isRouteRecalc && (
                <div className="flex items-center justify-end pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      if (onViewRoute) onViewRoute(notif);
                      onDismiss(notif.id);
                    }}
                    className="px-3 py-1 rounded-xl text-xs font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all flex items-center gap-1.5 hover:-translate-y-0.5 active:scale-95"
                  >
                    <span>View Route</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function NotificationDrawer({ isOpen, onClose, notifications, onClear, onMarkRead }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-md glass-panel-elevated bg-slate-950/98 p-4 sm:p-6 shadow-2xl flex flex-col border-l border-slate-800">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-white">Notifications & Alerts</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-medium">
              {notifications.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 rounded"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mt-3 sm:mt-4 space-y-2.5 pr-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-600" />
              <p className="text-sm">No new notifications</p>
              <p className="text-xs text-slate-600 mt-1">Road traffic events will appear here in real time</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onMarkRead && onMarkRead(notif.id)}
                className={`p-3 rounded-xl border transition-all ${
                  notif.read
                    ? 'border-slate-800/80 bg-slate-800/30 opacity-70'
                    : 'border-slate-700/80 bg-slate-800/60 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="truncate">{notif.title}</span>
                  <span className="text-[10px] text-slate-500 font-normal shrink-0">
                    {formatTimeAgo(notif.timestamp)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{notif.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
