import { useEffect, useRef, useState } from "react";

// Cloudflare Turnstile widget (env-gated).
//
// Renders nothing unless VITE_TURNSTILE_SITEKEY is configured. When enabled,
// the parent form must pass the solved token to the backend as `captchaToken`
// in the request body — the backend verifies it via TURNSTILE_SECRET_KEY.

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITEKEY as string | undefined;

export const isCaptchaEnabled = () => Boolean(SITE_KEY);

let scriptPromise: Promise<void> | null = null;

const loadTurnstileScript = (): Promise<void> => {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-csa-turnstile]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Turnstile script failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.dataset.csaTurnstile = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script failed"));
    document.head.appendChild(script);
  });
  return scriptPromise;
};

interface TurnstileProps {
  /** Receives the solved token, or null when expired/reset */
  onToken: (token: string | null) => void;
  /** Increment to force a fresh challenge (e.g. after a failed submit) */
  resetSignal?: number;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
  }
}

const Turnstile: React.FC<TurnstileProps> = ({ onToken, resetSignal = 0, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!SITE_KEY || !containerRef.current) return;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        if (widgetIdRef.current !== null) return; // already rendered
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: "auto",
          callback: (token: string) => onToken(token),
          "expired-callback": () => onToken(null),
          "error-callback": () => setFailed(true),
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* widget already gone */
        }
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Force a fresh challenge when the parent signals it.
  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current !== null && window.turnstile) {
      onToken(null);
      window.turnstile.reset(widgetIdRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  if (!SITE_KEY) return null;

  if (failed) {
    return (
      <div className={`text-xs text-rose-600 ${className ?? ""}`}>
        Verification widget failed to load — please refresh the page.
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
};

export default Turnstile;
