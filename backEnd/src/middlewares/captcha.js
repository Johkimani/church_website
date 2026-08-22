import logger from "../logger/winston.js";

// Cloudflare Turnstile verification middleware.
//
// Enabled automatically when TURNSTILE_SECRET_KEY is present in the backend
// environment. Without the key the check is skipped entirely so local dev and
// staging keep working until keys are provisioned.
//
// Frontend counterpart renders the widget using VITE_TURNSTILE_SITEKEY and
// sends the solved token as `captchaToken` in the JSON body.

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const captchaEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY);

export const verifyCaptcha = async (req, res, next) => {
  if (!captchaEnabled()) return next();

  try {
    const token = req.body?.captchaToken;
    if (!token || typeof token !== "string") {
      return res.status(400).json({
        error: "CAPTCHA token missing. Please complete the human verification.",
      });
    }

    const params = new URLSearchParams();
    params.append("secret", process.env.TURNSTILE_SECRET_KEY);
    params.append("response", token);
    const ip =
      String(
        req.headers["cf-connecting-ip"] ||
          req.headers["x-forwarded-for"] ||
          req.ip ||
          "",
      )
        .split(",")[0]
        .trim();
    if (ip) params.append("remoteip", ip);

    const resp = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await resp.json();

    if (!data?.success) {
      logger.warn(
        `Turnstile verification failed: ${(data?.["error-codes"] || ["unknown"]).join(", ")}`,
      );
      return res
        .status(403)
        .json({ error: "CAPTCHA verification failed. Please refresh and try again." });
    }

    return next();
  } catch (err) {
    // Verification service unreachable: fail closed unless explicitly opened.
    logger.error(`Turnstile verify error: ${err.message}`);
    if (process.env.TURNSTILE_FAIL_OPEN === "true") return next();
    return res
      .status(503)
      .json({ error: "Verification service unavailable. Please try again shortly." });
  }
};

export default verifyCaptcha;
