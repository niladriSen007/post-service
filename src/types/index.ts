import { Request } from "express";
import Redis from "ioredis";

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

export interface CreatePostRequest extends Request {
  body: {
    mediaIds?: string[] ;
    content: string;
    user: string;
  };
  user: {
    id: string;
  };
}

export interface CreatePostTypes {
  mediaIds?: string[];
  content: string;
  user: string;
}