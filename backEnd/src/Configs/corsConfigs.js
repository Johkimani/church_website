import { ApiError } from "../utils/ApiError.js";

const rawOrigins = process.env.CORS_ORIGIN || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const localOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const allowLocalDevOrigin = (origin) =>
  process.env.NODE_ENV === "development" && localOriginRegex.test(origin);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowLocalDevOrigin(origin)) {
      return callback(null, true);
    }

    // Log the denied origin + current allowlist so misconfigurations are
    // obvious in the server logs.
    console.warn(
      `[CORS] Blocked origin "${origin}". ` +
        (allowedOrigins.length
          ? `Allowed: ${allowedOrigins.join(", ")}`
          : "No origins allowed - set the CORS_ORIGIN environment variable.")
    );

    callback(new ApiError(403, "Not allowed by CORS"));
  },
  credentials: true,
};

export { allowedOrigins };
export default corsOptions;
