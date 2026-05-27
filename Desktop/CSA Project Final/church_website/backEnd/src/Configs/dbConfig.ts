import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";
import logger from "../logger/winston.js";
import mongoose from "mongoose";
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST === "localhost" ? false : { rejectUnauthorized: false },
});

export const db = pool; // Alias for backward compatibility

let client: PoolClient | undefined;

export const connectDb = async (): Promise<void> => {
  try {
    client = await pool.connect();
    logger.info("Connected to PostgreSQL database successfully!");
  } catch (error: any) {
    logger.error("Failed to connect PostgreSQL database:", error.message, {
      stack: error.stack,
    });
    process.exit(1)
  } 
};

export const testDb = { query: (text: string, params?: any[]) => client!.query(text, params), };

export let dbInstance: any = undefined;

export const connectToMongoDb = async (): Promise<void> => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
    dbInstance = connectionInstance;
    logger.info(`☘️  MongoDB Connected! Db host: ${connectionInstance.connection.host}`);
  } catch (error: any) {
    logger.warn("MongoDB connection failed (optional - check MONGODB_URI in .env):", error.message);
    // Server continues with Postgres only
  }
};
