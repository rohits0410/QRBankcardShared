import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: number | null;
  username: string | null;
  login: (token: string, userId: number, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Check auth on mount
    const token = localStorage.getItem('token');
    if (token) {
      const user = authService.getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.userId);
        setUsername(user.username);
      }
    }
  }, []);

  const login = (token: string, uid: number, uname: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', uid.toString());
    localStorage.setItem('username', uname);
    setIsAuthenticated(true);
    setUserId(uid);
    setUsername(uname);
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUserId(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userId, username, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}