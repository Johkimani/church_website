

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "./AuthContext.tsx";

const parseJwtPayload = (token: string) => {
  try {
    const payloadBase64 = token.split('.')[1];
    return JSON.parse(atob(payloadBase64));
  } catch {
    return null;
  }
};

const isJwtExpired = (token: string) => {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 < Date.now();
};

// Function to establish a socket connection with authorization token
const getSocket = async (token: string | undefined): Promise<ReturnType<typeof import("socket.io-client")> | null> => {
  if (!token) return null;
  // Basic JWT format check (3 parts separated by dots). Prevent connecting with malformed tokens.
  if (typeof token === 'string' && token.split('.').length !== 3) {
    console.warn('Socket connection aborted: malformed JWT token');
    return null;
  }
  if (typeof token === 'string' && isJwtExpired(token)) {
    return null;
  }
  try {
    const { io } = await import("socket.io-client");
    const socketUri = import.meta.env.VITE_SOCKET_URI || 'http://localhost:3001';
    return io(socketUri, {
      withCredentials: true,
      auth: { token },
    });
  } catch (err) {
    console.error('Failed to initialize socket client', err);
    return null;
  }
};

// Create a context to hold the socket instance
type Socket = ReturnType<typeof import("socket.io-client")>;
const SocketContext = createContext<{ socket: Socket | null }>({ socket: null });

// Custom hook to access the socket instance from the context
const useSocket = () => useContext(SocketContext);

// SocketProvider component to manage the socket instance and provide it through context
const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (user?.accessToken) {
      getSocket(user.accessToken).then((newSocket) => {
        if (cancelled) {
          newSocket?.close();
          return;
        }
        if (newSocket) {
          newSocket.on("connect_error", (err: any) => {
            if (err?.message?.toLowerCase?.().includes("jwt expired")) {
              console.warn("Socket connection failed due to expired JWT. Closing socket.");
              newSocket.close();
            }
          });
        }
        setSocket(newSocket);
      });
    } else {
      setSocket(null);
    }
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
