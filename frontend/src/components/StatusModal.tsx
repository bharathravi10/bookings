import { useState, FormEvent } from 'react';
import Modal from './Modal';
import { BookingStatus } from '../types';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => Promise<void>;
  status: BookingStatus;
  bookingName: string;
}

export default function StatusModal({
  isOpen,
  onClose,
  onSubmit,
  status,
  bookingName,
}: StatusModalProps) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(comment);
      setComment('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (status) {
      case BookingStatus.FollowUp:
        return 'Mark as Follow Up';
      case BookingStatus.Cancelled:
        return 'Cancel Booking';
      case BookingStatus.Completed:
        return 'Mark as Completed';
      default:
        return 'Update Status';
    }
  };

  const getPlaceholder = () => {
    switch (status) {
      case BookingStatus.FollowUp:
        return 'Enter follow-up reason or notes...';
      case BookingStatus.Cancelled:
        return 'Enter cancellation reason...';
      case BookingStatus.Completed:
        return 'Enter completion notes (optional)...';
      default:
        return 'Enter comment...';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
      <form onSubmit={handleSubmit}>
        <p className="text-sm text-gray-500 mb-4">
          Booking: <span className="font-medium">{bookingName}</span>
        </p>

        {error && (
          <div className="rounded-md bg-red-50 p-3 mb-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comment {status === BookingStatus.Completed ? '(Optional)' : '*'}
          </label>
          <textarea
            id="comment"
            rows={4}
            required={status !== BookingStatus.Completed}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
            placeholder={getPlaceholder()}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Confirm'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

