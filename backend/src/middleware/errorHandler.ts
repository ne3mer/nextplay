import type { NextFunction, Request, Response } from 'express';

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFoundHandler = (_req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, 'Resource not found'));
};

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API Error:', {
    message: err.message,
    stack: err.stack,
    statusCode: err instanceof ApiError ? err.statusCode : 500
  });
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || 'Internal server error';
  res.status(statusCode).json({ 
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
