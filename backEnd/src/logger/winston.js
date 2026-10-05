import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "blue",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "DD MMM, YYYY - HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
  )
);

// Fixed log directory so logs always land in backEnd/logs regardless of process CWD
const LOGS_DIR = fileURLToPath(new URL("../../logs", import.meta.url));

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: path.join(LOGS_DIR, "error.log"),
    level: "error",
    maxsize: 10 * 1024 * 1024,
    maxFiles: 5,
    tailable: true,
  }),
  new winston.transports.File({
    filename: path.join(LOGS_DIR, "info.log"),
    level: "info",
    maxsize: 10 * 1024 * 1024,
    maxFiles: 5,
    tailable: true,
  }),
  new winston.transports.File({
    filename: path.join(LOGS_DIR, "http.log"),
    level: "http",
    maxsize: 10 * 1024 * 1024,
    maxFiles: 5,
    tailable: true,
  }),
];

const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default logger;
