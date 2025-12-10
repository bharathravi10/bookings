/**
 * Application constants
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

export const BOOKING_STATUS = {
  NEW: 1,
  FOLLOW_UP: 2,
  CANCELLED: 3,
  COMPLETED: 4,
} as const;

export const VALID_STATUSES = [1, 2, 3, 4] as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

