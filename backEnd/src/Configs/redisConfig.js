import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: false
  }
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

try {
  await redisClient.connect();
} catch (err) {
  console.error("Failed to connect to Redis (blacklisting will be disabled):", err.message);
}

export default redisClient;
