import { NextFunction, Request, Response } from 'express';

/**
 * Standard API error shape.
 */
export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

/**
 * Express error‑handling middleware. Captures exceptions thrown from route handlers
 * and returns structured JSON responses. Do not call next() from here.
 */
export const errorHandler = (err: ApiError, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? 500;
  const message = err.message || 'Internal Server Error';
  // Optionally include additional error details when available (useful for validation errors).
  const responseBody: Record<string, unknown> = { error: message };
  if (err.details) {
    responseBody.details = err.details;
  }
  // Log unexpected errors in development environments for debugging.
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }
  res.status(status).json(responseBody);
};