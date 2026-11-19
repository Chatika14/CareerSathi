import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User, Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await api.auth.getMe();
      setUser({
        id: data.id,
        email: data.email,
        role: data.role,
        full_name: data.profile?.full_name,
        onboarding_completed: data.profile?.onboarding_completed,
      });
      setProfile(data.profile);
    } catch {
      api.clearToken();
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.auth.login({ email, password: pass });
    api.setToken(res.access_token);
    await refreshUser();
  };

  const register = async (email: string, pass: string, name: string) => {
    const res = await api.auth.register({ email, password: pass, full_name: name });
    api.setToken(res.access_token);
    await refreshUser();
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  };

  const updateProfile = async (data: Partial<Profile>) => {
    const updated = await api.auth.updateProfile(data);
    setProfile(updated);
    if (user) {
      setUser({
        ...user,
        full_name: updated.full_name,
        onboarding_completed: updated.onboarding_completed,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
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
