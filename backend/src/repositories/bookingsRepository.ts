import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface BookingFilters {
  status?: number;
  search?: string;
}

export interface PaginatedBookingsResult {
  bookings: Array<{
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
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class BookingsRepository {
  async findMany(
    filters: BookingFilters,
    pagination: PaginationParams
  ): Promise<PaginatedBookingsResult> {
    const where: Prisma.BookingWhereInput = {};

    // Status filter
    if (filters.status !== undefined) {
      where.status = filters.status;
    }

    // Search filter (name, mobile, vehicleNo, city)
    // Optimized: Only add OR clause if search exists
    if (filters.search && filters.search.trim().length > 0) {
      const searchTerm = filters.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { mobile: { contains: searchTerm } },
        { vehicleNo: { contains: searchTerm, mode: 'insensitive' } },
        { city: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Optimize: Run count and findMany in parallel
    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        // Only select needed fields for better performance
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          mobile: true,
          vehicleNo: true,
          status: true,
          comment: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);

    logger.debug('Repository query executed', {
      filters,
      pagination,
      total,
      returned: bookings.length,
    });

    return {
      bookings,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
    };
  }

  async findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
    });
  }

  async updateStatus(
    id: string,
    status: number,
    comment?: string | null
  ) {
    return prisma.booking.update({
      where: { id },
      data: {
        status,
        comment: comment !== undefined ? comment : undefined,
        updatedAt: new Date(),
      },
    });
  }

  async getCountsByStatus(): Promise<Record<number, number>> {
    const counts = await prisma.booking.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Initialize all statuses to 0
    const result: Record<number, number> = {
      1: 0, // New
      2: 0, // FollowUp
      3: 0, // Cancelled
      4: 0, // Completed
    };

    // Fill in actual counts
    counts.forEach(({ status, _count }) => {
      result[status] = _count.status;
    });

    return result;
  }

  async getTotalCount(): Promise<number> {
    return prisma.booking.count();
  }
}

export default new BookingsRepository();

