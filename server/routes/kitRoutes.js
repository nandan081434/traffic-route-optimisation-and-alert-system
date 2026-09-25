import { Router } from 'express';
import {
  getKits,
  getKit,
  addKit,
  editKit,
  removeKit,
  handleHardwareTelemetry
} from '../controllers/kitController.js';

const router = Router();

router.get('/', getKits);
router.post('/update', handleHardwareTelemetry); // IoT Microcontroller Ingest API
router.get('/:id', getKit);
router.post('/', addKit);
router.put('/:id', editKit);
router.delete('/:id', removeKit);

export default router;
