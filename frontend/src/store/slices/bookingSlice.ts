import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Booking, BookingCounts, BookingStatus, PaginatedResponse } from '../../types';
import { bookingsApi } from '../../api/bookings';

interface BookingState {
  bookings: Booking[];
  counts: BookingCounts;
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  statusFilter: number | undefined;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  cachedPages: Record<string, PaginatedResponse<Booking>>;
}

const initialState: BookingState = {
  bookings: [],
  counts: {
    [BookingStatus.New]: 0,
    [BookingStatus.FollowUp]: 0,
    [BookingStatus.Cancelled]: 0,
    [BookingStatus.Completed]: 0,
  },
  currentPage: 1,
  totalPages: 0,
  total: 0,
  limit: 10,
  statusFilter: undefined,
  searchQuery: '',
  loading: false,
  error: null,
  cachedPages: {},
};

// Helper to generate cache key
const getCacheKey = (status?: number, page?: number, limit?: number, search?: string): string => {
  return `${status ?? 'all'}-${page ?? 1}-${limit ?? 10}-${search ?? ''}`;
};

// Async thunks
export const fetchBookings = createAsyncThunk(
  'booking/fetchBookings',
  async (
    { status, page, limit, search }: { status?: number; page?: number; limit?: number; search?: string },
    { getState }
  ) => {
    const state = getState() as { booking: BookingState };
    const cacheKey = getCacheKey(status, page, limit, search);
    const cached = state.booking.cachedPages[cacheKey];

    if (cached) {
      return { response: cached, cacheKey, fromCache: true };
    }

    const response = await bookingsApi.getBookings({
      status,
      page: page ?? state.booking.currentPage,
      limit: limit ?? state.booking.limit,
      search,
    });

    return { response, cacheKey, fromCache: false };
  }
);

export const updateBookingStatus = createAsyncThunk(
  'booking/updateStatus',
  async (
    { id, status, comment }: { id: string; status: BookingStatus; comment?: string },
    { dispatch }
  ) => {
    const updated = await bookingsApi.updateBookingStatus(id, status, comment);
    // Refresh counts after update
    dispatch(fetchBookingCounts());
    // Clear cache to force refresh
    dispatch(clearCache());
    return updated;
  }
);

export const fetchBookingCounts = createAsyncThunk('booking/fetchCounts', async () => {
  return await bookingsApi.getBookingCounts();
});

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<number | undefined>) => {
      state.statusFilter = action.payload;
      state.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearCache: (state) => {
      state.cachedPages = {};
    },
    // Optimistic update for immediate UI feedback
    optimisticUpdateBooking: (state, action: PayloadAction<Booking>) => {
      const booking = action.payload;
      const oldBooking = state.bookings.find((b) => b.id === booking.id);
      
      // If status changed from New, remove from list
      if (oldBooking?.status === BookingStatus.New && booking.status !== BookingStatus.New) {
        state.bookings = state.bookings.filter((b) => b.id !== booking.id);
        state.total = Math.max(0, state.total - 1);
      } else {
        // Otherwise, update the booking
        state.bookings = state.bookings.map((b) => (b.id === booking.id ? booking : b));
      }
    },
    // Rollback optimistic update
    rollbackBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings = state.bookings.map((b) => (b.id === action.payload.id ? action.payload : b));
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch bookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const { response, cacheKey, fromCache } = action.payload;
        state.bookings = response.items;
        state.total = response.total;
        state.currentPage = response.page;
        state.totalPages = Math.ceil(response.total / response.limit);
        state.limit = response.limit;

        // Only cache if it's a new response
        if (!fromCache) {
          state.cachedPages[cacheKey] = response;
        }
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bookings';
      })
      // Update booking status
      .addCase(updateBookingStatus.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.bookings = state.bookings.map((b) =>
          b.id === action.payload.id ? action.payload : b
        );
      })
      // Fetch counts
      .addCase(fetchBookingCounts.fulfilled, (state, action: PayloadAction<BookingCounts>) => {
        state.counts = action.payload;
      });
  },
});

export const {
  setStatusFilter,
  setSearchQuery,
  setCurrentPage,
  clearCache,
  optimisticUpdateBooking,
  rollbackBooking,
} = bookingSlice.actions;
export default bookingSlice.reducer;

