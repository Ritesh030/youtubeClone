import dotenv from "dotenv"
dotenv.config();

const DB_NAME = 'youtubeClone';
const MONGODB_URL = process.env.MONGODB_URL;
const PORT = process.env.PORT;

export {
  DB_NAME,
  MONGODB_URL,
  PORT,
}

