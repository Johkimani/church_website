import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "node:dns";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 465;

// nodemailer resolves BOTH A and AAAA records and connects to a randomly
// chosen one, so Gmail's IPv6 addresses get picked ~50% of the time. Render
// can't route Gmail's IPv6 and dies with "connect ENETUNREACH <ipv6>:465"
// (a `family: 4` transport option is ignored by nodemailer's own resolver).
//
// Workaround: resolve an IPv4 address ourselves and pin it as a literal host
// (nodemailer skips DNS for IP literals). The domain is kept as `servername`
// so TLS SNI / certificate verification still target smtp.gmail.com.
let cachedIpv4 = null;
let cacheExpires = 0;
const CACHE_TTL_MS = 30 * 60 * 1000;

async function resolveIpv4() {
  if (cachedIpv4 && Date.now() < cacheExpires) {
    return cachedIpv4;
  }
  const addresses = await dns.promises.resolve4(SMTP_HOST);
  if (!addresses.length) {
    throw new Error(`Could not resolve IPv4 addresses for ${SMTP_HOST}`);
  }
  cachedIpv4 = addresses[0];
  cacheExpires = Date.now() + CACHE_TTL_MS;
  console.log(`Resolved ${SMTP_HOST} -> ${cachedIpv4} for SMTP (IPv4)`);
  return cachedIpv4;
}

const buildTransporter = (host) =>
  nodemailer.createTransport({
    host,
    port: SMTP_PORT,
    secure: true,
    servername: SMTP_HOST,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    // Fail fast instead of hanging the request for minutes when SMTP is slow
    // or the mail service is unreachable (defaults are 2-10 minutes).
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

const sendEmail = async (subject, text, to) => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
    const error = new Error("SMTP is not configured (MAIL_USER / MAIL_PASSWORD missing)");
    console.error(error.message);
    throw error;
  }

  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
  };

  // If a pinned IP can't be reached (network blip or Gmail IP rotation),
  // fall back to the next resolved IPv4 address before giving up.
  const ipv4s = await dns.promises.resolve4(SMTP_HOST);
  let lastError;
  for (const host of ipv4s) {
    try {
      cachedIpv4 = host;
      cacheExpires = Date.now() + CACHE_TTL_MS;
      const info = await buildTransporter(host).sendMail(mailOptions);
      console.log("Email sent successfully:", info.response);
      return info;
    } catch (error) {
      lastError = error;
      console.error(`Error sending email via ${host}:`, error.message);
    }
  }
  throw lastError;
};

export { sendEmail };
export default sendEmail;
