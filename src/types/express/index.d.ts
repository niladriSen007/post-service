import { Express } from 'express';
import Redis from 'ioredis';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        [key: string]: any;
      };
      redisClient?: Redis;
    }
  }
} 