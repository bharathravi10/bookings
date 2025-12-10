import { z } from 'zod';

export enum BookingStatus {
  New = 1,
  FollowUp = 2,
  Cancelled = 3,
  Completed = 4,
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  name: string;
  address: string;
  city: string;
  mobile: string;
  vehicleNo: string;
  status: BookingStatus;
  comment?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface BookingCounts {
  [BookingStatus.New]: number;
  [BookingStatus.FollowUp]: number;
  [BookingStatus.Cancelled]: number;
  [BookingStatus.Completed]: number;
}

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  comment: z.string().optional(),
});

export const getBookingsQuerySchema = z.object({
  status: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type GetBookingsQuery = z.infer<typeof getBookingsQuerySchema>;

