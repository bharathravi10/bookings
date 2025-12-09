export type Status = 1 | 2 | 3 | 4;

export interface Booking {
  id: number;
  name: string;
  address?: string | null;
  city?: string | null;
  mobile?: string | null;
  vehicle_number?: string | null;
  status: Status;
  comment?: string | null;
  created_at?: string;
  updated_at?: string;
}

