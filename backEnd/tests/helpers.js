export const mockRes = () => {
  const res = {
    _status: null,
    _json: null,
    cookies: [],
    cleared: [],
    status(code) {
      this._status = code;
      return this;
    },
    json(body) {
      if (this._status === null) this._status = 200;
      this._json = body;
      return this;
    },
    cookie(name, val, opts) {
      this.cookies.push({ name, val, opts });
      return this;
    },
    clearCookie(name, opts) {
      this.cleared.push({ name, opts });
      return this;
    },
  };
  return res;
};

export const mockReq = (overrides = {}) => ({
  body: {},
  cookies: {},
  secure: false,
  ...overrides,
});

export const createJwtMock = () => {
  const state = { invalidRefresh: false, invalidAccess: false };
  const mock = {
    JWT_ISSUER: "csa-kirinyaga",
    JWT_AUDIENCE: "csakyu.com",
    signAccessToken: (p) => `ACCESS_${p?.id ?? ""}`,
    signRefreshToken: (p) => `REFRESH_${p?.id ?? ""}`,
    verifyAccessToken: (t) => {
      if (state.invalidAccess || t === "ACCESS_BAD") throw new Error("jwt expired");
      return { id: t.replace("ACCESS_", "") };
    },
    verifyRefreshToken: (t) => {
      if (state.invalidRefresh || t === "REFRESH_BAD") throw new Error("jwt expired");
      return { id: t.replace("REFRESH_", "") };
    },
    decodeRefreshToken: (t) => ({ id: t.replace("REFRESH_", "") }),
    decodeAccessToken: (t) => ({ id: t.replace("ACCESS_", "") }),
  };
  return { state, mock };
};

export const createBcryptMock = () => {
  const state = { knownPassword: "Passw0rd!", compares: [], hashes: [] };
  const mock = {
    hash: async (pw, rounds) => {
      state.hashes.push([pw, rounds]);
      return `HASH_${pw}`;
    },
    compare: async (a, b) => {
      state.compares.push([a, b]);
      if (b === `HASH_${a}`) return true;
      return a === state.knownPassword;
    },
    genSalt: async () => "salt",
  };
  return { state, mock };
};

export const silentLogger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
  http() {},
  log() {},
  transports: [],
};
