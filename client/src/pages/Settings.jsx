import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Volume2,
  Gauge,
  Bell,
  CheckCircle,
  Home,
  Briefcase,
  GraduationCap,
  MapPin,
  Server,
  Radio,
  Cpu
} from 'lucide-react';

export default function Settings({ isSocketConnected = true }) {
  const [metricUnits, setMetricUnits] = useState('metric');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [toastAlerts, setToastAlerts] = useState(true);
  const [updateInterval, setUpdateInterval] = useState('3.5s');

  const [savedLocations, setSavedLocations] = useState([
    { id: 'loc-1', name: 'Home', address: 'Green Park West (J9)', icon: Home },
    { id: 'loc-2', name: 'Work', address: 'Cyber Expressway Tech Park (J2)', icon: Briefcase },
    { id: 'loc-3', name: 'Campus / School', address: 'North Gate Hub (J1)', icon: GraduationCap }
  ]);

  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;
    setSavedLocations([
      ...savedLocations,
      {
        id: `loc-${Date.now()}`,
        name: newLocationName,
        address: newLocationAddress || 'Metro Central (J8)',
        icon: MapPin
      }
    ]);
    setNewLocationName('');
    setNewLocationAddress('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          SYSTEM SETTINGS & PREFERENCES
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure telemetry refresh intervals, user locations, accessibility, and navigation units.
        </p>
      </div>

      {/* Point 68: System Health Status */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server size={14} className="text-cyan-400" />
          SYSTEM SUBSYSTEMS STATUS
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Backend API</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ONLINE
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">WebSocket</span>
            <span className={isSocketConnected ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {isSocketConnected ? 'CONNECTED' : 'STANDBY'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Routing Engine</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Traffic Kits</span>
            <span className="text-emerald-400 font-bold">8 SENSORS</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Smart Signals</span>
            <span className="text-emerald-400 font-bold">9 MONITORS</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Leaflet Map</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Navigation & Units */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Gauge size={14} className="text-cyan-400" />
            Navigation & Metric Units
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div>
                <p className="font-semibold text-white">Measurement Standard</p>
                <p className="text-slate-400 text-[11px]">Distance in km, queue in meters, speed in km/h</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                Metric (SI)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div>
                <p className="font-semibold text-white">Sensor Tick Rate</p>
                <p className="text-slate-400 text-[11px]">Interval between roadside kit updates</p>
              </div>
              <select
                value={updateInterval}
                onChange={(e) => setUpdateInterval(e.target.value)}
                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
              >
                <option value="2.0s">2.0 seconds</option>
                <option value="3.5s">3.5 seconds (Default)</option>
                <option value="5.0s">5.0 seconds</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div>
                <p className="font-semibold text-white">Reduced Motion Mode</p>
                <p className="text-slate-400 text-[11px]">Limit animations for accessibility</p>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Notifications & Audio */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Bell size={14} className="text-cyan-400" />
            Alerts & Notifications
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div>
                <p className="font-semibold text-white">Dynamic Reroute Toasts</p>
                <p className="text-slate-400 text-[11px]">Slide-in notification when time is saved</p>
              </div>
              <input
                type="checkbox"
                checked={toastAlerts}
                onChange={(e) => setToastAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div>
                <p className="font-semibold text-white">Accident & Hazard Alerts</p>
                <p className="text-slate-400 text-[11px]">High severity warnings on active route</p>
              </div>
              <span className="text-emerald-400 font-bold">Enabled</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div>
                <p className="font-semibold text-white">Theme Interface</p>
                <p className="text-slate-400 text-[11px]">Smart-city deep navy midnight theme</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                Dark Modern
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Point 63: FAVORITE & SAVED LOCATIONS */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <MapPin size={14} className="text-cyan-400" />
          Saved Favorite Locations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {savedLocations.map((loc) => {
            const Icon = loc.icon;
            return (
              <div key={loc.id} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Icon size={14} />
                  </span>
                  <span className="text-xs font-bold text-white">{loc.name}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{loc.address}</p>
              </div>
            );
          })}
        </div>

        {/* Add quick location */}
        <form onSubmit={handleAddLocation} className="pt-2 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
            placeholder="Label (e.g. Gym, Library)..."
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 flex-1"
          />
          <input
            type="text"
            value={newLocationAddress}
            onChange={(e) => setNewLocationAddress(e.target.value)}
            placeholder="Junction or Address..."
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 flex-1"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
          >
            Add Location
          </button>
        </form>
      </div>
    </div>
  );
}
