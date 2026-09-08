import express from 'express';
import { getDishes, getCategories, getDishById, createDish, updateDish, deleteDish } from '../controllers/dishController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/', getDishes);
router.get('/:id', getDishById);
router.post('/', authenticate, authorize('admin', 'bep'), createDish);
router.put('/:id', authenticate, authorize('admin', 'bep'), updateDish);
router.delete('/:id', authenticate, authorize('admin'), deleteDish);

export default router;
