import { useState, useEffect, useCallback } from 'react';
import { useBooking } from '../context/BookingContext';
import { Booking } from '../types';

export const usePaginatedBookings = (status: number, pageSize = 10) => {
  const { fetchBookings } = useBooking();
  const [page, setPage] = useState<number>(1);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBookings(status, page, pageSize);
      setBookings(data?.data || []);
      setTotal(data?.total || 0);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [status, page, pageSize, fetchBookings]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  return { bookings, total, page, setPage, loading, refetch: loadBookings };
};

