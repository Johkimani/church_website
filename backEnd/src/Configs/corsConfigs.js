const rawOrigins = process.env.CORS_ORIGIN || "";
const envOrigins = rawOrigins
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Known frontend origins. Kept here as a robust default so the API keeps
// working even if CORS_ORIGIN is not (or incorrectly) set in the environment.
const defaultAllowedOrigins = [
  "https://csakyu.com",
  "https://www.csakyu.com",
  "https://church-website-smoky.vercel.app",
  "https://csa-church-website-rosy.vercel.app",
];

const allowedOrigins = [...new Set([...envOrigins, ...defaultAllowedOrigins])];

const localOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const vercelOriginRegex = /^https:\/\/[\w-]+\.vercel\.app$/i;
const allowLocalDevOrigin = (origin) =>
  process.env.NODE_ENV === "development" && localOriginRegex.test(origin);

const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      allowLocalDevOrigin(origin) ||
      vercelOriginRegex.test(origin)
    ) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

export { allowedOrigins };
export default corsOptions;
