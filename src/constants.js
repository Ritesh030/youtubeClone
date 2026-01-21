import dotenv from "dotenv"
dotenv.config();

const DB_NAME = 'youtubeClone';
const MONGODB_URL = process.env.MONGODB_URL;
const PORT = process.env.PORT;
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY

export {
  DB_NAME,
  MONGODB_URL,
  PORT,
  CORS_ORIGIN,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY
}