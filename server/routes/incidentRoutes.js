import { Router } from 'express';
import {
  getIncidents,
  getIncident,
  addIncident,
  editIncident,
  removeIncident
} from '../controllers/incidentController.js';

const router = Router();

router.get('/', getIncidents);
router.get('/:id', getIncident);
router.post('/', addIncident);
router.put('/:id', editIncident);
router.delete('/:id', removeIncident);

export default router;
