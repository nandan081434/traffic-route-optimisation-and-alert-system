import { Router } from 'express';
import { getTrafficOverview, getRoadTraffic, getHistoricalAnalytics } from '../controllers/trafficController.js';

const router = Router();

router.get('/', getTrafficOverview);
router.get('/analytics', getHistoricalAnalytics);
router.get('/:roadId', getRoadTraffic);

export default router;
