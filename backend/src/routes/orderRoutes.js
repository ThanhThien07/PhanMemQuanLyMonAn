import express from 'express';
import { getOrders, getKitchenOrders, createOrder, updateOrderStatus, payBill } from '../controllers/orderController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getOrders);
router.get('/kitchen', getKitchenOrders);
router.post('/', authenticate, createOrder);
router.patch('/:id/status', authenticate, updateOrderStatus);
router.post('/pay/:ban_id', authenticate, payBill);

export default router;
