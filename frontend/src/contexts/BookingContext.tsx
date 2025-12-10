import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import axios from 'axios';
import { Booking, BookingCounts, BookingStatus } from '../types';
import { bookingsApi } from '../api/bookings';

// Types
interface BookingState {
  bookings: Booking[];
  counts: BookingCounts;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  total: number;
  statusFilter: number | null;
  searchQuery: string;
  // Cache for paginated results
  pagesCache: Map<string, PaginatedResult>;
}

interface PaginatedResult {
  bookings: Booking[];
  page: number;
  totalPages: number;
  total: number;
}

type BookingAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { bookings: Booking[]; page: number; totalPages: number; total: number } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_COUNTS'; payload: BookingCounts }
  | { type: 'SET_STATUS_FILTER'; payload: number | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'OPTIMISTIC_UPDATE'; payload: { id: string; status: number; comment?: string | null } }
  | { type: 'ROLLBACK_UPDATE'; payload: { id: string; oldBooking: Booking } }
  | { type: 'CACHE_PAGE'; payload: { key: string; result: PaginatedResult } };

const initialState: BookingState = {
  bookings: [],
  counts: {
    [BookingStatus.New]: 0,
    [BookingStatus.FollowUp]: 0,
    [BookingStatus.Cancelled]: 0,
    [BookingStatus.Completed]: 0,
  },
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  total: 0,
  statusFilter: null,
  searchQuery: '',
  pagesCache: new Map(),
};

function bookingReducer(
  state: BookingState,
  action: BookingAction
): BookingState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        bookings: action.payload.bookings,
        currentPage: action.payload.page,
        totalPages: action.payload.totalPages,
        total: action.payload.total,
        error: null,
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case 'SET_COUNTS':
      return {
        ...state,
        counts: action.payload,
      };

    case 'SET_STATUS_FILTER':
      return {
        ...state,
        statusFilter: action.payload,
        currentPage: 1, // Reset to first page on filter change
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
        currentPage: 1, // Reset to first page on search
      };

    case 'OPTIMISTIC_UPDATE': {
      const { id, status, comment } = action.payload;
      const updatedBookings = state.bookings.map((booking) =>
        booking.id === id
          ? { ...booking, status, comment: comment ?? booking.comment }
          : booking
      );

      // Optimistically update counts
      const oldBooking = state.bookings.find((b) => b.id === id);
      const newCounts: BookingCounts = { ...state.counts };
      if (oldBooking) {
        const oldStatus = oldBooking.status as keyof BookingCounts;
        newCounts[oldStatus] = Math.max(0, newCounts[oldStatus] - 1);
      }
      const newStatus = status as keyof BookingCounts;
      newCounts[newStatus] = (newCounts[newStatus] || 0) + 1;

      return {
        ...state,
        bookings: updatedBookings,
        counts: newCounts,
      };
    }

    case 'ROLLBACK_UPDATE': {
      const { id, oldBooking } = action.payload;
      const rolledBackBookings = state.bookings.map((booking) =>
        booking.id === id ? oldBooking : booking
      );

      // Rollback counts
      const newCounts: BookingCounts = { ...state.counts };
      const currentBooking = state.bookings.find((b) => b.id === id);
      if (currentBooking) {
        const currentStatus = currentBooking.status as keyof BookingCounts;
        newCounts[currentStatus] = Math.max(0, newCounts[currentStatus] - 1);
      }
      const oldStatus = oldBooking.status as keyof BookingCounts;
      newCounts[oldStatus] = (newCounts[oldStatus] || 0) + 1;

      return {
        ...state,
        bookings: rolledBackBookings,
        counts: newCounts,
      };
    }

    case 'CACHE_PAGE': {
      const newCache = new Map(state.pagesCache);
      newCache.set(action.payload.key, action.payload.result);
      return {
        ...state,
        pagesCache: newCache,
      };
    }

    default:
      return state;
  }
}

interface BookingContextType {
  // State
  bookings: Booking[];
  counts: BookingCounts;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  total: number;
  statusFilter: number | null;
  searchQuery: string;

