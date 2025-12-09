import React, { memo, useMemo } from 'react';
import StatusButtons from './StatusButtons';
import { Booking } from '../types';
import './BookingTable.css';

interface BookingRowProps {
  booking: Booking;
  onStatusUpdate: (id: number, status: number, comment: string | null | undefined, oldStatus?: number) => void;
}

const BookingRow = memo<BookingRowProps>(({ booking, onStatusUpdate }) => {
  return (
    <tr>
      <td>{booking.name}</td>
      <td>{booking.address}</td>
      <td>{booking.city}</td>
      <td>{booking.mobile}</td>
      <td>{booking.vehicle_number}</td>
      <td>
        <StatusButtons booking={booking} onStatusUpdate={onStatusUpdate} />
      </td>
    </tr>
  );
});

BookingRow.displayName = 'BookingRow';

interface BookingTableProps {
  bookings: Booking[];
  onStatusUpdate: (id: number, status: number, comment: string | null | undefined, oldStatus?: number) => void;
}

const BookingTable = memo<BookingTableProps>(({ bookings, onStatusUpdate }) => {
  const rows = useMemo(
    () =>
      bookings.map((booking) => (
        <BookingRow
          key={booking.id}
          booking={booking}
          onStatusUpdate={onStatusUpdate}
        />
      )),
    [bookings, onStatusUpdate]
  );

  return (
    <div className="booking-table-container">
      <table className="booking-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>City</th>
            <th>Mobile</th>
            <th>Vehicle Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
});

BookingTable.displayName = 'BookingTable';

export default BookingTable;

