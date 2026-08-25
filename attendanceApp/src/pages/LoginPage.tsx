import { useState } from "react";
import { LogIn, Loader2, WifiOff } from "lucide-react";
import { login, getApiErrorMessage, isNetworkError } from "../api/client";
import { setSession, getOfflineCredential } from "../db/db";
import {
  saveOfflineCredential,
  verifyOfflineCredential,
} from "../api/offlineAuth";

interface Props {
  onLogin: (token: string | null) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [reg, setReg] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [offlineUnlocked, setOfflineUnlocked] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const regNorm = reg.trim().toUpperCase();

    try {
      const res = await login(regNorm, password);
      localStorage.setItem("csa_attendance_token", res.accessToken);
      await setSession("token", res.accessToken);
      await setSession("name", res.name || "");
      await setSession("mode", "online");
      // Store a local verifier so this device can unlock without internet later
      try {
        await saveOfflineCredential(regNorm, password, {
          member_id: res.member_id,
          name: res.name,
          role: res.role,
          jumuiya_id: res.jumuiya_id,
        });
      } catch {
        /* non-fatal — offline sign-in just won't be available */
      }
      onLogin(res.accessToken);
    } catch (err) {
      if (!isNetworkError(err)) {
        // Server answered — genuine credentials/validation problem
        setError(getApiErrorMessage(err));
      } else {
        // No server response — try local verification (offline sign-in)
        const matched = await verifyOfflineCredential(regNorm, password);
        if (matched) {
          const cred = await getOfflineCredential();
          await setSession("token", "");
          await setSession("name", cred?.profile?.name || regNorm);
          await setSession("mode", "offline");
          setOfflineUnlocked(true);
          setTimeout(() => onLogin(null), 600);
        } else {
          const cred = await getOfflineCredential();
          setError(
            cred
              ? `No internet connection, and that password doesn't match what was used to activate offline sign-in on this device (${cred.regNumber}).`
              : "No internet connection, and this device hasn't been activated for offline sign-in yet. Connect once while online."
          );
        }
      }
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
      <p className="login-sub">Sign in once while online to activate offline sign-in on this device.</p>

      {offlineUnlocked && (
        <div className="banner online" style={{ marginBottom: 14 }}>
          <WifiOff size={15} style={{ verticalAlign: -3 }} /> Offline sign-in OK — opening…
        </div>
      )}
      {error && !offlineUnlocked && <div className="banner error" style={{ marginBottom: 14 }}>{error}</div>}

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
        Records are saved on this device and sync when internet returns. After your first
        online sign-in, this device can also verify your password offline.
      </p>
    </form>
  );
}
