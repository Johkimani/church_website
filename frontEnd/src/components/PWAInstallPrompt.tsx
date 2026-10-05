import { useState, useEffect } from 'react';
import { FaDownload, FaTimes, FaApple, FaAndroid } from 'react-icons/fa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Check if already installed (running in standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // Check if permanently hidden
    const hidden = localStorage.getItem('pwa_install_hidden');
    if (hidden === 'true') {
      setDismissed(true);
      return;
    }

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
      setShowIOS(true);
      return;
    }

    // Listen for Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    const installedHandler = () => setInstalled(true);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  const hidePermanently = () => {
    localStorage.setItem('pwa_install_hidden', 'true');
    setDismissed(true);
  };

  // Don't show if installed, dismissed, or no way to install
  if (installed || dismissed || (!deferredPrompt && !showIOS)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-auto sm:w-80 z-50">
      <div className="bg-white sm:rounded-2xl shadow-2xl border border-slate-200 sm:m-0 m-0">
        {/* Collapsed state — thin bar */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full flex items-center gap-3 px-4 py-3 sm:py-3 hover:bg-slate-50 transition-colors sm:rounded-2xl"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
              <FaDownload className="text-white" size={14} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-bold text-slate-800">Install CSA App</p>
              <p className="text-[10px] text-slate-500">Faster access + offline</p>
            </div>
            <FaTimes
              size={12}
              className="text-slate-400 hover:text-slate-600 shrink-0"
              onClick={(e) => { e.stopPropagation(); hidePermanently(); }}
            />
          </button>
        )}

        {/* Expanded state — full card */}
        {expanded && (
          <div className="p-4 sm:rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                <FaDownload className="text-white" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">Install CSA Kirinyaga</p>
                <p className="text-xs text-slate-500 mt-0.5">Add to home screen for faster access and offline use</p>
              </div>
              <button onClick={() => setExpanded(false)} className="text-slate-400 hover:text-slate-600 shrink-0">
                <FaTimes size={14} />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {/* Android/Chrome install */}
              {deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                >
                  <FaAndroid size={18} />
                  <span>Install Now</span>
                </button>
              )}

              {/* iOS instructions */}
              {showIOS && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FaApple size={16} className="text-slate-800" />
                    <span className="text-xs font-bold text-slate-800">iPhone / iPad</span>
                  </div>
                  <ol className="text-[11px] text-slate-600 space-y-1 list-decimal list-inside">
                    <li>Tap the <strong>Share</strong> button in Safari</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                    <li>Tap <strong>Add</strong> to confirm</li>
                  </ol>
                </div>
              )}

              <button
                onClick={hidePermanently}
                className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 py-1 transition-colors"
              >
                Don't show again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
