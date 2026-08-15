import { test, mock } from "node:test";
import assert from "node:assert/strict";
import {
  mockRes,
  mockReq,
  createJwtMock,
  createBcryptMock,
  silentLogger,
} from "./helpers.js";

// ── Mocks ───────────────────────────────────────────────────────────────────
const { state: jwtState, mock: jwtMock } = createJwtMock();
const { state: bcryptState, mock: bcryptMock } = createBcryptMock();

// Mutable member store the fake db serves. Tests tweak this between cases.
const memberState = {
  member: null, // null = unknown member
  attempts: 0,
  lockedUntil: null,
  activeTokens: [], // rows for refreshAccessToken
  emailTaken: false,
  passwordHistory: [],
  sentMail: [],
  membersTable: new Map(),
};

const dbCalls = [];
const db = {
  query: async (text, params = []) => {
    dbCalls.push({ text, params });

    // Main login SELECT (member + roles)
    if (text.includes("FROM members m") && text.includes("GROUP BY m.member_id")) {
      if (!memberState.member) return { rows: [] };
      const m = { ...memberState.member };
      if (memberState.lockedUntil) m.locked_until = memberState.lockedUntil;
      m.failed_login_attempts = memberState.attempts;
      m.roles = memberState.member.roles || [];
      return { rows: [m] };
    }

    // refreshAccessToken: active tokens lookup
    if (text.includes("SELECT * FROM refresh_tokens")) {
      return { rows: memberState.activeTokens };
    }

    // refreshAccessToken: user reload
    if (text.includes("FROM members m") && text.includes("COALESCE")) {
      if (!memberState.member) return { rows: [] };
      return { rows: [memberState.member] };
    }

    // firstLoginSetup: member fetch
    if (text.includes("SELECT member_id, password, email FROM members")) {
      if (!memberState.member) return { rows: [] };
      return { rows: [memberState.member] };
    }

    // email-taken probe
    if (text.includes("SELECT 1 FROM members WHERE lower(email)")) {
      return { rows: memberState.emailTaken ? [{ "?column?": 1 }] : [] };
    }

    // password history read (assertNotRecentlyUsed)
    if (text.includes("SELECT password_hash FROM password_history")) {
      return { rows: memberState.passwordHistory };
    }

    // UPDATE members: reset attempts on success
    if (text.includes("SET failed_login_attempts = 0, locked_until = NULL")) {
      memberState.attempts = 0;
      memberState.lockedUntil = null;
      return { rows: [memberState.member] };
    }

    // UPDATE members: increment attempts
    if (text.includes("SET failed_login_attempts = $2")) {
      memberState.attempts = params[1];
      return { rows: [memberState.member] };
    }

    // UPDATE members: lock account
    if (text.includes("locked_until = NOW()")) {
      memberState.attempts = 0;
      memberState.lockedUntil = new Date(Date.now() + 60_000).toISOString();
      return { rows: [memberState.member] };
    }

    // INSERT refresh token (login + rotation)
    if (text.includes("INSERT INTO refresh_tokens")) {
      return { rows: [] };
    }

    // DELETE refresh token (rotation/logout)
    if (text.includes("DELETE FROM refresh_tokens")) {
      return { rows: [] };
    }

    // recordPassword / password update
    if (text.includes("INSERT INTO password_history")) return { rows: [] };
    if (text.includes("DELETE FROM password_history")) return { rows: [] };
    if (text.includes("UPDATE members SET password")) return { rows: [memberState.member] };
    if (text.includes("DELETE FROM password_resets")) return { rows: [] };
    if (text.includes("INSERT INTO password_resets")) return { rows: [] };

    throw new Error(`Fake db: no route for query:\n${text}`);
  },
};

mock.module("../src/Configs/dbConfig.js", { namedExports: { db } });
mock.module("../src/logger/winston.js", { defaultExport: silentLogger });
mock.module("../src/utils/jwtConfig.js", { namedExports: jwtMock });
mock.module("bcrypt", { defaultExport: bcryptMock });
mock.module("../src/Configs/emailConfig.js", {
  defaultExport: async (subject, text, to) => {
    memberState.sentMail.push({ subject, text, to });
    return { id: "mail1" };
  },
  namedExports: {
    sendMail: async () => ({ id: "mail1" }),
    sendEmail: async () => ({ id: "mail1" }),
    isConfigured: () => true,
  },
});

const { Login, refreshAccessToken, firstLoginSetup, logout } = await import(
  "../src/controllers/Login.js?auth"
);

const reset = (member = null) => {
  memberState.member = member;
  memberState.attempts = 0;
  memberState.lockedUntil = null;
  memberState.activeTokens = [];
  memberState.emailTaken = false;
  memberState.passwordHistory = [];
  memberState.sentMail.length = 0;
  memberState.membersTable.clear();
  bcryptState.compares.length = 0;
  dbCalls.length = 0;
};

