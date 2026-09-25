import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Sparkles,
  Calendar,
  Compass,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api.js';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('Today');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getHistoricalAnalytics();
        if (res && res.data) {
          setAnalyticsData(res.data);
        }
      } catch (err) {
        console.warn('Analytics API error, loading local fallback:', err);
      }
    }
    loadData();
  }, []);

  const hourlyData = analyticsData?.hourlyTraffic || [
    { time: "06:00", vehiclesPerHour: 38, avgSpeed: 48, avgQueue: 25 },
    { time: "07:00", vehiclesPerHour: 72, avgSpeed: 38, avgQueue: 65 },
    { time: "08:00", vehiclesPerHour: 114, avgSpeed: 22, avgQueue: 140 },
    { time: "09:00", vehiclesPerHour: 156, avgSpeed: 14, avgQueue: 190 },
    { time: "10:00", vehiclesPerHour: 128, avgSpeed: 20, avgQueue: 130 },
    { time: "11:00", vehiclesPerHour: 94, avgSpeed: 32, avgQueue: 85 },
    { time: "12:00", vehiclesPerHour: 86, avgSpeed: 35, avgQueue: 75 },
    { time: "14:00", vehiclesPerHour: 98, avgSpeed: 30, avgQueue: 90 },
    { time: "16:00", vehiclesPerHour: 135, avgSpeed: 19, avgQueue: 155 },
    { time: "17:00", vehiclesPerHour: 168, avgSpeed: 12, avgQueue: 210 },
    { time: "18:00", vehiclesPerHour: 182, avgSpeed: 9, avgQueue: 240 },
    { time: "19:00", vehiclesPerHour: 160, avgSpeed: 15, avgQueue: 180 },
    { time: "20:00", vehiclesPerHour: 124, avgSpeed: 24, avgQueue: 120 }
  ];

  const corridorData = analyticsData?.corridorCongestion || [
    { corridor: "Central Exp", congestionScore: 84, avgSpeed: 14 },
    { corridor: "Old Airport", congestionScore: 72, avgSpeed: 18 },
    { corridor: "Silk Board", congestionScore: 88, avgSpeed: 12 },
    { corridor: "Koramangala", congestionScore: 48, avgSpeed: 32 },
    { corridor: "Green Park", congestionScore: 22, avgSpeed: 48 }
  ];

  const signalEfficiency = analyticsData?.signalEfficiency || [
    { signal: "TS-101", efficiency: 92 },
    { signal: "TS-102", efficiency: 78 },
    { signal: "TS-103", efficiency: 65 },
    { signal: "TS-104", efficiency: 48 },
    { signal: "TS-106", efficiency: 82 },
    { signal: "TS-108", efficiency: 95 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            HISTORICAL TRAFFIC ANALYTICS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Corridor throughput curves, queue trends, signal clearance efficiency, and predictive modeling.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {['Today', '7 Days', '30 Days'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeRange === range
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Point 36: SMART TRAFFIC PREDICTION */}
      <div className="glass-panel-elevated p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <Sparkles size={16} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Expected Traffic in Next 30 Minutes
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                  SIMULATED PREDICTION
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Current condition: <b className="text-amber-400">HIGH</b> → Projected condition: <b className="text-rose-400">SEVERE</b>
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-purple-300 bg-purple-900/40 px-3 py-1.5 rounded-xl border border-purple-700/50 self-start sm:self-auto">
            +32% Anticipated Queue Surge
          </span>
        </div>

        <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
          <b>Forecast Rationale:</b> Historical sensors reveal vehicle influx regularly intensifies by 28-35% during this corridor window. Dynamic route routing has preemptively adjusted Route A cost upwards.
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Chart 1: Vehicles Per Hour */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Vehicles Tracked Per Hour (Units)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">1 veh = 1 unit</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="vehGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
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
                <Area type="monotone" dataKey="vehiclesPerHour" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#vehGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Average Speed vs Queue Length */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Corridor Queue Length vs Speed
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Speed (km/h) vs Queue (m)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
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
                <Line type="monotone" dataKey="avgQueue" stroke="#f59e0b" strokeWidth={2} dot={false} name="Queue (m)" />
                <Line type="monotone" dataKey="avgSpeed" stroke="#10b981" strokeWidth={2} dot={false} name="Speed (km/h)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Corridor Congestion Score */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Congestion Index by Corridor (0-100)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Normalized Score</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={corridorData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="corridor" stroke="#64748b" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="congestionScore" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Signal Clearance Efficiency */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Traffic Signal Clearance Efficiency (%)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Green Wave Score</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signalEfficiency} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="signal" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="efficiency" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
