import { createContext, useState, useContext, useEffect } from 'react';
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<UserData | null>(() => {
    const storedData = LocalStorage.get('userdata');
    if (storedData && storedData.status === 'success') {
      return storedData;
    }
    return null;
  });

  useEffect(() => {
    const storedData = LocalStorage.get('userdata');
    if (!storedData || storedData.status !== 'success') return;

    const tryRefresh = async () => {
      const token = storedData.accessToken;
      if (typeof token !== 'string' || token.split('.').length !== 3) {
        LocalStorage.remove('userdata');
        setUser(null);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();

        if (!isExpired) return;

        if (!storedData.refreshToken) {
          LocalStorage.remove('userdata');
          setUser(null);
          return;
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
      } catch {
        LocalStorage.remove('userdata');
        setUser(null);
      }
    };

    tryRefresh();
  }, []);

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
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated }}>
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