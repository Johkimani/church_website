import { useEffect, useState } from "react";

export type NetworkStatus = "online" | "offline";

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(
    typeof navigator !== "undefined" && navigator.onLine ? "online" : "offline"
  );

  useEffect(() => {
    const onOnline = () => setStatus("online");
    const onOffline = () => setStatus("offline");
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return status;
}
