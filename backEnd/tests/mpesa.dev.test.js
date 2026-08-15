import { test, mock, after, before } from "node:test";
import assert from "node:assert/strict";
import { silentLogger } from "./helpers.js";

// Force dev-mode semantics BEFORE the module is loaded (isProduction is
// captured at import time).
process.env.NODE_ENV = "development";

const axiosMock = {
  get: async () => ({ data: { access_token: "TOKEN_123" } }),
  post: async () => {
    throw new Error("no post stub");
  },
};
mock.module("axios", { defaultExport: axiosMock });
mock.module("../src/logger/winston.js", { defaultExport: silentLogger });

const { MpesaService, assertMpesaConfig } = await import(
  "../src/services/mpesa.js?dev"
);

const savedEnv = {};
const KEEP = ["CONSUMER_KEY", "CONSUMER_SECRET", "SHORTCODE", "PASSKEY", "MPESA_ENV", "MPESA_BASE_URL"];
before(() => {
  for (const k of KEEP) savedEnv[k] = process.env[k];
});
after(() => {
  for (const k of KEEP) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  process.env.NODE_ENV = "development";
});
const clearMpesaEnv = () => {
  for (const k of KEEP) delete process.env[k];
};

test("dev: assertMpesaConfig tolerates missing vars", () => {
  clearMpesaEnv();
  assert.doesNotThrow(() => assertMpesaConfig());
});

test("dev: assertMpesaConfig no-op when all vars present", () => {
  process.env.CONSUMER_KEY = "k";
  process.env.CONSUMER_SECRET = "s";
  process.env.SHORTCODE = "123";
  process.env.PASSKEY = "p";
  assert.doesNotThrow(() => assertMpesaConfig());
});

test("dev: shortCode/passKey default to sandbox", () => {
  clearMpesaEnv();
  assert.equal(MpesaService.shortCode, "174379");
  assert.equal(
    MpesaService.passKey,
    "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
  );
});

test("baseUrl: defaults to sandbox, honors MPESA_ENV and MPESA_BASE_URL", () => {
  clearMpesaEnv();
  assert.equal(MpesaService.baseUrl, "https://sandbox.safaricom.co.ke");
  process.env.MPESA_ENV = "production";
  assert.equal(MpesaService.baseUrl, "https://api.safaricom.co.ke");
  process.env.MPESA_BASE_URL = "https://proxy.example.com";
  assert.equal(MpesaService.baseUrl, "https://proxy.example.com");
});

test("getPassword produces correct base64", () => {
  const ts = "20260815000000";
  const expected = Buffer.from(`174379bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919${ts}`).toString("base64");
  assert.equal(MpesaService.getPassword("174379", "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919", ts), expected);
});

test("stkPush: formats 0XXXXXXXXX to 254XXXXXXXXX", async () => {
  clearMpesaEnv();
  let posted = null;
  const orig = axiosMock.post;
  axiosMock.post = async (url, data) => {
    posted = { url, data };
    return { data: { CheckoutRequestID: "CID1", MerchantRequestID: "MID1" } };
  };
  try {
    await MpesaService.stkPush("0712345678", 100, "https://cb.example.com");
    assert.equal(posted.data.PartyA, "254712345678");
    assert.equal(posted.data.PhoneNumber, "254712345678");
    assert.equal(posted.data.Amount, 100);
    assert.equal(posted.data.CallBackURL, "https://cb.example.com");
    assert.match(posted.url, /stkpush\/v1\/processrequest$/);
  } finally {
    axiosMock.post = orig;
  }
});

test("stkPush: formats 2540XXXXXXXX (13-digit) to 254XXXXXXXXX", async () => {
  let posted = null;
  const orig = axiosMock.post;
  axiosMock.post = async (url, data) => {
    posted = data;
    return { data: { CheckoutRequestID: "CID2", MerchantRequestID: "MID2" } };
  };
  try {
    await MpesaService.stkPush("2540712345678", 50, "https://cb.example.com");
    assert.equal(posted.PartyA, "254712345678");
  } finally {
    axiosMock.post = orig;
  }
});

test("stkPush: strips non-digits", async () => {
  let posted = null;
  const orig = axiosMock.post;
  axiosMock.post = async (url, data) => {
    posted = data;
    return { data: { CheckoutRequestID: "CID3", MerchantRequestID: "MID3" } };
  };
  try {
    await MpesaService.stkPush("+254 712-345-678", 25, "https://cb.example.com");
    assert.equal(posted.PartyA, "254712345678");
  } finally {
    axiosMock.post = orig;
  }
});

test("stkPush: throws friendly error when Safaricom call fails", async () => {
  const orig = axiosMock.post;
  axiosMock.post = async () => {
    throw new Error("network down");
  };
  try {
    await assert.rejects(
      () => MpesaService.stkPush("0712345678", 100, "https://cb.example.com"),
      /Failed to initiate M-Pesa payment/,
    );
  } finally {
    axiosMock.post = orig;
  }
});

test("getAccessToken: throws friendly error on failure", async () => {
  const orig = axiosMock.get;
  axiosMock.get = async () => {
    throw new Error("unauthorized");
  };
  try {
    await assert.rejects(
      () => MpesaService.getAccessToken(),
      /Could not authenticate with Safaricom/,
    );
  } finally {
    axiosMock.get = orig;
  }
});

test("stkPush: Bearer token from getAccessToken is used", async () => {
  let authHeader = null;
  const orig = axiosMock.post;
  axiosMock.post = async (url, data, opts) => {
    authHeader = opts.headers.Authorization;
    return { data: { CheckoutRequestID: "CID4", MerchantRequestID: "MID4" } };
  };
  try {
    await MpesaService.stkPush("0712345678", 100, "https://cb.example.com");
    assert.equal(authHeader, "Bearer TOKEN_123");
  } finally {
    axiosMock.post = orig;
  }
});