const defaultMember = () => ({
  member_id: "PA100/G/2023/001",
  password: "HASH_Passw0rd!",
  jumuiya_id: "j1",
  first_name: "Paul",
  last_name: "O",
  email: "paul@example.com",
  failed_login_attempts: 0,
  locked_until: null,
  roles: ["admin"],
});

// ── Tests ───────────────────────────────────────────────────────────────────
test("Login: 400 when credentials missing", async () => {
  reset(defaultMember());
  const res = mockRes();
  await Login(mockReq({ body: {} }), res);
  assert.equal(res._status, 400);
});

test("Login: 401 for unknown member, no bcrypt work on real hash", async () => {
  reset(null);
  const res = mockRes();
  await Login(mockReq({ body: { userReg: "UNKNOWN123", password: "whatever" } }), res);
  assert.equal(res._status, 401);
  // Timing normalization burns a compare against the dummy hash.
  assert.equal(bcryptState.compares.length, 1);
  assert.ok(bcryptState.compares[0][0] !== "whatever");
});

test("Login: 401 wrong password increments attempts", async () => {
  reset(defaultMember());
  const res = mockRes();
  await Login(mockReq({ body: { userReg: "PA100/G/2023/001", password: "Wrong1!" } }), res);
  assert.equal(res._status, 401);
  assert.equal(memberState.attempts, 1);
});

test("Login: locks account after MAX_LOGIN_ATTEMPTS", async () => {
  reset(defaultMember());
  let lastStatus;
  for (let i = 0; i < 5; i++) {
    const res = mockRes();
    await Login(
      mockReq({ body: { userReg: "PA100/G/2023/001", password: "Wrong1!" } }),
      res,
    );
    lastStatus = res._status;
  }
  assert.equal(lastStatus, 429);
  assert.ok(memberState.lockedUntil, "account should be locked");
});

test("Login: 429 while account locked", async () => {
  reset(defaultMember());
  memberState.lockedUntil = new Date(Date.now() + 5 * 60_000).toISOString();
  const res = mockRes();
  await Login(
    mockReq({ body: { userReg: "PA100/G/2023/001", password: "Passw0rd!" } }),
    res,
  );
  assert.equal(res._status, 429);
});

test("Login: successful login returns tokens, sets cookie, stores refresh token", async () => {
  reset(defaultMember());
  const res = mockRes();
  await Login(
    mockReq({ body: { userReg: "PA100/G/2023/001", password: "Passw0rd!" } }),
    res,
  );
  assert.equal(res._status, 200);
  assert.equal(res._json.status, "success");
  assert.equal(res._json.accessToken, "ACCESS_PA100/G/2023/001");
  assert.ok(res.cookies.some((c) => c.name === "refreshToken"));
  const insert = dbCalls.find((c) => c.text.includes("INSERT INTO refresh_tokens"));
  assert.ok(insert, "refresh token should be stored");
  assert.equal(res._json.role[0], "admin");
  assert.equal(res._json.forcePasswordChange, false);
});

test("Login: forcePasswordChange when password equals reg number", async () => {
  reset(defaultMember());
  bcryptState.knownPassword = "PA100/G/2023/001";
  const res = mockRes();
  await Login(
    mockReq({ body: { userReg: "PA100/G/2023/001", password: "PA100/G/2023/001" } }),
    res,
  );
  assert.equal(res._status, 200);
  assert.equal(res._json.forcePasswordChange, true);
});

test("refreshAccessToken: 401 when no token provided", async () => {
  reset(defaultMember());
  const res = mockRes();
  await refreshAccessToken(mockReq({ body: {} }), res);
  assert.equal(res._status, 401);
});

test("refreshAccessToken: 401 when tab access token binds to different member", async () => {
  reset(defaultMember());
  const res = mockRes();
  await refreshAccessToken(
    mockReq({
      cookies: { refreshToken: "REFRESH_PA100/G/2023/001" },
      body: { accessToken: "ACCESS_OTHER_MEMBER" },
    }),
    res,
  );
  assert.equal(res._status, 401);
});

test("refreshAccessToken: 403 when no active tokens in db", async () => {
  reset(defaultMember());
  const res = mockRes();
  await refreshAccessToken(
    mockReq({
      cookies: { refreshToken: "REFRESH_PA100/G/2023/001" },
      body: { accessToken: "ACCESS_PA100/G/2023/001" },
    }),
    res,
  );
  assert.equal(res._status, 403);
});

