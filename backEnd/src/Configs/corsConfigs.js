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

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

export { allowedOrigins };
export default corsOptions;
