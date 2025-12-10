import { BookingsRepository } from '../repositories/bookingsRepository';
import { ApiError } from '../errors/ApiError';

export interface BookingDTO {
  id: string;
  name: string;
  address: string;
  city: string;
  mobile: string;
  vehicleNo: string;
  status: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingCountsDTO {
  [status: number]: number;
}

export interface PaginatedBookingsDTO {
  bookings: BookingDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateStatusDTO {
  status: number;
  comment?: string | null;
}

export class BookingsService {
  constructor(private repository: BookingsRepository) {}

  async getBookings(
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
    status?: number,
    search?: string
  ): Promise<PaginatedBookingsDTO> {
    // Validate pagination
    const validPage = Math.max(PAGINATION.DEFAULT_PAGE, page);
    const validLimit = Math.min(
      Math.max(PAGINATION.MIN_LIMIT, limit),
      PAGINATION.MAX_LIMIT
    );

    // Validate status if provided
    if (status !== undefined && !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
      throw new ApiError(400, 'Invalid status value');
    }

    const skip = (validPage - 1) * validLimit;

    const result = await this.repository.findMany(
      { status, search },
      { page: validPage, limit: validLimit, skip }
    );

    logger.debug(`Retrieved ${result.bookings.length} bookings`, {
      page: validPage,
      limit: validLimit,
      total: result.total,
    });

    return {
      bookings: result.bookings,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getBookingById(id: string): Promise<BookingDTO> {
    const booking = await this.repository.findById(id);

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    return booking;
  }

  async updateBookingStatus(
    id: string,
    updateData: UpdateStatusDTO
  ): Promise<BookingDTO> {
    // Validate status
    if (!VALID_STATUSES.includes(updateData.status as typeof VALID_STATUSES[number])) {
      throw new ApiError(400, 'Invalid status value');
    }

    // Check if booking exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      logger.warn('Attempted to update non-existent booking', { id });
      throw new ApiError(404, 'Booking not found');
    }

    // Update booking
    const updated = await this.repository.updateStatus(
      id,
      updateData.status,
      updateData.comment
    );

    logger.info('Booking status updated', {
      id,
      oldStatus: existing.status,
      newStatus: updateData.status,
    });

    return updated;
  }

  async getBookingCounts(): Promise<BookingCountsDTO> {
    return this.repository.getCountsByStatus();
  }
}

export default new BookingsService(new BookingsRepository());

