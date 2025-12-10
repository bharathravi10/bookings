import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getBookingsQuerySchema, updateBookingStatusSchema } from '../types';
import bookingsService from '../services/bookingsService';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import { PAGINATION } from '../utils/constants';

/**
 * Get paginated bookings with filters
 * GET /api/bookings?page=1&limit=20&status=1&search=query
 */
export const getBookings = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const validated = getBookingsQuerySchema.parse(req.query);
  const { status, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, search } = validated;

  // Validate pagination limits
  const validPage = Math.max(PAGINATION.DEFAULT_PAGE, page);
  const validLimit = Math.min(Math.max(PAGINATION.MIN_LIMIT, limit), PAGINATION.MAX_LIMIT);

  logger.debug('Fetching bookings', { page: validPage, limit: validLimit, status, search });

  const result = await bookingsService.getBookings(
    validPage,
    validLimit,
    status,
    search
  );

  logger.info(`Fetched ${result.bookings.length} bookings (page ${result.page})`);

  // Return in format expected by frontend
  res.json({
    items: result.bookings,
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

/**
 * Get booking by ID
 * GET /api/bookings/:id
 */
export const getBookingById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Booking ID is required' });
    return;
  }

  logger.debug('Fetching booking by ID', { id });
  const booking = await bookingsService.getBookingById(id);
  res.json(booking);
});

/**
 * Update booking status
 * PATCH /api/bookings/:id/status
 */
export const updateBookingStatus = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const validated = updateBookingStatusSchema.parse(req.body);
  const { status, comment } = validated;

  if (!id) {
    res.status(400).json({ error: 'Booking ID is required' });
    return;
  }

  logger.info('Updating booking status', { id, status, userId: req.user?.userId });
  const updatedBooking = await bookingsService.updateBookingStatus(id, {
    status,
    comment,
  });

  logger.info('Booking status updated successfully', { id, status });
  res.json(updatedBooking);
});

/**
 * Get booking counts by status
 * GET /api/bookings/counts
 */
export const getBookingCounts = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  logger.debug('Fetching booking counts');
  const counts = await bookingsService.getBookingCounts();
  res.json(counts);
});

export async function seedBookings(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({ error: 'Seed endpoint disabled in production' });
      return;
    }

    const count = parseInt(req.body.count || '50', 10);

    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'];
    const names = [
      'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy',
      'Vikram Singh', 'Anjali Mehta', 'Rahul Gupta', 'Kavita Nair',
    ];

    const bookings = Array.from({ length: count }, (_, i) => ({
      name: names[i % names.length],
      address: `${Math.floor(Math.random() * 999) + 1} Main Street`,
      city: cities[i % cities.length],
      mobile: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      vehicleNo: `MH${Math.floor(Math.random() * 100)}${String.fromCharCode(65 + (i % 26))}${Math.floor(Math.random() * 10000)}`,
      status: (i % 4) + 1 as BookingStatus,
      comment: i % 3 === 0 ? `Comment ${i + 1}` : null,
    }));

    await prisma.booking.createMany({
      data: bookings,
      skipDuplicates: true,
    });

    res.json({ message: `Created ${count} bookings` });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

