import dotenv from "dotenv";
dotenv.config();

interface ServerConfig {
  PORT: number | string;
  HOST: string;
}

export const serverConfig: ServerConfig = {
  PORT: process.env.PORT || 5000,
  HOST: process.env.HOST || 'localhost'
};
