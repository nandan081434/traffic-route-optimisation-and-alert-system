import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { api } from '../services/api.js';
import { AlertTriangle, CheckCircle, Send } from 'lucide-react';

export default function ReportIssueModal({ isOpen, onClose, onIssueSubmitted }) {
  const [type, setType] = useState('Accident');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('HIGH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const issueTypes = [
    'Accident',
    'Traffic Jam',
    'Construction',
    'Road Closed',
    'Flooded Road',
    'Broken Signal',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await api.addIncident({
        type,
        location,
        description: description || `Reported ${type} at ${location}`,
        severity,
        roadId: 'road-central-exp' // Default association
      });

      setSubmitted(true);
      if (onIssueSubmitted) onIssueSubmitted(res.incident);

      setTimeout(() => {
        setSubmitted(false);
        setLocation('');
        setDescription('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to report issue:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report a Road Traffic Issue">
      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
            <CheckCircle size={24} />
          </div>
          <h4 className="text-base font-bold text-white">Report Submitted Successfully</h4>
          <p className="text-xs text-slate-400">
            SmartRoute dynamic routing engine is recalculating road delays to avoid this zone.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Issue Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
            >
              {issueTypes.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Location / Junction
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Trinity Circle, Central Expressway..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Severity Level
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`py-1.5 rounded-lg font-bold border transition-all ${
                    severity === s
                      ? s === 'CRITICAL' || s === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description / Observations
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about lane blockage, water levels, or stalled vehicles..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !location.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 flex items-center gap-1.5 disabled:opacity-50 transition-all"
            >
              <Send size={13} />
              {isSubmitting ? 'Submitting...' : 'Submit Incident Report'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
