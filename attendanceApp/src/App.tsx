import { useEffect, useState } from "react";
import { PencilLine, History, Wifi, WifiOff, Download, LogOut } from "lucide-react";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import { getSession, clearSession } from "./db/db";
import { syncPending, getAuthToken, registerBackgroundSync, requestSwFlush } from "./sync/sync";
import LoginPage from "./pages/LoginPage";
import RecordPage from "./pages/RecordPage";
import PendingPage from "./pages/PendingPage";
import InstallButton from "./components/InstallButton";

type Tab = "record" | "pending";
type Splash = "show" | "fade" | "gone";

export default function App() {
  const network = useNetworkStatus();
  const [token, setToken] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("record");
  const [pending, setPending] = useState(0);
  const [syncMsg, setSyncMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [splash, setSplash] = useState<Splash>("show");
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [recordedBy, setRecordedBy] = useState<"coordinator" | "assistant">("coordinator");

  useEffect(() => {
    const t1 = window.setTimeout(() => setSplash("fade"), 1200);
    const t2 = window.setTimeout(() => setSplash("gone"), 1700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const loadAuth = async () => {
    const t = await getSession("token");
    setToken(t);
    if (!t) {
      const mode = await getSession("mode");
      if (mode === "offline") setOfflineMode(true);
    }
    const rb = await getSession("recordedBy");
    if (rb === "coordinator" || rb === "assistant") setRecordedBy(rb);
    setReady(true);
  };

  const refreshPendingCount = async () => {
    const { pendingCount, registerBackgroundSync } = await import("./sync/sync");
    const count = await pendingCount();
    setPending(count);
    // Keep a background sync armed while records are still waiting, so they
    // upload on the next network connection even if the app is never reopened.
    if (count > 0) registerBackgroundSync();
  };

  const handleLogout = async () => {
    if (!confirm("Sign out? Pending records will stay on this device.")) return;
    localStorage.removeItem("csa_attendance_token");
    await clearSession();
    setToken(null);
    setOfflineMode(false);
    setTab("record");
  };

  useEffect(() => {
    loadAuth();
  }, []);

  // The service worker can upload records in the background (app closed).
  // When it reports a push, refresh the badge and show a confirmation.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      const data = event.data || {};
      if (data.type !== "csa:background-sync") return;
      const n = Number(data.pushed) || 0;
      if (n > 0) {
        setSyncMsg({
          ok: true,
          text: `Synced ${n} record${n === 1 ? "" : "s"} to the server in the background`,
        });
      }
      refreshPendingCount();
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const onAuthExpired = async () => {
      const mode = await getSession("mode");
      setToken(null);
      setSyncMsg(null);
      // If this device was offline-unlocked, stay in the app instead of
      // dead-ending on a login screen that needs internet.
      if (mode === "offline") setOfflineMode(true);
    };
    window.addEventListener("csa:auth-expired", onAuthExpired);
    return () => window.removeEventListener("csa:auth-expired", onAuthExpired);
  }, []);

  useEffect(() => {
    const onUpdate = () => setUpdateAvailable(true);
    window.addEventListener("csa:update-available", onUpdate);
    return () => window.removeEventListener("csa:update-available", onUpdate);
  }, []);

  useEffect(() => {
    if (ready) refreshPendingCount();
  }, [ready]);

  // Auto-sync the moment connectivity returns (and on first load when online).
  useEffect(() => {
    if (network !== "online") return;
    let cancelled = false;
    const doSync = async () => {
      // Ask the service worker to flush too — this is the path that also
      // covers the app being closed, and it is safe to run alongside the
      // in-app sync because each date is upserted on the server.
      requestSwFlush();
      const auth = await getAuthToken();
      const res = await syncPending(auth);
      if (cancelled) return;
      if (res.pushed > 0) {
        setSyncMsg({
          ok: true,
          text: `Synced ${res.pushed} record${res.pushed === 1 ? "" : "s"} to the server`,
        });
        refreshPendingCount();
      } else if (res.failed > 0) {
        setSyncMsg({
          ok: false,
          text: `${res.failed} record${res.failed === 1 ? "" : "s"} failed to sync. Open Saved tab to retry.`,
        });
        refreshPendingCount();
      } else if (!getAuthToken()) {
        const { pendingCount: pc } = await import("./sync/sync");
        const count = await pc();
        if (count > 0) {
          setSyncMsg({
            ok: false,
            text: `${count} unsynced record${count === 1 ? "" : "s"}. Log in online to sync them.`,
          });
        }
      }
    };
    doSync();
    const timers = window.setTimeout(() => setSyncMsg(null), 6000);
    return () => {
      cancelled = true;
      clearTimeout(timers);
    };
  }, [network]);

  // Also attempt to sync when the app becomes visible while online (e.g.
  // coordinator switches back to the app after it was backgrounded offline).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible" || network !== "online") return;
      (async () => {
        const auth = await getAuthToken();
        const res = await syncPending(auth);
        if (res.pushed > 0) {
          setSyncMsg({
            ok: true,
            text: `Synced ${res.pushed} record${res.pushed === 1 ? "" : "s"} to the server`,
          });
        } else if (res.failed > 0) {
          setSyncMsg({
            ok: false,
            text: `${res.failed} record${res.failed === 1 ? "" : "s"} failed to sync. Open Saved tab to retry.`,
          });
        }
        refreshPendingCount();
      })();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [network]);

  return (
    <>
      {splash !== "gone" && (
        <div className={`splash ${splash === "fade" ? "fade" : ""}`}>
          <div className="splash-logo">
            <img src="/icons/app-icon-512.png" alt="CSA Attendance" className="splash-logo-img" />
          </div>
          <div className="splash-name">CSA Attendance</div>
        </div>
      )}

      {!ready ? (
        <div className="app-shell">
          <main className="app-main">Loading…</main>
        </div>
      ) : !token && !offlineMode ? (
        <LoginPage
          onLogin={(newToken, role) => {
            if (newToken) {
              setToken(newToken);
              setOfflineMode(false);
            } else {
              setOfflineMode(true);
            }
            const roles = role || [];
            if (roles.includes("assistant_jumuiya_coordinator")) {
              setRecordedBy("assistant");
            } else {
              setRecordedBy("coordinator");
            }
            setTab("record");
            refreshPendingCount();
          }}
        />
      ) : (
        <div className="app-shell">
      <main className="app-main">
        <div className={`banner ${network}`}>
          {network === "online" ? <Wifi size={16} /> : <WifiOff size={16} />}
          {network === "online"
            ? offlineMode
              ? "Offline session — sign in again to re-sync with the server"
              : "Online — new records sync automatically"
            : "Offline — records are saved on this device and will sync later"}
        </div>
        {syncMsg && (
          <div className={`banner ${syncMsg.ok ? "online" : "error"}`}>{syncMsg.text}</div>
        )}
        {updateAvailable && (
          <div
            className="banner"
            style={{ background: "#eff6ff", color: "#2563eb", cursor: "pointer" }}
            onClick={() => window.location.reload()}
          >
            <Download size={16} />
            New version available — tap to refresh
          </div>
        )}

        <InstallButton />

        {tab === "record" ? (
          <RecordPage token={token || ""} onSaved={refreshPendingCount} recordedBy={recordedBy} />
        ) : (
          <PendingPage
            token={token || ""}
            pending={pending}
            onSynced={(n) => {
              if (n > 0) setSyncMsg({ ok: true, text: `Synced ${n} records` });
              refreshPendingCount();
            }}
          />
        )}
      </main>

      <nav className="bottom-nav">
        <button className={tab === "record" ? "active" : ""} onClick={() => setTab("record")}>
          <PencilLine size={20} />
          Record
        </button>
        <button className={tab === "pending" ? "active" : ""} onClick={() => setTab("pending")}>
          <History size={20} />
          Saved
          {pending > 0 && <span className="badge">{pending > 99 ? "99+" : pending}</span>}
        </button>
        <button onClick={handleLogout}>
          <LogOut size={20} />
          Sign out
        </button>
      </nav>
        </div>
      )}
    </>
  );
}