test("refreshAccessToken: 403 for invalid refresh token", async () => {
  reset(defaultMember());
  memberState.activeTokens = [{ id: 1, token: "HASH_something_else" }];
  const res = mockRes();
  await refreshAccessToken(
    mockReq({
      cookies: { refreshToken: "REFRESH_PA100/G/2023/001" },
      body: { accessToken: "ACCESS_PA100/G/2023/001" },
    }),
    res,
  );
  assert.equal(res._status, 403);
});

test("refreshAccessToken: 200 rotates token and sets new cookie", async () => {
  reset(defaultMember());
  memberState.activeTokens = [
    { id: 7, member_id: "PA100/G/2023/001", token: "HASH_REFRESH_PA100/G/2023/001" },
  ];
  const res = mockRes();
  await refreshAccessToken(
    mockReq({
      cookies: { refreshToken: "REFRESH_PA100/G/2023/001" },
      body: { accessToken: "ACCESS_PA100/G/2023/001" },
    }),
    res,
  );
  assert.equal(res._status, 200);
  assert.equal(res._json.accessToken, "ACCESS_PA100/G/2023/001");
  assert.ok(res.cookies.some((c) => c.name === "refreshToken"));
  const del = dbCalls.find((c) => c.text.includes("DELETE FROM refresh_tokens"));
  assert.ok(del, "old token row should be deleted");
});

test("firstLoginSetup: 400 when fields missing", async () => {
  reset(defaultMember());
  const res = mockRes();
  await firstLoginSetup(mockReq({ body: { member_id: "x", currentPassword: "y" } }), res);
  assert.equal(res._status, 400);
});

test("firstLoginSetup: 400 when new password too short", async () => {
  reset(defaultMember());
  const res = mockRes();
  await firstLoginSetup(
    mockReq({
      body: {
        member_id: "PA100/G/2023/001",
        currentPassword: "Passw0rd!",
        newPassword: "short",
      },
    }),
    res,
  );
  assert.equal(res._status, 400);
});

test("firstLoginSetup: 404 for unknown member", async () => {
  reset(null);
  const res = mockRes();
  await firstLoginSetup(
    mockReq({
      body: {
        member_id: "NOPE",
        currentPassword: "Passw0rd!",
        newPassword: "NewPass1!",
      },
    }),
    res,
  );
  assert.equal(res._status, 404);
});

test("firstLoginSetup: 401 wrong current password", async () => {
  reset(defaultMember());
  const res = mockRes();
  await firstLoginSetup(
    mockReq({
      body: {
        member_id: "PA100/G/2023/001",
        currentPassword: "Wrong1!",
        newPassword: "NewPass1!",
      },
    }),
    res,
  );
  assert.equal(res._status, 401);
});

test("firstLoginSetup: updates password when email already on file", async () => {
  reset(defaultMember());
  const res = mockRes();
  await firstLoginSetup(
    mockReq({
      body: {
        member_id: "PA100/G/2023/001",
        currentPassword: "Passw0rd!",
        newPassword: "NewPass1!",
        email: "paul@example.com",
      },
    }),
    res,
  );
  assert.equal(res._status, 200);
  assert.equal(res._json.status, "success");
});

test("firstLoginSetup: 409 when email already linked to another account", async () => {
  reset(defaultMember());
  memberState.member = { ...defaultMember(), email: null };
  memberState.emailTaken = true;
  const res = mockRes();
  await firstLoginSetup(
    mockReq({
      body: {
        member_id: "PA100/G/2023/001",
        currentPassword: "Passw0rd!",
        newPassword: "NewPass1!",
        email: "other@example.com",
      },
    }),
    res,
  );
  assert.equal(res._status, 409);
});

test("firstLoginSetup: stages OTP and emails when no email on file", async () => {
  reset(defaultMember());
  memberState.member = { ...defaultMember(), email: null };
  const res = mockRes();
  await firstLoginSetup(
    mockReq({
      body: {
        member_id: "PA100/G/2023/001",
        currentPassword: "Passw0rd!",
        newPassword: "NewPass1!",
        email: "new@example.com",
        firstLogin: true,
      },
    }),
    res,
  );
  assert.equal(res._status, 200);
  assert.equal(res._json.status, "otp_required");
  assert.equal(memberState.sentMail.length, 1);
  assert.equal(memberState.sentMail[0].to, "new@example.com");
});

test("logout: revokes tokens and clears cookie", async () => {
  reset(defaultMember());
  const res = mockRes();
  await logout(
    mockReq({ cookies: { refreshToken: "REFRESH_PA100/G/2023/001" } }),
    res,
  );
  assert.equal(res._status, 200);
  assert.ok(res.cleared.some((c) => c.name === "refreshToken"));
  assert.ok(dbCalls.some((c) => c.text.includes("DELETE FROM refresh_tokens")));
});
