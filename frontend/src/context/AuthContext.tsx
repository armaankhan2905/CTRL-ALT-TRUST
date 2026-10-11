import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  simulatedDevice: string;
  simulatedIp: string;
  simulatedTime: string | null;
  setSimulatedDevice: (device: string) => void;
  setSimulatedIp: (ip: string) => void;
  setSimulatedTime: (time: string | null) => void;
  login: (email: string, pass: string) => Promise<void>;
  quickLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('trust_grid_token') || localStorage.getItem('scada_sentinel_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Simulation context overrides
  const [simulatedDevice, setSimulatedDevice] = useState('SCADA-PC-01');
  const [simulatedIp, setSimulatedIp] = useState('172.16.1.5');
  const [simulatedTime, setSimulatedTime] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
        } catch (err) {
          console.error("Auth init failed:", err);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await authAPI.login(cleanEmail, pass);
      localStorage.removeItem('scada_sentinel_token');
      localStorage.setItem('trust_grid_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: UserRole) => {
    let email = 'operator@trustgrid.local';
    let pass = 'operator123';
    if (role === 'ADMIN') {
      email = 'admin@trustgrid.local';
      pass = 'admin123';
    } else if (role === 'ENGINEER') {
      email = 'engineer@trustgrid.local';
      pass = 'engineer123';
    }
    await login(email, pass);
  };

  const logout = () => {
    localStorage.removeItem('trust_grid_token');
    localStorage.removeItem('scada_sentinel_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        simulatedDevice,
        simulatedIp,
        simulatedTime,
        setSimulatedDevice,
        setSimulatedIp,
        setSimulatedTime,
        login,
        quickLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
