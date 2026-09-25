/**
 * SmartRoute - Formatter Utilities
 */

export function formatTimeAgo(isoString) {
  if (!isoString) return 'Just now';
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec} sec ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  return `${diffHours} hr ago`;
}

export function formatDistance(km) {
  if (km === undefined || km === null) return '--';
  return `${Number(km).toFixed(1)} km`;
}

export function formatDuration(minutes) {
  if (minutes === undefined || minutes === null) return '--';
  const mins = Math.round(Number(minutes));
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hrs}h ${rem}m`;
  }
  return `${mins} min`;
}

export function formatSpeed(kmh) {
  if (kmh === undefined || kmh === null) return '--';
  return `${Math.round(kmh)} km/h`;
}

export function formatQueue(meters) {
  if (meters === undefined || meters === null) return '--';
  return `${Math.round(meters)} m`;
}

export function getTrafficLevelColor(level) {
  switch (level?.toUpperCase()) {
    case 'LOW':
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        hex: '#10b981',
        label: 'Low'
      };
    case 'MODERATE':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        hex: '#f59e0b',
        label: 'Moderate'
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        hex: '#f97316',
        label: 'High'
      };
    case 'SEVERE':
      return {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        hex: '#ef4444',
        label: 'Severe'
      };
    case 'CLOSED':
      return {
        bg: 'bg-slate-700/20',
        border: 'border-slate-600',
        text: 'text-slate-400',
        badge: 'bg-slate-700/40 text-slate-300 border-slate-600',
        hex: '#475569',
        label: 'Closed'
      };
    default:
      return {
        bg: 'bg-slate-800/20',
        border: 'border-slate-700',
        text: 'text-slate-400',
        badge: 'bg-slate-800/40 text-slate-300 border-slate-700',
        hex: '#64748b',
        label: level || 'Unknown'
      };
  }
}
