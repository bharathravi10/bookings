import React, { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { usePaginatedBookings } from '../hooks/usePaginatedBookings';
import BookingTable from '../components/BookingTable';
import Pagination from '../components/Pagination';
import './BookingsPage.css';

const BookingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = parseInt(searchParams.get('status') || '1', 10);
  const { updateBookingStatus } = useBooking();
  const { bookings, total, page, setPage, loading } = usePaginatedBookings(status, 10);

  useEffect(() => {
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    setPage(pageParam);
  }, [searchParams, setPage]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      setSearchParams({ status: status.toString(), page: newPage.toString() });
    },
    [status, setPage, setSearchParams]
  );

  const handleStatusUpdate = useCallback(
    async (id: number, newStatus: number, comment: string | null | undefined, oldStatus?: number) => {
      await updateBookingStatus(id, newStatus, comment, oldStatus);
    },
    [updateBookingStatus]
  );

  const statusLabels: Record<number, string> = {
    1: 'New Bookings',
    2: 'Follow Up',
    3: 'Cancelled',
    4: 'Completed',
  };

  return (
    <div className="bookings-page">
      <h2>{statusLabels[status] || 'Bookings'}</h2>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <BookingTable bookings={bookings} onStatusUpdate={handleStatusUpdate} />
          <Pagination
            currentPage={page}
            total={total}
            limit={10}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default BookingsPage;

