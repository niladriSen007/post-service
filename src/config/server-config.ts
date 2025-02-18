import { config } from 'dotenv';
import { cleanEnv, str, num } from 'envalid';
config();


export const serverConfig = cleanEnv(process.env, {
  POST_SERVICE_SERVER_PORT: num({ default: 6000 }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  MONGO_URI: str({ default: 'mongodb+srv://senniladri007:0JF9VPjaianQuxw9@cluster0.eaodn.mongodb.net/' }),
  JWT_SECRET_KEY: str({ default: 'secret' }),
  REDIS_URI: str({ default: 'redis://localhost:6379' }),
});