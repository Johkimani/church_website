import axios from "axios";
import logger from "../logger/winston.js";

const isProduction = process.env.NODE_ENV === "production";

// Strict startup guard: never silently fall back to sandbox credentials in
// production. If any M-Pesa env var is missing, refuse to boot instead of
// letting test transactions be treated as real ones (or vice versa).
export const assertMpesaConfig = () => {
  const required = ["CONSUMER_KEY", "CONSUMER_SECRET", "SHORTCODE", "PASSKEY"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length === 0) return;

  if (isProduction) {
    throw new Error(
      `M-Pesa configuration error: missing required environment variables: ${missing.join(", ")}. ` +
        "Set them in the deployment environment (Render) before starting.",
    );
  }
  // Development: default to Safaricom sandbox so local work keeps working.
  logger.warn(
    `M-Pesa running without: ${missing.join(", ")}. Using sandbox defaults (dev only).`,
  );
};

const defaultToSandbox = (value, devValue) => (isProduction ? "" : devValue);

export class MpesaService {
  static get consumerKey() {
    return process.env.CONSUMER_KEY || "";
  }
  static get consumerSecret() {
    return process.env.CONSUMER_SECRET || "";
  }
  static get shortCode() {
    return defaultToSandbox(process.env.SHORTCODE, "174379");
  }
  static get passKey() {
    return defaultToSandbox(
      process.env.PASSKEY,
      "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    );
  }
  // Live API base is only used when MPESA_ENV=production (or an explicit
  // MPESA_BASE_URL override). Defaults to the sandbox for local development.
  static get baseUrl() {
    if (process.env.MPESA_BASE_URL) return process.env.MPESA_BASE_URL;
    return process.env.MPESA_ENV === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";
  }

  static async getAccessToken() {
    assertMpesaConfig();
    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`,
    ).toString("base64");
    try {
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: { Authorization: `Basic ${auth}` },
        },
      );
      return response.data.access_token;
    } catch (error) {
      logger.error("Error fetching M-Pesa access token: " + (error.message || error));
      throw new Error("Could not authenticate with Safaricom");
    }
  }

  static async stkPush(phoneNumber, amount, callbackUrl) {
    const token = await this.getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);
    const password = Buffer.from(
      `${this.shortCode}${this.passKey}${timestamp}`,
    ).toString("base64");

    // Transform to 254XXXXXXXXX (12 digits)
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.slice(1);
    }
    // Handle "2540XXXXXXXX" (13 digits with extra 0 after 254)
    if (formattedPhone.startsWith("2540")) {
      formattedPhone = "254" + formattedPhone.slice(4);
    }

    const data = {
      BusinessShortCode: this.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: this.shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: "CSAChoir",
      TransactionDesc: "Choir Registration Fee",
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error) {
      logger.error("M-Pesa STK Push error: " + JSON.stringify(error.response?.data || error.message));
      throw new Error("Failed to initiate M-Pesa payment");
    }
  }

  // Helper to generate password (redundant but clean)
  static getPassword(shortCode, passKey, timestamp) {
    return Buffer.from(`${shortCode}${passKey}${timestamp}`).toString("base64");
  }
}
