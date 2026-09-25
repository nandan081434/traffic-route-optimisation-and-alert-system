import { Router } from 'express';
import { getSignals, getSignal, addSignal, editSignal } from '../controllers/signalController.js';

const router = Router();

router.get('/', getSignals);
router.get('/:id', getSignal);
router.post('/', addSignal);
router.put('/:id', editSignal);

export default router;
