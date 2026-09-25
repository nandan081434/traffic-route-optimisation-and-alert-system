import { Router } from 'express';
import {
  getConstructions,
  getConstruction,
  addConstruction,
  editConstruction,
  removeConstruction
} from '../controllers/constructionController.js';

const router = Router();

router.get('/', getConstructions);
router.get('/:id', getConstruction);
router.post('/', addConstruction);
router.put('/:id', editConstruction);
router.delete('/:id', removeConstruction);

export default router;
