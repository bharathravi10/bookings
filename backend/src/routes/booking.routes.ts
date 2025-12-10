import { Router } from 'express';
import {
  getBookings,
  getBookingById,
  updateBookingStatus,
  getBookingCounts,
} from '../controllers/booking.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public routes (no auth required)
router.get('/counts', getBookingCounts);

// Protected routes (require authentication)
router.use(authMiddleware);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);

export default router;

