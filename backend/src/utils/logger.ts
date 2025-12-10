/**
 * Logger utility for consistent logging across the application
 */
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message: string, ...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  error: (message: string, error?: Error | unknown, ...args: unknown[]): void => {
    console.error(`[ERROR] ${message}`, error, ...args);
  },

  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  debug: (message: string, ...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};

