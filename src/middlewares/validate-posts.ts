import { Request, Response, NextFunction } from 'express';
import { ValidateRequests } from '../services/validation/validation-service';

export const validateCreatePost = async(
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = await ValidateRequests.validateCreateUserRequestBody(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};