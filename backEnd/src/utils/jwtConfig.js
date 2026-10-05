import jwt from "jsonwebtoken";

const JWT_ISSUER = "csa-kirinyaga";
const JWT_AUDIENCE = "csakyu.com";
const ACCESS_TTL = "15min";
const REFRESH_TTL = "20h";

// Separate secrets for access vs refresh so a leak of one never compromises
// the other. JWT_ACCESS_SECRET / JWT_REFRESH_SECRET are required in
// production; JWT_SECRET is kept only as a development fallback so local
// setups without the dedicated secrets keep working.
const isProduction = process.env.NODE_ENV === "production";

if (
  isProduction &&
  (!process.env.JWT_ACCESS_SECRET ||
    !process.env.JWT_REFRESH_SECRET ||
    process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET)
) {
  throw new Error(
    "JWT configuration error: production requires distinct JWT_ACCESS_SECRET and JWT_REFRESH_SECRET " +
      "environment variables. Set both in the deployment environment (Render) before starting.",
  );
}

const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const sign = (payload, secret, expiresIn) =>
  jwt.sign(payload, secret, {
    algorithm: "HS256",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn,
  });

const verify = (token, secret) =>
  jwt.verify(token, secret, {
    algorithms: ["HS256"],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });

export const signAccessToken = (payload) => sign(payload, accessSecret, ACCESS_TTL);
export const signRefreshToken = (payload) => sign(payload, refreshSecret, REFRESH_TTL);
export const verifyAccessToken = (token) => verify(token, accessSecret);
export const verifyRefreshToken = (token) => verify(token, refreshSecret);

/** Unverified decode — only for read-only lookups like session cleanup on logout. */
export const decodeRefreshToken = (token) => jwt.decode(token);

/** Unverified decode of an access token's payload — for read-only lookups. */
export const decodeAccessToken = (token) => jwt.decode(token);

export { JWT_ISSUER, JWT_AUDIENCE };
