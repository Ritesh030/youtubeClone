import dotenv from "dotenv"
dotenv.config();

const DB_NAME = 'youtubeClone';
const MONGODB_URL = process.env.MONGODB_URL;
const PORT = process.env.PORT;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

export {
  DB_NAME,
  MONGODB_URL,
  PORT,
  CORS_ORIGIN,
}