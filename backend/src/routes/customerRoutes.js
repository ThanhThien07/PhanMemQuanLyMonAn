import express from 'express';
import { getCustomers, createCustomer } from '../controllers/customerController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getCustomers);
router.post('/', authenticate, createCustomer);

export default router;
