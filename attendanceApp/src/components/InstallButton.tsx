import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const showIosHint = isIos && !installed && !("standalone" in navigator);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  if (!deferred && !showIosHint) return null;

  const handleClick = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return (
    <div className="install-hint">
      {deferred ? (
        <button className="install-btn" onClick={handleClick}>
          <Download size={16} /> Install App
        </button>
      ) : (
        <p className="install-ios">
          <Download size={16} /> For an app icon: Share <span className="arrow">→</span> Add to Home Screen
        </p>
      )}
    </div>
  );
}
