import React, { useState } from 'react';
import ConstructionCard from '../components/ConstructionCard.jsx';
import Modal from '../components/Modal.jsx';
import { TrafficCone, Plus, Search, Filter } from 'lucide-react';
import { api } from '../services/api.js';

export default function Construction({ construction = [], refreshTraffic, refreshRoutes }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterImpact, setFilterImpact] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    road: '',
    location: '',
    affectedDistance: 400,
    lanesBefore: 3,
    lanesAfter: 1,
    trafficImpact: 'HIGH',
    expectedEndDate: '2026-11-15'
  });

  const filtered = construction.filter((c) => {
    const matchesImpact = filterImpact === 'ALL' || c.trafficImpact === filterImpact;
    const matchesSearch =
      c.road.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesImpact && matchesSearch;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.addConstruction({
        ...formData,
        roadId: 'road-central-exp'
      });
      setIsModalOpen(false);
      refreshTraffic();
      refreshRoutes();
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
              ROAD CONSTRUCTION ZONES
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              LANE RESTRICTIONS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Active civil works, flyover retrofits, and smart utility lane drops factored into routing penalties.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          Register Work Zone
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search road or location..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterImpact(lvl)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap ${
                filterImpact === lvl
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {lvl} Impact
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((con) => (
          <ConstructionCard key={con.id} construction={con} />
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Road Construction Zone">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Road Name</label>
            <input
              type="text"
              required
              value={formData.road}
              onChange={(e) => setFormData({ ...formData, road: e.target.value })}
              placeholder="e.g. Cyber Expressway North"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Location Details</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Near Junction 2 Overpass"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Affected Distance (m)</label>
              <input
                type="number"
                value={formData.affectedDistance}
                onChange={(e) => setFormData({ ...formData, affectedDistance: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Lanes Before</label>
              <input
                type="number"
                value={formData.lanesBefore}
                onChange={(e) => setFormData({ ...formData, lanesBefore: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Lanes After</label>
              <input
                type="number"
                value={formData.lanesAfter}
                onChange={(e) => setFormData({ ...formData, lanesAfter: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold text-black bg-amber-400 hover:bg-amber-300"
            >
              Save Zone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
