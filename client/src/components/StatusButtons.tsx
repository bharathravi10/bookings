import React, { useState, memo } from 'react';
import { Booking } from '../types';
import './StatusButtons.css';

interface StatusButtonsProps {
  booking: Booking;
  onStatusUpdate: (id: number, status: number, comment: string | null | undefined, oldStatus?: number) => void;
}

const StatusButtons = memo<StatusButtonsProps>(({ booking, onStatusUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const handleAction = (status: number) => {
    if (status === 4) {
      onStatusUpdate(booking.id, status, null, booking.status);
    } else {
      setAction(status);
      setShowModal(true);
    }
  };

  const handleSubmit = () => {
    if (!comment.trim() && action !== 4) {
      alert('Comment is required');
      return;
    }
    if (action !== null) {
      onStatusUpdate(booking.id, action, comment, booking.status);
    }
    setShowModal(false);
    setComment('');
    setAction(null);
  };

  if (booking.status !== 1) return null;

  return (
    <>
      <div className="status-buttons">
        <button
          className="btn-followup"
          onClick={() => handleAction(2)}
        >
          Follow Up
        </button>
        <button
          className="btn-cancel"
          onClick={() => handleAction(3)}
        >
          Cancel
        </button>
        <button
          className="btn-complete"
          onClick={() => handleAction(4)}
        >
          Completed
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {action === 2 ? 'Follow Up' : 'Cancel'} Booking
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter comment or reason..."
              rows={4}
              required
            />
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleSubmit} className="btn-submit">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

StatusButtons.displayName = 'StatusButtons';

export default StatusButtons;

