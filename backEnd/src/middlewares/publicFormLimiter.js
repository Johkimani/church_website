import { rateLimit } from "express-rate-limit";

// Per-route limits for unauthenticated write endpoints.
//
// The global limiter (app.js) allows 5,000 requests / 15 min / IP, which is far
// too loose for anonymous form submissions. These stricter limits apply on top
// of it so a single address cannot flood the admission/hire/enrollment queues
// while CAPTCHA is not yet provisioned. Each route gets its own instance, so
// traffic to one form never consumes another form's budget.
//
// Note: express-rate-limit uses an in-memory store by default, so the budget is
// per backend process. This is deliberate for now — a shared store (Redis) can
// replace it later without changing the call sites.

const WINDOW_MS = 15 * 60 * 1000;

const makeLimiter = ({ max, message }) =>
  rateLimit({
    windowMs: WINDOW_MS,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    handler: (req, res, next, options) => {
      res.status(options.statusCode || 429).json({ error: message });
    },
  });

export const selfRegisterLimiter = makeLimiter({
  max: 10,
  message:
    "Too many registration submissions from this address. Please wait 15 minutes and try again.",
});

export const publicJoinLimiter = makeLimiter({
  max: 10,
  message:
    "Too many join submissions from this address. Please wait 15 minutes and try again.",
});

export const hireSubmitLimiter = makeLimiter({
  max: 10,
  message:
    "Too many hire requests from this address. Please wait 15 minutes and try again.",
});

export const communityEnrollmentLimiter = makeLimiter({
  max: 10,
  message:
    "Too many enrollment submissions from this address. Please wait 15 minutes and try again.",
});

export const publicWriteLimiter = makeLimiter({
  max: 15,
  message:
    "Too many submissions from this address. Please wait 15 minutes and try again.",
});

export const guestPaymentLimiter = makeLimiter({
  max: 10,
  message:
    "Too many payment requests from this address. Please wait 15 minutes and try again.",
});

export default makeLimiter;
