import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import {  LocalStorage } from '../utils';

// Define the shape of User Data arriving from API and stored in localStorage
interface UserData {
  accessToken: string;
  refreshToken: string;
  role: string | string[];
  name: string; // Combined firstName and lastName as per backend change
  email: string;
  status: string; // e.g. "success"
  jumuiya_id: string;
}

interface AuthContextType {
  user: UserData | null;
  login: (data: UserData) => void;
  logout: () => void;
  register: () => void;
  isAuthenticated: boolean;
}

// Create the context with defaults
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  isAuthenticated: false,
});

// Create the provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  // Synchronously initialize state to prevent duplicate socket/API calls and loading lag
  const [user, setUser] = useState<UserData | null>(() => {
    const storedData = LocalStorage.get('userdata');
    if (storedData && storedData.status === 'success') {
      return storedData;
    }
    return null;
  });

  // Verify stored user session on mount and clean up if invalid
  useEffect(() => {
    const storedData = LocalStorage.get('userdata');
    if (storedData && storedData.status !== 'success') {
      LocalStorage.remove('userdata');
      setUser(null);
    }
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

  // Compute isAuthenticated based on user status
  const isAuthenticated = !!user && user.status === 'success';

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated }}
    >
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