import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
// Define your severity levels.
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

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
  error: "red",
  warn: "yellow",
  info: "blue",
  http: "magenta",
  debug: "white",
};

// Tell winston that you want to link the colors
// defined above to the severity levels.
winston.addColors(colors);

// Chose the aspect of your log customizing the log format.
const format = winston.format.combine(
  // Add the message timestamp with the preferred format
  winston.format.timestamp({ format: "DD MMM, YYYY - HH:mm:ss:ms" }),
  // Tell Winston that the logs must be colored
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
  )
);

// Fixed log directory so logs always land in backEnd/logs regardless of process CWD
const LOGS_DIR = fileURLToPath(new URL("../../logs", import.meta.url));

// Define which transports the logger must use to print out messages.
// File transports rotate at 10 MB, keeping the latest 5 files each.
const transports = [
  // Allow the use the console to print the messages
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

// Create the logger instance that has to be exported
// and used to log messages.
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default logger;
