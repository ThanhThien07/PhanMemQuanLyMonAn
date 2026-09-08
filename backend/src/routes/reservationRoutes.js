import express from 'express';
import { getReservations, createReservation, checkinReservation, cancelReservation } from '../controllers/reservationController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getReservations);
router.post('/', authenticate, createReservation);
router.patch('/:id/checkin', authenticate, checkinReservation);
router.patch('/:id/cancel', authenticate, cancelReservation);

export default router;
