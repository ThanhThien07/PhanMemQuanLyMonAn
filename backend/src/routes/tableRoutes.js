import express from 'express';
import { getTables, updateTableStatus, createTable } from '../controllers/tableController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getTables);
router.post('/', authenticate, authorize('admin'), createTable);
router.patch('/:id/status', authenticate, updateTableStatus);

export default router;
