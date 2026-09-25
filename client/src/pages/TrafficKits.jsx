import React, { useState } from 'react';
import { Radio, Search, Filter, Plus, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import TrafficKitCard from '../components/TrafficKitCard.jsx';
import Modal from '../components/Modal.jsx';
import { api } from '../services/api.js';

export default function TrafficKits({ kits = [], refreshTraffic, refreshRoutes }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: 12.9550,
    longitude: 77.6150,
    vehicleUnits: 10,
    queueLength: 40,
    averageSpeed: 45,
    waitingTime: 20
  });

  const filteredKits = kits.filter((kit) => {
    const matchesSearch =
      kit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kit.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || kit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendTelemetry = async (kit) => {
    try {
      await api.sendHardwareTelemetry({
        kitId: kit.id,
        vehicleUnits: Math.min(55, kit.vehicleUnits + 6),
        queueLength: Math.min(240, kit.queueLength + 35),
        averageSpeed: Math.max(5, kit.averageSpeed - 6),
        waitingTime: kit.waitingTime + 18,
        signalStatus: kit.signalStatus
      });
      refreshTraffic();
      refreshRoutes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateKit = async (e) => {
    e.preventDefault();
    try {
      await api.addKit(formData);
      setIsAddModalOpen(false);
      refreshTraffic();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              TRAFFIC MONITORING KITS
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
              IoT HARDWARE READY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Roadside edge-computing kits measuring vehicle units, queue meters, and signal delays.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          Register New Kit
        </button>
      </div>

      {/* IoT Hardware Integration Specs Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <Cpu size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-white">Microcontroller Telemetry Ingest Endpoint</h4>
            <p className="text-slate-400 font-mono text-[11px] mt-0.5 break-all">
              POST /api/traffic-kits/update • Payload: &#123; kitId, vehicleUnits, queueLength, averageSpeed, waitingTime &#125;
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto font-mono text-[11px] text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-800/40 shrink-0">
          <ShieldCheck size={14} />
          ESP32 / Arduino Compatible
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID or junction name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {['ALL', 'ONLINE', 'OFFLINE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Kits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKits.map((kit) => (
          <TrafficKitCard
            key={kit.id}
            kit={kit}
            onSendMockTelemetry={handleSendTelemetry}
          />
        ))}
      </div>

      {/* Add Kit Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register Traffic Monitoring Kit">
        <form onSubmit={handleCreateKit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Kit Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. South Ring Sensor"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Location / Cross Street</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Silk Board North Ramp"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Initial Vehicle Units</label>
              <input
                type="number"
                min="0"
                value={formData.vehicleUnits}
                onChange={(e) => setFormData({ ...formData, vehicleUnits: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Queue Length (meters)</label>
              <input
                type="number"
                min="0"
                value={formData.queueLength}
                onChange={(e) => setFormData({ ...formData, queueLength: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold text-black bg-cyan-400 hover:bg-cyan-300"
            >
              Save Kit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
