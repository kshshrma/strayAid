import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

/**
 * Global Error Handling Middleware for Express.
 * Catches all thrown errors or next(err) triggers, formatting them into structured JSON.
 * 
 * SOLID Principle: Single Responsibility.
 * This middleware has one job: intercept all server errors and return a standardized client response.
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let status = 'error';

  // If the error is an operational AppError, use its defined status code and message
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
  } else {
    // Non-operational error (bug or system failure). Log the error details on the server console.
    console.error('💥 UNEXPECTED SERVER ERROR:', err);
  }

  // Send the standardized JSON response
  res.status(statusCode).json({
    status,
    message,
    // Only send the stack trace to the frontend in development mode to assist debugging
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
