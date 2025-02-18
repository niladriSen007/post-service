import { NextFunction, Request, Response, Router } from "express"
import { postRouter } from "./post/post-router"
import Redis from "ioredis";
import { config } from "../../config";

export const v1Router = Router()

const redisClient = new Redis(config.serverConfig.REDIS_URI);
v1Router.use("/post", (req: Request, res: Response, next: NextFunction) => {
  req.redisClient = redisClient
  next()
}, postRouter)
/* v1Router.use("/post", postRouter) */