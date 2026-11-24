import test from "node:test";
import assert from "node:assert/strict";
import requireRole, {
  OFFICIAL_ROLES,
  isOfficial,
} from "../src/middlewares/requireRole.js";
import {
  getCallerModuleScopes,
  canAccessCommunityModule,
} from "../src/middlewares/communityScopes.js";

const runMiddleware = (middleware, req) =>
  new Promise((resolve) => {
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        resolve({ status: this.statusCode, body });
        return this;
      },
    };
    middleware(req, res, () => resolve({ status: 200 }));
  });

test("CSA liturgist is not a generic official", () => {
  const req = { user: { role: ["liturgist"] } };

  assert.equal(OFFICIAL_ROLES.includes("liturgist"), false);
  assert.equal(isOfficial(req), false);
});

test("CSA liturgist passes only explicit liturgist routes", async () => {
  const req = { user: { role: ["liturgist"] } };

  const allowed = await runMiddleware(requireRole("liturgist"), req);
  assert.equal(allowed.status, 200);

  const denied = await runMiddleware(requireRole(...OFFICIAL_ROLES), req);
  assert.equal(denied.status, 404);
});

test("CSA liturgist has no community enrollment scope", () => {
  const req = { user: { role: ["liturgist"] } };

  assert.deepEqual(getCallerModuleScopes(req), { all: false, modules: [] });
  assert.equal(canAccessCommunityModule(req, "choir"), false);
});
