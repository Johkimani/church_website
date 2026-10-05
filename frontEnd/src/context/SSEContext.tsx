/**
 * SSEContext — manages a persistent Server-Sent Events connection for the
 * currently authenticated user.
 *
 * Three logical channels are served by a single EventSource connection:
 *   • CSA       – every user is enrolled automatically (server side)
 *   • Jumuiya   – routed by jumuiya_id embedded in the JWT (server side)
 *   • Individual – targeted sendToUser() calls (badge count updates)
 *
 * Consumers subscribe to typed events via the `subscribe` helper.
 * EventSource auto-reconnects on network drops (native browser behaviour).
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { UPLOAD_BASE } from "../api/config";

const SERVER_ROOT =
  UPLOAD_BASE || (import.meta.env.DEV ? "http://localhost:3001" : "");

export type SSEEventName =
  | "connected"
  | "notification_new"
  | "notification_updated"
  | "notification_deleted"
  | "unread_count";

type SSEListener<T = any> = (data: T) => void;

interface SSEContextType {
  /** Whether the EventSource is currently open and connected. */
  isConnected: boolean;
  /**
   * Subscribe to a named SSE event.
   * Returns an unsubscribe function — call it in the consumer's cleanup.
   */
  subscribe: <T = any>(event: SSEEventName, handler: SSEListener<T>) => () => void;
}

const SSEContext = createContext<SSEContextType>({
  isConnected: false,
  subscribe: () => () => {},
});

export const SSEProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, refreshSession } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  /** Listener registry: event name → Set of handlers */
  const listenersRef = useRef<Map<SSEEventName, Set<SSEListener>>>(new Map());
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const dispatch = useCallback((eventName: SSEEventName, data: any) => {
    listenersRef.current.get(eventName)?.forEach((handler) => {
      try {
        handler(data);
      } catch (err) {
        console.warn("[SSE] Handler error:", err);
      }
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const connect = async () => {
      if (!mountedRef.current) return;

      // Ensure a valid (non-expired) access token before opening the stream.
      // refreshSession reads localStorage, rotates the token if expired, and
      // returns the token to use for this connection attempt.
      const token = await refreshSession();
      if (!mountedRef.current || !token) return;

      const sseUrl = `${SERVER_ROOT}/api/v1/notifications/sse?token=${encodeURIComponent(
        token
      )}`;

      const es = new EventSource(sseUrl);
      esRef.current = es;

      es.addEventListener("connected", () => {
        if (mountedRef.current) setIsConnected(true);
      });

      const sseEvents: SSEEventName[] = [
        "notification_new",
        "notification_updated",
        "notification_deleted",
        "unread_count",
      ];

      sseEvents.forEach((name) => {
        es.addEventListener(name, (e: MessageEvent) => {
          try {
            dispatch(name, JSON.parse(e.data));
          } catch {
            /* ignore parse error */
          }
        });
      });

      es.onerror = () => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        es.close();
        // EventSource readyState 2 = CLOSED; schedule reconnect.
        // connect() calls refreshSession() again so a reconnect triggered by an
        // expired token uses a freshly refreshed token instead of re-sending the
        // same expired JWT (which previously caused a 401 reconnect loop).
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(connect, 3_000);
      };
    };

    if (user?.accessToken) {
      connect();
    } else {
      esRef.current?.close();
      esRef.current = null;
      setIsConnected(false);
    }

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      esRef.current?.close();
      esRef.current = null;
      setIsConnected(false);
    };
    // Re-connect when the access token changes (login / logout / refresh).
  }, [user?.accessToken, refreshSession]);

  const subscribe = useCallback(
    <T = any>(event: SSEEventName, handler: SSEListener<T>) => {
      if (!listenersRef.current.has(event)) {
        listenersRef.current.set(event, new Set());
      }
      listenersRef.current.get(event)!.add(handler as SSEListener);

      // Return unsubscribe function
      return () => {
        listenersRef.current.get(event)?.delete(handler as SSEListener);
      };
    },
    []
  );

  return (
    <SSEContext.Provider value={{ isConnected, subscribe }}>
      {children}
    </SSEContext.Provider>
  );
};

export const useSSE = () => useContext(SSEContext);
