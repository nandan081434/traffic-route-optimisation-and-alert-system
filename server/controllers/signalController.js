/**
 * SmartRoute - Traffic Signal Controller
 */

import { getAllSignals, getSignalById, updateSignal, createSignal } from '../services/trafficService.js';

export function getSignals(req, res) {
  try {
    const signals = getAllSignals();
    res.json({ success: true, count: signals.length, signals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getSignal(req, res) {
  try {
    const signal = getSignalById(req.params.id);
    if (!signal) {
      return res.status(404).json({ success: false, error: `Signal ${req.params.id} not found` });
    }
    res.json({ success: true, signal });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function addSignal(req, res) {
  try {
    const { name, location, latitude, longitude } = req.body;
    if (!name || !location) {
      return res.status(400).json({ success: false, error: 'Name and location are required' });
    }
    const signal = createSignal(req.body);
    res.status(201).json({ success: true, signal });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function editSignal(req, res) {
  try {
    const updated = updateSignal(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Signal ${req.params.id} not found` });
    }
    res.json({ success: true, signal: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
