import React, { createContext, useContext, useState, useCallback } from 'react';
import { Booking } from '../types';
import { getBookings as getBookingsApi, updateBookingStatus as updateBookingStatusApi, getCounts as getCountsApi } from '../api/bookingsApi';

type Counts = { new: number; followup: number; cancelled: number; completed: number };

interface BookingContextType {
  counts: Counts;
  fetchCounts: () => Promise<void>;
  fetchBookings: (status: number, page: number, limit?: number) => Promise<{ data: Booking[]; total: number; page: number; limit: number } | null>;
  updateBookingStatus: (id: number, newStatus: number, comment: string | undefined, oldStatus?: number) => Promise<void>;
  toast: { message: string; type: 'success' | 'error' } | null;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = (): BookingContextType => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [counts, setCounts] = useState<Counts>({ new: 0, followup: 0, cancelled: 0, completed: 0 });
  const [cachedPages, setCachedPages] = useState<Record<string, any>>({});
  const [currentRequests, setCurrentRequests] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const data = await getCountsApi();
      setCounts(data);
    } catch (err) {
      console.error('fetchCounts', err);
    }
  }, []);

  const fetchBookings = useCallback(async (status: number, page: number, limit = 10) => {
    const key = `${status}-${page}-${limit}`;
    if (currentRequests.has(key)) return cachedPages[status]?.[page] ?? null;

    setCurrentRequests(prev => new Set(prev).add(key));
    try {
      const data = await getBookingsApi(status, page, limit);
      setCachedPages(prev => ({ ...prev, [status]: { ...(prev[status] || {}), [page]: { items: data.data, total: data.total } } }));
      return data;
    } catch (err) {
      console.error('fetchBookings', err);
      throw err;
    } finally {
      setCurrentRequests(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }, [currentRequests, cachedPages]);

  const getStatusKey = (status?: number) => {
    switch (status) {
      case 1: return 'new';
      case 2: return 'followup';
      case 3: return 'cancelled';
      case 4: return 'completed';
      default: return 'new';
    }
  };

  const updateBookingStatus = useCallback(async (id: number, newStatus: number, comment?: string, oldStatus?: number) => {
    setCounts(prev => ({
      ...prev,
      [getStatusKey(oldStatus)]: Math.max(0, (prev as any)[getStatusKey(oldStatus)] - 1),
      [getStatusKey(newStatus)]: (prev as any)[getStatusKey(newStatus)] + 1,
    }));

    if (oldStatus && cachedPages[oldStatus]) {
      setCachedPages(prev => {
        const updated = { ...prev };
        Object.keys(updated[oldStatus] || {}).forEach((page) => {
          updated[oldStatus][page] = {
            ...updated[oldStatus][page],
            items: updated[oldStatus][page].items.filter((b: Booking) => b.id !== id),
            total: Math.max(0, updated[oldStatus][page].total - 1),
          };
        });
        return updated;
      });
    }

    try {
      await updateBookingStatusApi(id, newStatus, comment);
      showToast('Status updated successfully', 'success');
      await fetchCounts();
    } catch (err: any) {
      setCounts(prev => ({
        ...prev,
        [getStatusKey(oldStatus)]: (prev as any)[getStatusKey(oldStatus)] + 1,
        [getStatusKey(newStatus)]: Math.max(0, (prev as any)[getStatusKey(newStatus)] - 1),
      }));
      showToast(err.response?.data?.error || 'Failed to update status', 'error');
      throw err;
    }
  }, [cachedPages, fetchCounts, showToast]);

  const value: BookingContextType = {
    counts, fetchCounts, fetchBookings, updateBookingStatus, toast
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

