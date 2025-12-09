import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import './CardStat.css';

interface CardStatProps {
  title: string;
  count: number;
  status: number;
  color: string;
}

const CardStat = memo<CardStatProps>(({ title, count, status, color }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/bookings?status=${status}`);
  };

  return (
    <div className="card-stat" onClick={handleClick} style={{ borderTopColor: color }}>
      <h3>{title}</h3>
      <p className="count">{count}</p>
    </div>
  );
});

CardStat.displayName = 'CardStat';

export default CardStat;

