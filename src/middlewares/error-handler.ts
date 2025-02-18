import { Request, Response, NextFunction } from 'express';
import { GlobalErrorResponse } from '../utils';

export const errorHandler = (
  err: GlobalErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    error: err.error,
  });
};