/**
 * Gets a readable error message from an error object
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

/**
 * Creates a safe console logger that only logs in development
 */
export const createLogger = (prefix: string) => ({
  log: (...args: any[]) => {
    if (!!(globalThis as any).VITE_DEV_MODE || window.location.hostname === 'localhost') {
      console.log(`[${prefix}]`, ...args);
    }
  },
  warn: (...args: any[]) => {
    if (!!(globalThis as any).VITE_DEV_MODE || window.location.hostname === 'localhost') {
      console.warn(`[${prefix}]`, ...args);
    }
  },
  error: (...args: any[]) => {
    if (!!(globalThis as any).VITE_DEV_MODE || window.location.hostname === 'localhost') {
      console.error(`[${prefix}]`, ...args);
    }
  },
});
