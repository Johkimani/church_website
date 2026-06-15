import logger from "../logger/winston.js";

// Express middleware to measure request durations.
// Logs method + route + statusCode + elapsed ms.
export const requestTimer = (thresholdMs = 300) => {
  return (req, res, next) => {
    const startHr = process.hrtime.bigint();

    res.on("finish", () => {
      const endHr = process.hrtime.bigint();
      const elapsedMs = Number(endHr - startHr) / 1_000_000;

      if (elapsedMs >= thresholdMs) {
        const route = req.route?.path || req.originalUrl;
        logger.debug(
          `[timer] ${req.method} ${route} -> ${res.statusCode} (${elapsedMs.toFixed(1)}ms)`
        );
      }
    });

    next();
  };
};

