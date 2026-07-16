import axios from "axios";
import logger from "../logger/winston.js";

export const sendSms = async (message, to) => {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME || 'sandbox';

  // If no API key configured, log a warning and skip
  if (!apiKey) {
    logger.warn(`[SMS] Skipping — AT_API_KEY not set in .env. Would have sent to ${to}: "${message}"`);
    return;
  }

  try {
    const response = await axios.post(
      'https://api.africastalking.com/version1/messaging',
      new URLSearchParams({
        username,
        to,
        message,
        from: process.env.AT_SENDER_ID || '',
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': apiKey,
        },
      }
    );
    logger.info(`[SMS] Sent to ${to}: ${response.data?.SMSMessageData?.Message || 'OK'}`);
    return response.data;
  } catch (error) {
    logger.error(`[SMS] Failed to send to ${to}: ${error.response?.data || error.message}`);
    throw error;
  }
};
