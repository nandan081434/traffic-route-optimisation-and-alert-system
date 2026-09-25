/**
 * SmartRoute - Construction Controller
 */

import {
  getAllConstruction,
  getConstructionById,
  createConstruction,
  updateConstruction,
  deleteConstruction
} from '../services/trafficService.js';
import { recalculateRoutes } from '../services/routeService.js';

export function getConstructions(req, res) {
  try {
    const list = getAllConstruction();
    res.json({ success: true, count: list.length, construction: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getConstruction(req, res) {
  try {
    const item = getConstructionById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: `Construction zone ${req.params.id} not found` });
    }
    res.json({ success: true, construction: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function addConstruction(req, res) {
  try {
    const { road, location } = req.body;
    if (!road || !location) {
      return res.status(400).json({ success: false, error: 'Road and location are required' });
    }
    const item = createConstruction(req.body);
    const routeResult = recalculateRoutes();

    res.status(201).json({ success: true, construction: item, routeRecalculated: routeResult.routeChanged });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function editConstruction(req, res) {
  try {
    const updated = updateConstruction(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Construction zone ${req.params.id} not found` });
    }
    const routeResult = recalculateRoutes();
    res.json({ success: true, construction: updated, routeRecalculated: routeResult.routeChanged });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function removeConstruction(req, res) {
  try {
    const deleted = deleteConstruction(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Construction zone ${req.params.id} not found` });
    }
    const routeResult = recalculateRoutes();
    res.json({ success: true, message: `Construction zone ${req.params.id} cleared` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
