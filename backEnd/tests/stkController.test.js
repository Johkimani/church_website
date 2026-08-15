import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { silentLogger } from "./helpers.js";

// ── Module mocks (registered ONCE per process) ─────────────────────────────
const CHECKOUT = "ws_CO_20260815_00001";

const dbState = { routes: [], calls: [] };
const db = {
  calls: dbState.calls,
  query: async (text, params = []) => {
    dbState.calls.push({ text, params });
    for (const r of dbState.routes) {
      if (text.includes(r.needle)) return r.result(dbState.calls, params);
    }
    throw new Error(`Fake db: no route for query:\n${text}`);
  },
};

mock.module("../src/Configs/dbConfig.js", { namedExports: { db } });
mock.module("../src/logger/winston.js", { defaultExport: silentLogger });
mock.module("../src/services/notificationService.js", {
  namedExports: {
    sendOrderPaymentConfirmation: async () => {},
    sendHirePaymentConfirmation: async () => {},
  },
});
mock.module("../src/services/mpesa.js", {
  namedExports: {
    MpesaService: {
      stkPush: async () => ({
        CheckoutRequestID: "NEW_CID",
        MerchantRequestID: "NEW_MID",
      }),
    },
  },
});

const { handleCallback, initiateSTK, waitForPaymentResult } = await import(
  "../src/controllers/stkPush/stkController.js?stk"
);

// ── Helpers ─────────────────────────────────────────────────────────────────
const setRoutes = (overrides = {}) => {
  dbState.routes = [
    {
      needle: "SELECT 1 FROM mpesa_request",
      result: (calls, params) =>
        params[0] === CHECKOUT ? { rows: [{ "?column?": 1 }] } : { rows: [] },
    },
    {
      needle: "SELECT status, result_desc, mpesa_receipt",
      result: () => ({ rows: overrides.pollRows ?? [] }),
    },
    {
      needle: "INSERT INTO mpesa_request",
      result: () => ({ rows: [] }),
    },
    {
      needle: "UPDATE orders",
      result: () => ({ rows: overrides.orderRows ?? [] }),
    },
    {
      needle: "UPDATE hire_requests",
      result: () => ({ rows: overrides.hireRows ?? [] }),
    },
    {
      needle: "UPDATE activity_payments",
      result: () => ({ rows: overrides.paymentRows ?? [] }),
    },
    {
      needle: "UPDATE activity_bookings",
      result: () => ({ rows: [] }),
    },
    {
      needle: "SELECT key, value FROM system_settings",
      result: () => ({ rows: [] }),
    },
  ];
  dbState.calls.length = 0;
};

const mkReq = (body) => ({ body });
const mkRes = () => {
  const res = { _status: null, _json: null };
  res.status = (code) => {
    res._status = code;
    return res;
  };
  res.json = (body) => {
    res._json = body;
    return res;
  };
  return res;
};

// ── Tests ───────────────────────────────────────────────────────────────────
test("callback: always acks Safaricom first", async () => {
  setRoutes();
  const res = mkRes();
  await handleCallback(mkReq({ Body: { stkCallback: {} } }), res);
  assert.equal(res._status, 200);
  assert.deepEqual(res._json, { ResultCode: 0, ResultDesc: "Accepted" });
});

test("callback: missing Body.stkCallback does no db work", async () => {
  setRoutes();
  const res = mkRes();
  await handleCallback(mkReq({}), res);
  assert.equal(res._status, 200);
  assert.equal(dbState.calls.length, 0);
});

test("callback: forged callback with unknown CheckoutRequestID is rejected", async () => {
  setRoutes();
  const res = mkRes();
  await handleCallback(
    mkReq({
      Body: {
        stkCallback: {
          CheckoutRequestID: "FORGED_ID",
          MerchantRequestID: "M",
          ResultCode: 0,
          ResultDesc: "Success",
        },
      },
    }),
    res,
  );
  assert.equal(dbState.calls.length, 1);
  assert.match(dbState.calls[0].text, /SELECT 1 FROM mpesa_request/);
});

test("callback: missing CheckoutRequestID is ignored", async () => {
  setRoutes();
  const res = mkRes();
  await handleCallback(
    mkReq({ Body: { stkCallback: { ResultCode: 0, ResultDesc: "ok" } } }),
    res,
  );
  assert.equal(dbState.calls.length, 0);
});

