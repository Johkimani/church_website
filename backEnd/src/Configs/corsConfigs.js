import { ApiError } from "../utils/ApiError.js";

const rawOrigins = process.env.CORS_ORIGIN || "";
const parsedOrigins = rawOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Authorize the www counterpart of every simple domain entry, so serving the
// site from either "https://csakyu.com" or "https://www.csakyu.com" keeps API
// calls working without a second environment edit. Multi-label hosts such as
// *.vercel.app / *.onrender.com and localhost are deliberately left untouched.
const expandWwwVariants = (origin) => {
  try {
    const { protocol, hostname } = new URL(origin);
    const dotCount = (hostname.match(/\./g) || []).length;
    if (dotCount === 1 && !hostname.startsWith("www.")) {
      return [`${protocol}//www.${hostname}`];
    }
    if (dotCount === 2 && hostname.startsWith("www.")) {
      return [`${protocol}//${hostname.slice(4)}`];
    }
  } catch {
    /* not a parseable URL — keep the literal value */
  }
  return [];
};

const allowedOrigins = [
  ...new Set(parsedOrigins.flatMap((origin) => [origin, ...expandWwwVariants(origin)])),
];

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
