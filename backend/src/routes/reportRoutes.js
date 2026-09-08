import express from 'express';
import { getDashboardSummary } from '../controllers/reportController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/summary', authenticate, getDashboardSummary);

export default router;