  // Actions
  fetchBookings: (params: {
    page?: number;
    limit?: number;
    status?: number;
    search?: string;
  }) => Promise<void>;
  updateBookingStatus: (
    id: string,
    status: number,
    comment?: string | null
  ) => Promise<void>;
  refreshCounts: () => Promise<void>;
  setStatusFilter: (status: number | null) => void;
  setSearchQuery: (query: string) => void;
  getCachedPage: (page: number, status?: number, search?: string) => PaginatedResult | null;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

interface BookingProviderProps {
  children: ReactNode;
}

export function BookingProvider({ children }: BookingProviderProps) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Generate cache key
  const getCacheKey = useCallback(
    (page: number, status?: number, search?: string) => {
      return `${page}-${status || 'all'}-${search || ''}`;
    },
    []
  );

  // Fetch bookings with caching
  const fetchBookings = useCallback(
    async (params: {
      page?: number;
      limit?: number;
      status?: number;
      search?: string;
    }) => {
      const page = params.page || 1;
      const status = params.status;
      const search = params.search || '';

      // Check cache first
      const cacheKey = getCacheKey(page, status, search);
      const cached = state.pagesCache.get(cacheKey);
      if (cached) {
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            bookings: cached.bookings,
            page: cached.page,
            totalPages: cached.totalPages,
            total: cached.total,
          },
        });
        return;
      }

      dispatch({ type: 'FETCH_START' });
      try {
        const result = await bookingsApi.getBookings({
          page,
          limit: params.limit || 20,
          status,
          search,
          cancelToken: 'bookings-fetch', // Cancel previous request
        });

        const totalPages = Math.ceil(result.total / result.limit);

        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            bookings: result.items,
            page: result.page,
            totalPages,
            total: result.total,
          },
        });

        // Cache the result
        dispatch({
          type: 'CACHE_PAGE',
          payload: {
            key: cacheKey,
            result: {
              bookings: result.items,
              page: result.page,
              totalPages,
              total: result.total,
            },
          },
        });
      } catch (error: unknown) {
        if (axios.isCancel(error)) {
          // Request was cancelled, ignore
          return;
        }
        const errorMessage =
          (error as any)?.response?.data?.error || (error as any)?.message || 'Failed to fetch bookings';
        dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      }
    },
    [state.pagesCache, getCacheKey]
  );

  // Update booking status with optimistic update
  const updateBookingStatus = useCallback(
    async (id: string, status: number, comment?: string | null) => {
      // Find current booking for rollback
      const oldBooking = state.bookings.find((b) => b.id === id);
      if (!oldBooking) {
        throw new Error('Booking not found');
      }

      // Optimistic update
      dispatch({
        type: 'OPTIMISTIC_UPDATE',
        payload: { id, status, comment },
      });

      try {
        await bookingsApi.updateBookingStatus(id, status, comment);
        // Refresh counts after successful update
        await refreshCounts();
      } catch (error: unknown) {
        // Rollback on error
        dispatch({
          type: 'ROLLBACK_UPDATE',
          payload: { id, oldBooking },
        });
        throw error;
      }
    },
    [state.bookings]
  );

  // Refresh counts
  const refreshCounts = useCallback(async () => {
    try {
      const counts = await bookingsApi.getBookingCounts();
      dispatch({ type: 'SET_COUNTS', payload: counts });
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        return;
      }
      console.error('Failed to refresh counts:', error);
    }
  }, []);

  // Set status filter
  const setStatusFilter = useCallback((status: number | null) => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: status });
  }, []);

  // Set search query
  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  // Get cached page
  const getCachedPage = useCallback(
    (page: number, status?: number, search?: string): PaginatedResult | null => {
      const cacheKey = getCacheKey(page, status, search);
      return state.pagesCache.get(cacheKey) || null;
    },
    [state.pagesCache, getCacheKey]
  );

  const value: BookingContextType = useMemo(
    () => ({
      bookings: state.bookings,
      counts: state.counts,
      loading: state.loading,
      error: state.error,
      currentPage: state.currentPage,
      totalPages: state.totalPages,
      total: state.total,
      statusFilter: state.statusFilter,
      searchQuery: state.searchQuery,
      fetchBookings,
      updateBookingStatus,
      refreshCounts,
      setStatusFilter,
      setSearchQuery,
      getCachedPage,
    }),
    [
      state,
      fetchBookings,
      updateBookingStatus,
      refreshCounts,
      setStatusFilter,
      setSearchQuery,
      getCachedPage,
    ]
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBookings(): BookingContextType {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}

// Selector hooks to prevent unnecessary re-renders
export function useBookingCounts(): BookingCounts {
  const { counts } = useBookings();
  return counts;
}

export function useBookingList(): Booking[] {
  const { bookings } = useBookings();
  return bookings;
}

