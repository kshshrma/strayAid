/**
 * Custom application error class.
 * Extends the native Error class to include HTTP status codes and operational flags.
 * 
 * SOLID Principle: Single Responsibility.
 * This class is solely responsible for modeling error data.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    
    // Operational errors are known errors we expect and handle (e.g., validation input errors).
    // Non-operational errors are unexpected bugs (e.g., syntax errors, network timeouts).
    this.isOperational = true;

    // Capture the stack trace, omitting this constructor call from the trace.
    Error.captureStackTrace(this, this.constructor);
  }
}