test("callback: success path marks mpesa_request, orders, hires, payments paid", async () => {
  setRoutes();
  const res = mkRes();
  await handleCallback(
    mkReq({
      Body: {
        stkCallback: {
          CheckoutRequestID: CHECKOUT,
          MerchantRequestID: "M1",
          ResultCode: 0,
          ResultDesc: "The service request is processed successfully.",
          CallbackMetadata: {
            Item: [
              { Name: "MpesaReceiptNumber", Value: "SFAX99B001" },
              { Name: "Amount", Value: 100 },
              { Name: "PhoneNumber", Value: "254712345678" },
            ],
          },
        },
      },
    }),
    res,
  );
  const texts = dbState.calls.map((c) => c.text);
  assert.ok(texts.some((t) => t.includes("INSERT INTO mpesa_request")));
  assert.ok(texts.some((t) => t.includes("UPDATE orders")));
  assert.ok(texts.some((t) => t.includes("UPDATE hire_requests")));
  assert.ok(texts.some((t) => t.includes("UPDATE activity_payments")));
  const insert = dbState.calls.find((c) => c.text.includes("INSERT INTO mpesa_request"));
  assert.equal(insert.params[0], CHECKOUT);
  assert.equal(insert.params[6], "SFAX99B001");
});

test("callback: payment metadata updates activity_bookings paid_amount", async () => {
  setRoutes({ paymentRows: [{ booking_id: 42, amount: 100 }] });
  const res = mkRes();
  await handleCallback(
    mkReq({
      Body: {
        stkCallback: {
          CheckoutRequestID: CHECKOUT,
          MerchantRequestID: "M2",
          ResultCode: 0,
          ResultDesc: "ok",
          CallbackMetadata: { Item: [{ Name: "MpesaReceiptNumber", Value: "R1" }] },
        },
      },
    }),
    res,
  );
  const bookingUpdate = dbState.calls.find((c) => c.text.includes("UPDATE activity_bookings"));
  assert.ok(bookingUpdate, "expected activity_bookings update");
  assert.deepEqual(bookingUpdate.params.slice(0, 2), [100, 42]);
});

test("callback: failure path marks mpesa_request and orders failed", async () => {
  setRoutes();
  const res = mkRes();
  await handleCallback(
    mkReq({
      Body: {
        stkCallback: {
          CheckoutRequestID: CHECKOUT,
          MerchantRequestID: "M3",
          ResultCode: 1032,
          ResultDesc: "Request cancelled by user",
        },
      },
    }),
    res,
  );
  const texts = dbState.calls.map((c) => c.text);
  const insert = dbState.calls.find((c) => c.text.includes("INSERT INTO mpesa_request"));
  assert.ok(insert, "expected failed INSERT");
  assert.match(insert.text, /'failed'/, "status should be 'failed'");
  assert.ok(texts.some((t) => t.includes("UPDATE orders")));
});

test("initiateSTK: throws when CALLBACK_URL missing", async () => {
  setRoutes();
  const saved = process.env.CALLBACK_URL;
  delete process.env.CALLBACK_URL;
  try {
    await assert.rejects(
      () => initiateSTK("PA100", "0712345678", 100),
      /CALLBACK_URL is not configured/,
    );
  } finally {
    if (saved) process.env.CALLBACK_URL = saved;
  }
});

test("initiateSTK: inserts pending row and returns checkout id", async () => {
  setRoutes();
  const saved = process.env.CALLBACK_URL;
  process.env.CALLBACK_URL = "https://cb.example.com/cb";
  try {
    const cid = await initiateSTK("PA100", "0712345678", 100);
    assert.equal(cid, "NEW_CID");
    const insert = dbState.calls.find((c) => c.text.includes("INSERT INTO mpesa_request"));
    assert.ok(insert, "expected pending insert");
    assert.equal(insert.params[0], "PA100");
    assert.equal(insert.params[4], 100);
  } finally {
    if (saved) process.env.CALLBACK_URL = saved;
  }
});

test("waitForPaymentResult: pending until timeout", async () => {
  setRoutes();
  const res2 = await waitForPaymentResult("UNKNOWN", 10, 5);
  assert.equal(res2.status, "pending");
  assert.match(res2.message, /not updated yet/);
});

test("waitForPaymentResult: paid status returns immediately", async () => {
  setRoutes({ pollRows: [{ status: "paid", result_desc: "ok", mpesa_receipt: "R10" }] });
  const res2 = await waitForPaymentResult("ANY_ID", 5000, 5);
  assert.equal(res2.status, "paid");
  assert.equal(res2.receipt, "R10");
});

test("waitForPaymentResult: failed status returns failed", async () => {
  setRoutes({ pollRows: [{ status: "failed", result_desc: "cancelled", mpesa_receipt: null }] });
  const res2 = await waitForPaymentResult("ANY_ID", 5000, 5);
  assert.equal(res2.status, "failed");
});
