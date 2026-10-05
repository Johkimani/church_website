import dotenv from "dotenv";
dotenv.config();
import { verifyAccessToken } from "../utils/jwtConfig.js";

// Like verifyToken, but never rejects: attaches req.user when a valid token
// is present and otherwise continues unauthenticated. Used to make public
// GET responses role-aware (e.g. hiding reg_numbers from anonymous callers).
const optionalAuth = async (req, res, next) => {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return next();

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.id,
      member_id: decoded.id,
      role: decoded.role,
      jumuiya_id: decoded.jumuiya_id,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
    };
  } catch {
    // Invalid/expired token: treat as anonymous
  }
  next();
};

export default optionalAuth;
