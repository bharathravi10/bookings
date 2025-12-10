import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBookings } from '../contexts/BookingContext';
import DashboardCards from '../components/DashboardCards';

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const { refreshCounts } = useBookings();

  useEffect(() => {
    if (isAuthenticated) {
      refreshCounts();
    }
  }, [isAuthenticated, refreshCounts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Booking Dashboard</h1>
        <DashboardCards />
      </div>
    </div>
  );
}
