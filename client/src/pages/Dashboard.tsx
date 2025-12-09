import React, { useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import CardStat from '../components/CardStat';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { counts, fetchCounts } = useBooking();

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return (
    <div className="dashboard">
      <h2>Booking Dashboard</h2>
      <div className="stats-grid">
        <CardStat
          title="New Bookings"
          count={counts.new}
          status={1}
          color="#3498db"
        />
        <CardStat
          title="Follow Up"
          count={counts.followup}
          status={2}
          color="#f39c12"
        />
        <CardStat
          title="Cancelled"
          count={counts.cancelled}
          status={3}
          color="#e74c3c"
        />
        <CardStat
          title="Completed"
          count={counts.completed}
          status={4}
          color="#27ae60"
        />
      </div>
    </div>
  );
};

export default Dashboard;

