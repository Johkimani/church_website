import { test, mock, after, before } from "node:test";
import assert from "node:assert/strict";
import { silentLogger } from "./helpers.js";

// Force production-mode semantics BEFORE the module is loaded.
process.env.NODE_ENV = "production";

const axiosMock = {
  get: async () => ({ data: { access_token: "TOKEN_123" } }),
  post: async () => ({ data: { CheckoutRequestID: "CID1", MerchantRequestID: "MID1" } }),
};
mock.module("axios", { defaultExport: axiosMock });
mock.module("../src/logger/winston.js", { defaultExport: silentLogger });

const { MpesaService, assertMpesaConfig } = await import(
  "../src/services/mpesa.js?prod"
);

const savedEnv = {};
before(() => {
  savedEnv.CONSUMER_KEY = process.env.CONSUMER_KEY;
  savedEnv.CONSUMER_SECRET = process.env.CONSUMER_SECRET;
  savedEnv.SHORTCODE = process.env.SHORTCODE;
  savedEnv.PASSKEY = process.env.PASSKEY;
});
after(() => {
  for (const k of ["CONSUMER_KEY", "CONSUMER_SECRET", "SHORTCODE", "PASSKEY"]) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  process.env.NODE_ENV = "development";
});

test("prod: assertMpesaConfig throws when vars missing", () => {
  delete process.env.CONSUMER_KEY;
  delete process.env.CONSUMER_SECRET;
  delete process.env.SHORTCODE;
  delete process.env.PASSKEY;
  assert.throws(
    () => assertMpesaConfig(),
    /M-Pesa configuration error: missing required environment variables: CONSUMER_KEY, CONSUMER_SECRET, SHORTCODE, PASSKEY/,
  );
});

test("prod: assertMpesaConfig passes when all vars present", () => {
  process.env.CONSUMER_KEY = "k";
  process.env.CONSUMER_SECRET = "s";
  process.env.SHORTCODE = "174379";
  process.env.PASSKEY = "p";
  assert.doesNotThrow(() => assertMpesaConfig());
});

test("prod: shortCode/passKey come from env, no sandbox fallback", () => {
  process.env.SHORTCODE = "654321";
  process.env.PASSKEY = "prodpk";
  assert.equal(MpesaService.shortCode, "654321");
  assert.equal(MpesaService.passKey, "prodpk");
});

test("prod: baseUrl is the live Safaricom endpoint", () => {
  delete process.env.MPESA_BASE_URL;
  delete process.env.MPESA_ENV;
  assert.equal(MpesaService.baseUrl, "https://api.safaricom.co.ke");
});

test("prod: stkPush uses live URL and real phone format", async () => {
  process.env.SHORTCODE = "654321";
  process.env.PASSKEY = "prodpk";
  let posted = null;
  const orig = axiosMock.post;
  axiosMock.post = async (url, data) => {
    posted = { url, data };
    return { data: { CheckoutRequestID: "C", MerchantRequestID: "M" } };
  };
  try {
    await MpesaService.stkPush("0712345678", 100, "https://cb.example.com");
    assert.match(posted.url, /^https:\/\/api\.safaricom\.co\.ke\/mpesa\/stkpush/);
    assert.equal(posted.data.PartyA, "254712345678");
  } finally {
    axiosMock.post = orig;
  }
});
