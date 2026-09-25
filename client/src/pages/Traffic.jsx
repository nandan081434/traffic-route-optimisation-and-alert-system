import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Car, Gauge, Clock, Filter, AlertTriangle } from 'lucide-react';
import TrafficCard from '../components/TrafficCard.jsx';
import StatsCard from '../components/StatsCard.jsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function Traffic({ kits = [], network = { roads: [] } }) {
  const [filterLevel, setFilterLevel] = useState('ALL');

  const roads = network.roads || [];

  // Filter roads
  const filteredRoads = roads.filter((r) => {
    if (filterLevel === 'ALL') return true;
    return r.trafficLevel === filterLevel;
  });

  // Calculate overall metrics
  const totalVehicles = kits.reduce((acc, k) => acc + (k.vehicleUnits || 0), 0);
  const avgSpeed = kits.length > 0
    ? Math.round(kits.reduce((acc, k) => acc + (k.averageSpeed || 0), 0) / kits.length)
    : 34;
  const avgQueue = kits.length > 0
    ? Math.round(kits.reduce((acc, k) => acc + (k.queueLength || 0), 0) / kits.length)
    : 65;
  const avgWait = kits.length > 0
    ? Math.round(kits.reduce((acc, k) => acc + (k.waitingTime || 0), 0) / kits.length)
    : 38;

  // Chart data: Road Queues comparison
  const chartData = roads.map((r) => ({
    name: r.name.length > 18 ? r.name.slice(0, 18) + '...' : r.name,
    queue: r.queueLength,
    speed: r.currentSpeed,
    units: r.vehicleUnits,
    level: r.trafficLevel
  }));

  const getBarColor = (level) => {
    if (level === 'SEVERE') return '#ef4444';
    if (level === 'HIGH') return '#f97316';
    if (level === 'MODERATE') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          TRAFFIC INTELLIGENCE
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Real-time corridor telemetry, traffic density scoring, and queue distribution.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Vehicle Units Tracked"
          value={totalVehicles}
          unit="units"
          icon={Car}
          color="cyan"
        />
        <StatsCard
          title="Average Network Speed"
          value={avgSpeed}
          unit="km/h"
          icon={Gauge}
          color="emerald"
        />
        <StatsCard
          title="Average Queue Length"
          value={avgQueue}
          unit="meters"
          icon={Activity}
          color="amber"
        />
        <StatsCard
          title="Average Wait Time"
          value={avgWait}
          unit="seconds"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Corridor Queue Chart */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Queue Length by Road Corridor (Meters)
          </h3>
          <span className="text-xs text-slate-400">Measured from junction stop lines</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="queue" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.level)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter by Level:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {['ALL', 'LOW', 'MODERATE', 'HIGH', 'SEVERE'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap ${
                filterLevel === lvl
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Road Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoads.map((road) => (
          <TrafficCard key={road.id} road={road} />
        ))}
      </div>
    </div>
  );
}
