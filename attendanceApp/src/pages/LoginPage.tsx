import { useState } from "react";
import { LogIn, Loader2 } from "lucide-react";
import { login, getApiErrorMessage } from "../api/client";
import { setSession } from "../db/db";

interface Props {
  onLogin: (token: string) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [reg, setReg] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(reg, password);
      localStorage.setItem("csa_attendance_token", res.accessToken);
      await setSession("token", res.accessToken);
      await setSession("name", res.name || "");
      onLogin(res.accessToken);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-wrap" onSubmit={submit}>
      <div className="login-logo">
        <img src="/icons/app-icon-512.png" alt="CSA Attendance" className="login-logo-img" />
      </div>
      <h1 className="login-title">CSA Attendance</h1>
      <p className="login-sub">Works offline — sign in once to prepare this device.</p>

      {error && <div className="banner error" style={{ marginBottom: 14 }}>{error}</div>}

      <div className="field">
        <label>Registration Number</label>
        <input
          className="input"
          value={reg}
          onChange={(e) => setReg(e.target.value)}
          placeholder="e.g. CSK-2026-001"
          autoCapitalize="characters"
          autoComplete="username"
        />
      </div>
      <div className="field">
        <label>Password</label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          autoComplete="current-password"
        />
      </div>

      <button className="btn btn-primary btn-block" type="submit" disabled={loading || !reg || !password}>
        {loading ? <Loader2 size={18} className="spin" /> : <LogIn size={18} />}
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 16 }}>
        Requires internet only for sign-in and syncing saved records.
      </p>
    </form>
  );
}