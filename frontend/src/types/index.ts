export enum BookingStatus {
  New = 1,
  FollowUp = 2,
  Cancelled = 3,
  Completed = 4,
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
  createdAt: string;
  updatedAt: string;
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

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

