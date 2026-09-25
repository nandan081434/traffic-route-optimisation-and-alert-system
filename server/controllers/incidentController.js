/**
 * SmartRoute - Incident Controller
 */

import {
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident
} from '../services/trafficService.js';
import { recalculateRoutes } from '../services/routeService.js';

export function getIncidents(req, res) {
  try {
    const incidents = getAllIncidents();
    res.json({ success: true, count: incidents.length, incidents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getIncident(req, res) {
  try {
    const incident = getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, error: `Incident ${req.params.id} not found` });
    }
    res.json({ success: true, incident });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function addIncident(req, res) {
  try {
    const { type, location, severity, description } = req.body;
    if (!type || !location) {
      return res.status(400).json({ success: false, error: 'Incident type and location are required' });
    }
    const incident = createIncident(req.body);
    const routeResult = recalculateRoutes();

    res.status(201).json({
      success: true,
      incident,
      routeRecalculated: routeResult.routeChanged
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function editIncident(req, res) {
  try {
    const updated = updateIncident(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Incident ${req.params.id} not found` });
    }
    const routeResult = recalculateRoutes();
    res.json({ success: true, incident: updated, routeRecalculated: routeResult.routeChanged });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function removeIncident(req, res) {
  try {
    const deleted = deleteIncident(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Incident ${req.params.id} not found` });
    }
    const routeResult = recalculateRoutes();
    res.json({ success: true, message: `Incident ${req.params.id} cleared` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
