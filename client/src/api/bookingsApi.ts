import apiClient from './apiClient';
import { Booking } from '../types';

export const login = async (username: string, password: string) => {
  const response = await apiClient.post('/auth/login', { username, password });
  return response.data as { token: string };
};

export const getBookings = async (status: number | undefined, page = 1, limit = 10) => {
  const params: Record<string, any> = { page, limit };
  if (status) params.status = status;
  const response = await apiClient.get('/bookings', { params });
  return response.data as { data: Booking[]; page: number; limit: number; total: number };
};

export const updateBookingStatus = async (id: number, status: number, comment?: string) => {
  const response = await apiClient.patch(`/bookings/${id}/status`, { status, comment });
  return response.data;
};

export const getCounts = async () => {
  const response = await apiClient.get('/bookings/counts');
  return response.data as { new: number; followup: number; cancelled: number; completed: number };
};

