import { useEffect, useState } from "react";
import { PencilLine, History, Wifi, WifiOff } from "lucide-react";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import { getSession } from "./db/db";
import { syncPending } from "./sync/sync";
import LoginPage from "./pages/LoginPage";
import RecordPage from "./pages/RecordPage";
import PendingPage from "./pages/PendingPage";
import InstallButton from "./components/InstallButton";

type Tab = "record" | "pending";

export default function App() {
  const network = useNetworkStatus();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("record");
  const [pending, setPending] = useState(0);
  const [syncMsg, setSyncMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const loadAuth = async () => {
    const t = await getSession("token");
    setToken(t);
    setReady(true);
  };

  const refreshPendingCount = async () => {
    const { pendingCount } = await import("./sync/sync");
    setPending(await pendingCount());
  };

  useEffect(() => {
    loadAuth();
  }, []);

  useEffect(() => {
    const onAuthExpired = () => {
      setToken(null);
      setSyncMsg(null);
    };
    window.addEventListener("csa:auth-expired", onAuthExpired);
    return () => window.removeEventListener("csa:auth-expired", onAuthExpired);
  }, []);

  useEffect(() => {
    if (ready) refreshPendingCount();
  }, [ready]);

  // Auto-sync the moment connectivity returns (and on first load when online).
  useEffect(() => {
    if (!token || network !== "online") return;
    let cancelled = false;
    const doSync = async () => {
      const res = await syncPending(token);
      if (cancelled) return;
      if (res.pushed > 0) {
        setSyncMsg({
          ok: true,
          text: `Synced ${res.pushed} record${res.pushed === 1 ? "" : "s"} to the server`,
        });
        refreshPendingCount();
      }
    };
    doSync();
    const timers = window.setTimeout(() => setSyncMsg(null), 4000);
    return () => {
      cancelled = true;
      clearTimeout(timers);
    };
  }, [token, network]);

  if (!ready) {
    return (
      <div className="app-shell">
        <main className="app-main">Loading…</main>
      </div>
    );
  }

  if (!token) {
    return (
      <LoginPage
        onLogin={(newToken) => {
          setToken(newToken);
          setTab("record");
          refreshPendingCount();
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        <div className={`banner ${network}`}>
          {network === "online" ? <Wifi size={16} /> : <WifiOff size={16} />}
          {network === "online"
            ? "Online — new records sync automatically"
            : "Offline — records are saved on this device and will sync later"}
        </div>
        {syncMsg && (
          <div className={`banner ${syncMsg.ok ? "online" : "error"}`}>{syncMsg.text}</div>
        )}

        <InstallButton />

        {tab === "record" ? (
          <RecordPage token={token} onSaved={refreshPendingCount} />
        ) : (
          <PendingPage
            token={token}
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
      </nav>
    </div>
  );
}