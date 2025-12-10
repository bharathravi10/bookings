import { memo, useState, useCallback } from 'react';
import { Booking, BookingStatus } from '../types';
import { useBookings } from '../contexts/BookingContext';
import StatusModal from './StatusModal';
import Toast from './Toast';

interface BookingRowProps {
  booking: Booking;
}

const BookingRow = memo(({ booking }: BookingRowProps) => {
  const { updateBookingStatus } = useBookings();
  const [modalStatus, setModalStatus] = useState<BookingStatus | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusClick = useCallback(
    (status: BookingStatus) => {
      if (status === BookingStatus.Completed) {
        if (window.confirm('Mark this booking as completed?')) {
          handleStatusUpdate(status);
        }
      } else {
        setModalStatus(status);
      }
    },
    []
  );

  const handleStatusUpdate = useCallback(
    async (status: BookingStatus, comment?: string) => {
      setIsUpdating(true);
      try {
        await updateBookingStatus(booking.id, status, comment);
        setToast({ message: 'Status updated successfully', type: 'success' });
        setModalStatus(null);
      } catch (error: any) {
        // Error handling is done in context (rollback)
        setToast({
          message: error?.response?.data?.error || 'Failed to update status',
          type: 'error',
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [booking.id, updateBookingStatus]
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <tr className="bg-white border-b hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {booking.name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.mobile}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.vehicleNo}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {booking.city}, {booking.address}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDate(booking.createdAt)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {booking.status === BookingStatus.New && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleStatusClick(BookingStatus.FollowUp)}
                disabled={isUpdating}
                className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Follow Up
              </button>
              <button
                onClick={() => handleStatusClick(BookingStatus.Cancelled)}
                disabled={isUpdating}
                className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusClick(BookingStatus.Completed)}
                disabled={isUpdating}
                className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Completed
              </button>
            </div>
          )}
          {booking.status === BookingStatus.FollowUp && (
            <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
              Follow Up
            </span>
          )}
          {booking.status === BookingStatus.Cancelled && (
            <span className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
              Cancelled
            </span>
          )}
          {booking.status === BookingStatus.Completed && (
            <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
              Completed
            </span>
          )}
        </td>
      </tr>

      <StatusModal
        isOpen={modalStatus !== null}
        onClose={() => setModalStatus(null)}
        onSubmit={(comment) => handleStatusUpdate(modalStatus!, comment)}
        status={modalStatus || BookingStatus.New}
        bookingName={booking.name}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
});

BookingRow.displayName = 'BookingRow';

interface BookingTableProps {
  bookings: Booking[];
}

export default memo(function BookingTable({ bookings }: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No bookings found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mobile
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vehicle No
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </tbody>
      </table>
    </div>
  );
});
