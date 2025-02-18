import { NextFunction, Request, Response } from "express";
import { config } from "../config"
import { StatusCodes } from "http-status-codes";
const { logger } = config;
export const validateAuthentication = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Auth middleware called`)
  const userId = req?.headers?.['x-user-id']
  if (!userId) {
    logger.error(`Unauthorized request`)
    return res.status(StatusCodes.UNAUTHORIZED).send('Unauthorized')
  }
  req.user = { id: userId as string }
  next()
}