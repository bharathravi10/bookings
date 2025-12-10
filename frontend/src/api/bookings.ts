import { apiClient } from './client';
import { Booking, BookingCounts, PaginatedResponse } from '../types';

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  status?: number;
  search?: string;
  cancelToken?: string; // Key for request cancellation
}

export const bookingsApi = {
  /**
   * Get paginated bookings
   */
  async getBookings(params: GetBookingsParams = {}): Promise<PaginatedResponse<Booking>> {
    const { cancelToken } = params;
    
    const config: any = {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        ...(params.status && { status: params.status }),
        ...(params.search && { search: params.search }),
      },
    };

    // Add cancel token if provided
    if (cancelToken) {
      const source = apiClient.createCancelToken(cancelToken);
      config.cancelToken = source.token;
    }

    const response = await apiClient.instance.get<PaginatedResponse<Booking>>(
      '/bookings',
      config
    );
    return response.data;
  },

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    const response = await apiClient.instance.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Update booking status
   */
  async updateBookingStatus(
    id: string,
    status: number,
    comment?: string | null
  ): Promise<Booking> {
    const response = await apiClient.instance.patch<Booking>(
      `/bookings/${id}/status`,
      { status, comment }
    );
    return response.data;
  },

  /**
   * Get booking counts by status
   */
  async getBookingCounts(): Promise<BookingCounts> {
    const response = await apiClient.instance.get<BookingCounts>(
      '/bookings/counts'
    );
    return response.data;
  },
};

