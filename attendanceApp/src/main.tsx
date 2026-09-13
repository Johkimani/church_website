import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/* ── Service worker with auto-update detection ── */
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  let currentVersion: string | null = null;

  const checkForUpdate = async () => {
    try {
      const res = await fetch("/version.json", { cache: "no-store" });
      const { version } = await res.json();
      const remoteV = String(version);

      // First load — just record the version.
      if (currentVersion === null) {
        currentVersion = remoteV;
        return;
      }

      // Version changed → new code is deployed.
      if (remoteV !== currentVersion) {
        currentVersion = remoteV;
        // Tell the waiting service worker to activate.
        const reg = await navigator.serviceWorker?.ready;
        reg?.waiting?.postMessage({ type: "SKIP_WAITING" });
        // Notify the app so it can show a banner.
        window.dispatchEvent(new Event("csa:update-available"));
      }
    } catch {
      // Offline or network error — ignore.
    }
  };

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      // Check for updates every 60 seconds.
      setInterval(checkForUpdate, 60_000);
      // Also check once right after registration.
      checkForUpdate();
      // Listen for new SW taking control.
      reg.addEventListener("updatefound", () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.addEventListener("statechange", () => {
          if (newSW.state === "installed") {
            // New SW installed but not yet active — prompt update.
            window.dispatchEvent(new Event("csa:update-available"));
          }
        });
      });
    } catch {
      // Registration failed — ignore.
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
