import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBookings } from '../contexts/BookingContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import BookingTable from '../components/BookingTable';
import Pagination from '../components/Pagination';
import { BookingStatus } from '../types';

export default function Bookings() {
  const { isAuthenticated } = useAuth();
  const {
    bookings,
    loading,
    error,
    currentPage,
    totalPages,
    statusFilter,
    searchQuery,
    fetchBookings,
    setStatusFilter,
    setSearchQuery,
  } = useBookings();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState('');

  // Debounce search input
  const debouncedSearch = useDebouncedValue(localSearch, 500);

  const statusParam = useMemo(() => {
    const status = searchParams.get('status');
    return status ? parseInt(status, 10) : undefined;
  }, [searchParams]);

  const pageParam = useMemo(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  }, [searchParams]);

  // Sync URL params with state
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (statusParam !== undefined && statusParam !== statusFilter) {
      setStatusFilter(statusParam);
    } else if (statusParam === undefined && statusFilter !== null) {
      setStatusFilter(null);
    }
  }, [statusParam, statusFilter, setStatusFilter]);

  useEffect(() => {
    const search = searchParams.get('search') || '';
    setLocalSearch(search);
    if (search !== searchQuery) {
      setSearchQuery(search);
    }
  }, [searchParams, searchQuery, setSearchQuery]);

  // Fetch bookings when filters/page change
  useEffect(() => {
    fetchBookings({
      page: pageParam,
      limit: 20,
      status: statusParam,
      search: debouncedSearch || undefined,
    });
  }, [pageParam, statusParam, debouncedSearch, fetchBookings]);

  // Update URL when search changes
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      setSearchQuery(debouncedSearch);
      const newParams = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        newParams.set('search', debouncedSearch);
      } else {
        newParams.delete('search');
      }
      newParams.set('page', '1');
      setSearchParams(newParams, { replace: true });
    }
  }, [debouncedSearch, searchQuery, searchParams, setSearchParams, setSearchQuery]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSearch(e.target.value);
    },
    []
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', page.toString());
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleStatusFilterChange = useCallback(
    (status: number | null) => {
      setStatusFilter(status);
      const newParams = new URLSearchParams(searchParams);
      if (status) {
        newParams.set('status', status.toString());
      } else {
        newParams.delete('status');
      }
      newParams.set('page', '1');
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams, setStatusFilter]
  );

  const getStatusLabel = () => {
    if (!statusParam) return 'All Bookings';
    switch (statusParam) {
      case BookingStatus.New:
        return 'New Bookings';
      case BookingStatus.FollowUp:
        return 'Follow Up Bookings';
      case BookingStatus.Cancelled:
        return 'Cancelled Bookings';
      case BookingStatus.Completed:
        return 'Completed Bookings';
      default:
        return 'All Bookings';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{getStatusLabel()}</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, mobile, vehicle no, or city..."
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilterChange(null)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === null
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            All
          </button>
          {Object.values(BookingStatus).filter(v => typeof v === 'number').map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilterChange(status as number)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {status === BookingStatus.New && 'New'}
              {status === BookingStatus.FollowUp && 'Follow Up'}
              {status === BookingStatus.Cancelled && 'Cancelled'}
              {status === BookingStatus.Completed && 'Completed'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        ) : (
          <>
            <BookingTable bookings={bookings} />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
