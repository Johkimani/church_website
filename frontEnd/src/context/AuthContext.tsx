import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { LocalStorage } from '../utils';
import axios from 'axios';
import { BASE_URL } from '../api/config';

interface UserData {
  accessToken: string;
  refreshToken: string;
  role: string | string[];
  name: string;
  email: string;
  status: string;
  jumuiya_id: string;
  member_id?: string;
  year?: string;
  forcePasswordChange?: boolean;
  hasEmail?: boolean;
}

interface AuthContextType {
  user: UserData | null;
  login: (data: UserData) => void;
  logout: () => void;
  register: () => void;
  isAuthenticated: boolean;
  refreshSession: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  isAuthenticated: false,
  refreshSession: async () => null,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<UserData | null>(() => {
    const storedData = LocalStorage.get('userdata');
    if (storedData && storedData.status === 'success') {
      return storedData;
    }
    return null;
  });

  const refreshSession = useCallback(async (): Promise<string | null> => {
    const storedData = LocalStorage.get('userdata');
    if (!storedData || storedData.status !== 'success') return null;

    const token = storedData.accessToken;
    if (typeof token !== 'string' || token.split('.').length !== 3) {
      LocalStorage.remove('userdata');
      setUser(null);
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (!isExpired) {
        setUser((prev) =>
          prev && prev.accessToken === storedData.accessToken ? prev : storedData
        );
        return storedData.accessToken;
      }

      if (!storedData.refreshToken) {
        LocalStorage.remove('userdata');
        setUser(null);
        return null;
      }

      const { data } = await axios.post(`${BASE_URL}/authentication/refresh`, {
        refreshToken: storedData.refreshToken,
      });

      const updated = {
        ...storedData,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || storedData.refreshToken,
      };
      setUser(updated);
      LocalStorage.set('userdata', updated);
      return updated.accessToken;
    } catch (err) {
      // Only end the session on a definitive auth rejection (4xx from the
      // refresh endpoint). Transient network/server failures (backend waking
      // up, no internet) must not wipe a still-valid session.
      const isRejected =
        axios.isAxiosError(err) &&
        err.response?.status !== undefined &&
        err.response.status >= 400 &&
        err.response.status < 500;
      if (isRejected) {
        LocalStorage.remove('userdata');
        setUser(null);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const id = setInterval(() => {
      refreshSession();
    }, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [refreshSession]);

  const login = (data: UserData) => {
    setUser(data);
    LocalStorage.set('userdata', data);
  };

  const logout = () => {
    setUser(null);
    LocalStorage.remove('userdata');
  };

  const register = () => {};

  const isAuthenticated = !!user && user.status === 'success';

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
