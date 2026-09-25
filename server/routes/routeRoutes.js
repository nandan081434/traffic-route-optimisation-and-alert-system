import { Router } from 'express';
import {
  calculateRoutesHandler,
  getCurrentRoutes,
  triggerHeavyTraffic,
  triggerAccident,
  triggerConstruction,
  triggerRoadClosure,
  triggerResetTraffic,
  triggerDemoStep,
  toggleSimulatorHandler
} from '../controllers/routeController.js';

const router = Router();

router.get('/', getCurrentRoutes);
router.post('/calculate', calculateRoutesHandler);
router.post('/simulate-heavy-traffic', triggerHeavyTraffic);
router.post('/simulate-accident', triggerAccident);
router.post('/simulate-construction', triggerConstruction);
router.post('/simulate-closure', triggerRoadClosure);
router.post('/reset-traffic', triggerResetTraffic);
router.post('/demo-step', triggerDemoStep);
router.post('/simulation-control', toggleSimulatorHandler);

export default router;
