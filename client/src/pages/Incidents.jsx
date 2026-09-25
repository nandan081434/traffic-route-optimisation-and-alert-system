import React, { useState } from 'react';
import IncidentCard from '../components/IncidentCard.jsx';
import { AlertTriangle, Plus, Search, Filter } from 'lucide-react';

export default function Incidents({ incidents = [], onOpenReportModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const incidentTypes = ['ALL', 'Accident', 'Traffic Jam', 'Road Blockage', 'Flooded Road', 'Broken Signal', 'Emergency Closure'];
  const severities = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const filtered = incidents.filter((inc) => {
    const matchesType = typeFilter === 'ALL' || inc.type === typeFilter;
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    const matchesSearch =
      inc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.description && inc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              ROAD INCIDENTS & HAZARDS
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
              REAL-TIME HAZARD FEED
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Collisions, waterlogging, blockages, and emergency closures directly weighted by the routing engine.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          Report New Incident
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by location or description..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {severities.map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap ${
                  severityFilter === sev
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Type pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {incidentTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-slate-800 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900/40 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>
    </div>
  );
}
