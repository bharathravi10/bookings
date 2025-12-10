import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingStatus } from '../types';
import { useBookingCounts } from '../contexts/BookingContext';

const statusConfig = {
  [BookingStatus.New]: {
    label: 'New Bookings',
    color: 'bg-blue-500 hover:bg-blue-600',
    countColor: 'text-blue-600',
  },
  [BookingStatus.FollowUp]: {
    label: 'Follow Up',
    color: 'bg-yellow-500 hover:bg-yellow-600',
    countColor: 'text-yellow-600',
  },
  [BookingStatus.Cancelled]: {
    label: 'Cancelled',
    color: 'bg-red-500 hover:bg-red-600',
    countColor: 'text-red-600',
  },
  [BookingStatus.Completed]: {
    label: 'Completed',
    color: 'bg-green-500 hover:bg-green-600',
    countColor: 'text-green-600',
  },
};

interface DashboardCardProps {
  status: BookingStatus;
  count: number;
  onClick: () => void;
}

const DashboardCard = memo(({ status, count, onClick }: DashboardCardProps) => {
  const config = statusConfig[status];

  return (
    <button
      onClick={onClick}
      className={`${config.color} text-white rounded-lg shadow-lg p-6 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white`}
    >
      <div className="text-2xl font-bold mb-2">{count}</div>
      <div className="text-sm font-medium">{config.label}</div>
    </button>
  );
});

DashboardCard.displayName = 'DashboardCard';

export default memo(function DashboardCards() {
  const counts = useBookingCounts();
  const navigate = useNavigate();

  const handleCardClick = useCallback((status: BookingStatus) => {
    navigate(`/bookings?status=${status}`);
  }, [navigate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <DashboardCard
        status={BookingStatus.New}
        count={counts[BookingStatus.New]}
        onClick={() => handleCardClick(BookingStatus.New)}
      />
      <DashboardCard
        status={BookingStatus.FollowUp}
        count={counts[BookingStatus.FollowUp]}
        onClick={() => handleCardClick(BookingStatus.FollowUp)}
      />
      <DashboardCard
        status={BookingStatus.Cancelled}
        count={counts[BookingStatus.Cancelled]}
        onClick={() => handleCardClick(BookingStatus.Cancelled)}
      />
      <DashboardCard
        status={BookingStatus.Completed}
        count={counts[BookingStatus.Completed]}
        onClick={() => handleCardClick(BookingStatus.Completed)}
      />
    </div>
  );
});
