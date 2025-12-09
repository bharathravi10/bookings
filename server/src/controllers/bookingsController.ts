import { Request, Response } from 'express';
import { query } from '../services/db.js';
import { validateStatus } from '../utils/validators.js';
import { Booking } from '../types/booking.js';

export const getBookings = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    let sql = 'SELECT * FROM bookings';
    const params: any[] = [];

    if (status) {
      const statusNum = parseInt(status, 10);
      if (!validateStatus(statusNum)) return res.status(400).json({ error: 'Invalid status' });
      sql += ' WHERE status = ?';
      params.push(statusNum);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const bookings = await query<Booking>(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM bookings';
    const countParams: any[] = [];
    if (status) {
      countSql += ' WHERE status = ?';
      countParams.push(parseInt(status, 10));
    }
    const [countResult] = await query<{ total: number }>(countSql, countParams);
    const total = countResult.total;

    res.json({ data: bookings, page: pageNum, limit: limitNum, total });
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body as { status: number; comment?: string };

    if (!validateStatus(status)) return res.status(400).json({ error: 'Invalid status' });

    const sql = 'UPDATE bookings SET status = ?, comment = ?, updated_at = NOW() WHERE id = ?';
    await query(sql, [status, comment || null, id]);

    const [updated] = await query<Booking>('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!updated) return res.status(404).json({ error: 'Booking not found' });

    res.json(updated);
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCounts = async (_req: Request, res: Response) => {
  try {
    const results = await query<{ status: number; cnt: number }>('SELECT status, COUNT(*) AS cnt FROM bookings GROUP BY status');
    const counts = { new: 0, followup: 0, cancelled: 0, completed: 0 };
    results.forEach((row) => {
      switch (row.status) {
        case 1: counts.new = row.cnt; break;
        case 2: counts.followup = row.cnt; break;
        case 3: counts.cancelled = row.cnt; break;
        case 4: counts.completed = row.cnt; break;
      }
    });
    res.json(counts);
  } catch (err) {
    console.error('Get counts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

