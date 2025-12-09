import express from 'express';
import { getBookings, updateBookingStatus, getCounts } from '../controllers/bookingsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/counts', getCounts);
router.get('/', getBookings);
router.patch('/:id/status', updateBookingStatus);

export default router;

