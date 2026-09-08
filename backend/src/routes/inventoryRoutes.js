import express from 'express';
import { getIngredients, updateStock, createIngredient, getSuppliers } from '../controllers/inventoryController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/ingredients', getIngredients);
router.post('/ingredients', authenticate, authorize('admin', 'bep'), createIngredient);
router.patch('/ingredients/:id/stock', authenticate, updateStock);
router.get('/suppliers', getSuppliers);

export default router;
