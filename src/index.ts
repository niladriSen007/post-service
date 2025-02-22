import express, { NextFunction, Request, Response } from 'express';
import { config } from './config';
const { serverConfig } = config;
import helmet from 'helmet';
import cors from 'cors';
import { apiRouter } from './routes';
import { middlewares } from './middlewares';
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';
import { errorResponse } from './utils';
import { StatusCodes } from 'http-status-codes';
import { RedisReply, RedisStore } from "rate-limit-redis"
import Redis from 'ioredis';
const { POST_SERVICE_SERVER_PORT, MONGO_URI, REDIS_URI } = serverConfig
const { errorHandler } = middlewares;
import { services } from './services';
const { MessageBroker } = services

const app = express();
const redisClient = new Redis(REDIS_URI);

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.use(helmet());
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);


const sensitiveRoutesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    config.logger.error(`Too many requests from IP so rate limit exceeded from Express rate limiter: ${req?.ip}`)
    errorResponse.message = "Too many requests"
    errorResponse.error.message = "Too many requests"
    errorResponse.error.status = StatusCodes.TOO_MANY_REQUESTS
    res.status(StatusCodes.TOO_MANY_REQUESTS).json(errorResponse)
  },
  store: new RedisStore({
    sendCommand: async (...args: [command: string, ...args: string[]]): Promise<RedisReply> => {
      const result = await redisClient.call(...args);
      return result as RedisReply;
    },
    prefix: 'rate-limit:'
  }),
})

//apply the rate limiter to the sensitive routes
app.use("/api/v1/post", sensitiveRoutesLimiter)
//We are using this redis caching in pag level
/* app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  req.redisClient = redisClient
  next()
}, apiRouter) */
app.use("/api", apiRouter)
app.use(errorHandler)

async function startServer() {
  try {
    await MessageBroker.createConnectionRabbitMQ()
    config.logger.info("RabbitMQ connection created successfully")
    app.listen(POST_SERVICE_SERVER_PORT, () => {
      config.logger.info(`Server is running at http://localhost:${POST_SERVICE_SERVER_PORT}`);
    });
    app.on('error', (error : any) => {
      config.logger.error(`Server error: ${error.message}`);
      process.exit(1);
    }
    );
  } catch (error) {
    config.logger.error(`Error starting server: ${error.message}`)
    process.exit(1)
  }
}

startServer();


process.on('unhandledRejection', (reason, promise) => {
  config.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  config.logger.error('Uncaught Exception thrown', error);
  process.exit(1);
});


