import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import logger from "../logger/winston.js";
// import redisClient from "../Configs/redisConfig.js";

const verifyToken = async (req, res, next) => {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];

  try {
    let token = null;
    token = authHeader && authHeader.split(" ")[1];
    if (!token && req.query.token) {
      token = req.query.token;
    }
    if (!token) {
      logger.warn("Unauthorized access attempt with malformed token");
      return res.status(401).json({ error: "Token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      member_id: decoded.id,
      role: decoded.role,
      jumuiya_id: decoded.jumuiya_id,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
    };

    next();
  } catch (err) {
    // Routine expiry is handled by the frontend refresh flow (it is expected,
    // not an attack), so log it at debug level to keep server logs clean.
    if (err?.name === "TokenExpiredError") {
      logger.debug(`Expired token (refresh flow): ${err.message}`);
    } else {
      logger.warn(`Invalid token: ${err.message}`);
    }
    return res.status(401).json({ message: err.message });
  }
};

export default verifyToken;
