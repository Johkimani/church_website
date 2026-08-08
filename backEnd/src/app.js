import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import cors from "cors";
import apiRoutes from "./routers/index.js";
import morganMiddleware from "./logger/morgan.js";
import { BackendDataService } from "./services/backend-data.js";
import { rateLimit } from "express-rate-limit";
import requestIp from "request-ip";
import corsOptions, { allowedOrigins } from "./Configs/corsConfigs.js";
import { Server } from "socket.io";
import cookieParser from "cookie-parser"
import { errorHandler } from "./middlewares/error.middlewares.js";
import { initializeSocketIO, setSocketInstance } from "./socket/index.js";


import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Secure App with Helmet (Security Headers)
app.use(helmet());

// Performance: Compression for high-efficiency response delivery
app.use(compression());

// Prevent Parameter Pollution
app.use(hpp());

// app midlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// create app using httserver so we can add a socket on top of the serve , unlike the http server
const httpServer = createServer(app);

const localOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || localOriginRegex.test(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});

initializeSocketIO(io)
setSocketInstance(io);

app.use("/api/v1/authentication/mpesa/callback", cors());

// this is the best way to to get the actual ip adress of a device even if the server is behind a proxy
//rather than getting the proxy ip adress , usefull in fare shairing of resorces
app.use(requestIp.mw());

app.use(cors(corsOptions));

// ─── Rate limiters ─────────────────────────────────────────────────────────────
// M-Pesa callbacks arrive from Safaricom's servers and can burst/retry, so they
// get a much higher allowance than client-facing endpoints. Payment endpoints
// (which trigger real-money STK pushes) get a tighter tier per client IP.
const isMpesaCallbackPath = (req) =>
  /\/payments\/callback$|\/stkPush\/callback$|\/authentication\/mpesa\/callback$/i.test(req.path);

const isPaymentEndpoint = (req) =>
  /\/payments(\/|$)/i.test(req.path) ||
  /\/stkPush(\/|$)/i.test(req.path) ||
  /\/stk-push-guest(\/|$)/i.test(req.path);

// Credential-guessing endpoints (login, OTP, password reset, first-login setup)
// get a much tighter allowance than general traffic (OWASP: lockout after a few
// tries). Token refresh is exempt — it is already gated by a valid refresh token
// and fires frequently for legitimate multi-tab users.
const isAuthEndpoint = (req) =>
  /\/api\/v1\/authentication\/(login|reset|otp|verify|first-login-setup)/i.test(req.path);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.clientIp;
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode || 429).json({
      error: `There are too many requests. You are only allowed ${options.max
      } requests per ${options.windowMs / 60000} minutes`,
    });
  },
});

const callbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100000,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  keyGenerator: (req, res) => req.clientIp,
  handler: (req, res, next, options) => {
    res.status(options.statusCode || 429).json({
      error: `Too many callback requests from this IP`,
    });
  },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.clientIp,
  handler: (req, res, next, options) => {
    res.status(options.statusCode || 429).json({
      error: `There are too many payment requests. You are only allowed ${options.max
      } requests per ${options.windowMs / 60000} minutes`,
    });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.clientIp,
  handler: (req, res, next, options) => {
    res.status(options.statusCode || 429).json({
      error: `Too many authentication attempts. You are only allowed ${options.max
      } requests per ${options.windowMs / 60000} minutes`,
    });
  },
});

// Rate limiter activation for DDoS protection (per-tier)
app.use((req, res, next) => {
  if (isMpesaCallbackPath(req)) return callbackLimiter(req, res, next);
  if (isPaymentEndpoint(req)) return paymentLimiter(req, res, next);
  if (isAuthEndpoint(req)) return authLimiter(req, res, next);
  return limiter(req, res, next);
});
app.use(morganMiddleware);

// Root + health routes (outside the /api mount so Render health checks and
// direct visits to the root URL return JSON instead of "Cannot GET /")
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", service: "church-website-api" });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiRoutes)

// Organized Static Routes for locally uploaded media files
app.use("/uploads", express.static(path.join(__dirname, "../localFileUploads")));
app.use("/gallery-images", express.static(path.join(__dirname, "../galleryImages")));


// Initialize Backend Data Service
BackendDataService.init();

// SPA: serve built frontend + fallback to index.html for non-API routes.
// Only when the build actually exists (the frontend normally deploys to
// Vercel, so backEnd/frontEnd/dist is usually absent on the API host).
// Uses an Express 5-compatible named wildcard — app.get('*') throws
// "Missing parameter name at index 1: *" on boot in production.
const frontendDistPath = path.join(__dirname, "../../frontEnd/dist");
const indexHtmlPath = path.join(frontendDistPath, "index.html");

if (process.env.NODE_ENV === 'production' && fs.existsSync(indexHtmlPath)) {
  app.use(express.static(frontendDistPath));

  app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    if (req.path.startsWith('/uploads')) return next();
    if (req.path.startsWith('/gallery-images')) return next();

    res.sendFile(indexHtmlPath, (err) => {
      if (err) next(err);
    });
  });
}

app.use(errorHandler)

export { httpServer };

