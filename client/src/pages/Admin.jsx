import React, { useState } from 'react';
import {
  ShieldCheck,
  Radio,
  Compass,
  TrafficCone,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  Ban
} from 'lucide-react';
import Modal from '../components/Modal.jsx';
import { api } from '../services/api.js';

export default function Admin({
  kits = [],
  signals = [],
  incidents = [],
  construction = [],
  network = { roads: [] },
  refreshTraffic,
  refreshRoutes
}) {
  const [activeTab, setActiveTab] = useState('kits');
  const [searchTerm, setSearchTerm] = useState('');
  const [simulationRunning, setSimulationRunning] = useState(true);

  // Edit / Add Modals State
  const [isKitModalOpen, setIsKitModalOpen] = useState(false);
  const [editingKit, setEditingKit] = useState(null);
  const [kitForm, setKitForm] = useState({
    name: '',
    location: '',
    vehicleUnits: 12,
    queueLength: 45,
    averageSpeed: 40,
    waitingTime: 20
  });

  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    type: 'Accident',
    location: '',
    severity: 'HIGH',
    description: '',
    delayMinutes: 12
  });

  // Simulator controls
  const handleToggleSimulator = async (action) => {
    try {
      const res = await api.toggleSimulation(action);
      setSimulationRunning(res.running);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetSimulator = async () => {
    try {
      await api.resetTraffic();
      refreshTraffic();
      refreshRoutes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRoadClosure = async (road) => {
    try {
      if (road.isClosed) {
        await api.resetTraffic();
      } else {
        await api.simulateClosure();
      }
      refreshTraffic();
      refreshRoutes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveKit = async (e) => {
    e.preventDefault();
    try {
      if (editingKit) {
        await api.editKit(editingKit.id, kitForm);
      } else {
        await api.addKit(kitForm);
      }
      setIsKitModalOpen(false);
      setEditingKit(null);
      refreshTraffic();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteKit = async (id) => {
    if (!window.confirm(`Delete traffic kit ${id}?`)) return;
    try {
      await api.removeKit(id);
      refreshTraffic();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveIncident = async (e) => {
    e.preventDefault();
    try {
      await api.addIncident({
        ...incidentForm,
        roadId: 'road-central-exp'
      });
      setIsIncidentModalOpen(false);
      refreshTraffic();
      refreshRoutes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIncident = async (id) => {
    try {
      await api.removeIncident(id);
      refreshTraffic();
      refreshRoutes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConstruction = async (id) => {
    try {
      await api.removeConstruction(id);
      refreshTraffic();
      refreshRoutes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white">
              ADMINISTRATION PANEL
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
              CONTROL CENTER
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
            Manage traffic kits, signal cycles, road closures, and live hardware ingest.
          </p>
        </div>

        {/* Global Simulation Toggle Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {simulationRunning ? (
            <button
              onClick={() => handleToggleSimulator('pause')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-all"
            >
              <Pause size={13} /> Pause
            </button>
          ) : (
            <button
              onClick={() => handleToggleSimulator('start')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-all"
            >
              <Play size={13} /> Resume
            </button>
          )}

          <button
            onClick={handleResetSimulator}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Admin Tabs (Horizontal scroll on mobile) */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'kits', label: 'Traffic Kits', icon: Radio, count: kits.length },
          { id: 'signals', label: 'Signals', icon: Compass, count: signals.length },
          { id: 'incidents', label: 'Incidents', icon: AlertTriangle, count: incidents.length },
          { id: 'construction', label: 'Construction', icon: TrafficCone, count: construction.length },
          { id: 'roads', label: 'Closures', icon: Ban, count: network.roads?.length || 0 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-400 font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 1. TRAFFIC KITS */}
      {activeTab === 'kits' && (
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-white">Registered Traffic Kits</h3>
            <button
              onClick={() => {
                setEditingKit(null);
                setKitForm({
                  name: '',
                  location: '',
                  vehicleUnits: 15,
                  queueLength: 50,
                  averageSpeed: 40,
                  waitingTime: 20
                });
                setIsKitModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Kit
            </button>
          </div>

          {/* Point 19: MOBILE CARDS VIEW */}
          <div className="md:hidden divide-y divide-slate-800/80 p-3 space-y-3">
            {kits.map((kit) => (
              <div key={kit.id} className="pt-3 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400 text-xs">{kit.id}</span>
                    <h4 className="font-bold text-white text-xs">{kit.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {kit.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{kit.location}</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block">Vehicles</span>
                    <span className="font-mono font-bold text-white">{kit.vehicleUnits}u</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block">Queue</span>
                    <span className="font-mono font-bold text-amber-300">{kit.queueLength}m</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block">Speed</span>
                    <span className="font-mono font-bold text-cyan-400">{kit.averageSpeed}km</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      setEditingKit(kit);
                      setKitForm({
                        name: kit.name,
                        location: kit.location,
                        vehicleUnits: kit.vehicleUnits,
                        queueLength: kit.queueLength,
                        averageSpeed: kit.averageSpeed,
                        waitingTime: kit.waitingTime
                      });
                      setIsKitModalOpen(true);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs flex items-center gap-1"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteKit(kit.id)}
                    className="px-2 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* TABLET & DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Name & Location</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Vehicle Units</th>
                  <th className="p-3.5">Queue</th>
                  <th className="p-3.5">Speed</th>
                  <th className="p-3.5">Level</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {kits.map((kit) => (
                  <tr key={kit.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-cyan-400">{kit.id}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{kit.name}</div>
                      <div className="text-[11px] text-slate-500">{kit.location}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {kit.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold">{kit.vehicleUnits} units</td>
                    <td className="p-3.5 font-mono text-amber-300">{kit.queueLength} m</td>
                    <td className="p-3.5 font-mono">{kit.averageSpeed} km/h</td>
                    <td className="p-3.5 font-bold text-slate-200">{kit.trafficLevel}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingKit(kit);
                          setKitForm({
                            name: kit.name,
                            location: kit.location,
                            vehicleUnits: kit.vehicleUnits,
                            queueLength: kit.queueLength,
                            averageSpeed: kit.averageSpeed,
                            waitingTime: kit.waitingTime
                          });
                          setIsKitModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-cyan-400"
                        title="Edit Kit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteKit(kit.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400"
                        title="Delete Kit"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. TRAFFIC SIGNALS */}
      {activeTab === 'signals' && (
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-slate-800">
            <h3 className="text-xs sm:text-sm font-bold text-white">Active Traffic Signals</h3>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-800/80 p-3 space-y-3">
            {signals.map((sig) => (
              <div key={sig.id} className="pt-3 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-400 text-xs">{sig.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sig.status === 'RED'
                        ? 'bg-rose-500/20 text-rose-300'
                        : sig.status === 'GREEN'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {sig.status} ({sig.status === 'RED' ? sig.redRemaining : sig.greenRemaining}s)
                  </span>
                </div>
                <p className="text-xs font-semibold text-white">{sig.location}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block">Waiting Vehicles</span>
                    <span className="font-mono font-bold text-white">{sig.vehiclesWaiting} units</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block">Queue Distance</span>
                    <span className="font-mono font-bold text-amber-300">{sig.queueLength} m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">State</th>
                  <th className="p-3.5">Countdown</th>
                  <th className="p-3.5">Vehicles</th>
                  <th className="p-3.5">Queue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {signals.map((sig) => (
                  <tr key={sig.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-cyan-400">{sig.id}</td>
                    <td className="p-3.5 font-semibold text-white">{sig.location}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sig.status === 'RED'
                            ? 'bg-rose-500/20 text-rose-300'
                            : sig.status === 'GREEN'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {sig.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold">
                      {sig.status === 'RED' ? `${sig.redRemaining}s` : `${sig.greenRemaining}s`}
                    </td>
                    <td className="p-3.5 font-mono">{sig.vehiclesWaiting} units</td>
                    <td className="p-3.5 font-mono text-amber-300">{sig.queueLength} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. INCIDENTS */}
      {activeTab === 'incidents' && (
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-white">Active Road Incidents</h3>
            <button
              onClick={() => setIsIncidentModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Incident
            </button>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-800/80 p-3 space-y-3">
            {incidents.map((inc) => (
              <div key={inc.id} className="pt-3 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-400 text-xs">{inc.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {inc.severity}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{inc.type}</h4>
                  <p className="text-[11px] text-slate-400">{inc.location}</p>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-rose-400 font-mono font-bold">+{inc.delayMinutes || 8}m penalty</span>
                  <button
                    onClick={() => handleDeleteIncident(inc.id)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Type & Location</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Impact</th>
                  <th className="p-3.5">Delay</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3.5 font-mono text-rose-400 font-bold">{inc.id}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{inc.type}</div>
                      <div className="text-[11px] text-slate-500">{inc.location}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-300">{inc.trafficImpact}</td>
                    <td className="p-3.5 font-mono text-rose-400">+{inc.delayMinutes || 8} min</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteIncident(inc.id)}
                        className="p-1 rounded text-slate-400 hover:text-emerald-400"
                        title="Resolve"
                      >
                        <CheckCircle size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CONSTRUCTION */}
      {activeTab === 'construction' && (
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-slate-800">
            <h3 className="text-xs sm:text-sm font-bold text-white">Road Construction Zones</h3>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-800/80 p-3 space-y-3">
            {construction.map((c) => (
              <div key={c.id} className="pt-3 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 text-xs">{c.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {c.trafficImpact}
                  </span>
                </div>
                <h4 className="font-bold text-white text-xs">{c.road}</h4>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Distance: {c.affectedDistance}m</span>
                  <span className="text-amber-300 font-mono">{c.lanesBefore} → {c.lanesAfter} lanes</span>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleDeleteConstruction(c.id)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold"
                  >
                    Mark Done
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Road</th>
                  <th className="p-3.5">Affected Distance</th>
                  <th className="p-3.5">Lane Drop</th>
                  <th className="p-3.5">Impact</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {construction.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-amber-400">{c.id}</td>
                    <td className="p-3.5 font-semibold text-white">{c.road}</td>
                    <td className="p-3.5 font-mono">{c.affectedDistance} m</td>
                    <td className="p-3.5 font-mono text-amber-300">{c.lanesBefore} → {c.lanesAfter} lanes</td>
                    <td className="p-3.5 font-bold">{c.trafficImpact}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteConstruction(c.id)}
                        className="p-1 rounded text-slate-400 hover:text-emerald-400"
                        title="Mark Complete"
                      >
                        <CheckCircle size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ROAD CLOSURES */}
      {activeTab === 'roads' && (
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-slate-800">
            <h3 className="text-xs sm:text-sm font-bold text-white">Corridor Road Closures Override</h3>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-800/80 p-3 space-y-3">
            {network.roads?.map((road) => (
              <div key={road.id} className="pt-3 first:pt-0 flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-xs">{road.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{road.lengthKm} km • {road.id}</span>
                </div>
                <button
                  onClick={() => handleToggleRoadClosure(road)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    road.isClosed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {road.isClosed ? 'Reopen' : 'Close'}
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Corridor ID</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Length</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {network.roads?.map((road) => (
                  <tr key={road.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3.5 font-mono text-cyan-400">{road.id}</td>
                    <td className="p-3.5 font-semibold text-white">{road.name}</td>
                    <td className="p-3.5 font-mono">{road.lengthKm} km</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          road.isClosed
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {road.isClosed ? 'CLOSED' : 'OPEN'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleRoadClosure(road)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          road.isClosed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                        }`}
                      >
                        {road.isClosed ? 'Reopen Road' : 'Close Road'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Kit Modal */}
      <Modal
        isOpen={isKitModalOpen}
        onClose={() => setIsKitModalOpen(false)}
        title={editingKit ? `Edit Kit: ${editingKit.id}` : 'Add New Traffic Kit'}
      >
        <form onSubmit={handleSaveKit} className="space-y-3 sm:space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Kit Name</label>
            <input
              type="text"
              required
              value={kitForm.name}
              onChange={(e) => setKitForm({ ...kitForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Location</label>
            <input
              type="text"
              required
              value={kitForm.location}
              onChange={(e) => setKitForm({ ...kitForm, location: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Vehicle Units</label>
              <input
                type="number"
                min="0"
                value={kitForm.vehicleUnits}
                onChange={(e) => setKitForm({ ...kitForm, vehicleUnits: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Queue (m)</label>
              <input
                type="number"
                min="0"
                value={kitForm.queueLength}
                onChange={(e) => setKitForm({ ...kitForm, queueLength: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsKitModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 rounded-xl font-bold text-black bg-cyan-400 hover:bg-cyan-300 text-center"
            >
              Save Kit
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Incident Modal */}
      <Modal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        title="Register Incident"
      >
        <form onSubmit={handleSaveIncident} className="space-y-3 sm:space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Incident Type</label>
            <select
              value={incidentForm.type}
              onChange={(e) => setIncidentForm({ ...incidentForm, type: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
            >
              <option value="Accident">Accident</option>
              <option value="Traffic Jam">Traffic Jam</option>
              <option value="Road Blockage">Road Blockage</option>
              <option value="Flooded Road">Flooded Road</option>
              <option value="Emergency Closure">Emergency Closure</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Location</label>
            <input
              type="text"
              required
              value={incidentForm.location}
              onChange={(e) => setIncidentForm({ ...incidentForm, location: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={incidentForm.description}
              onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white resize-none"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsIncidentModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-400 text-center"
            >
              Save Incident
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
