import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { isSupabaseConfigured } from '../services/supabase';
import { INITIAL_USERS } from '../data/sampleCatalog';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isSupabase: boolean;
  login: (email: string, password?: string, intendedRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { name: string; email: string; phone: string; role: UserRole; businessName?: string; businessAddress?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => StorageService.getCurrentUser());
  const isSupabase = isSupabaseConfigured();

  useEffect(() => {
    if (user) {
      StorageService.setCurrentUser(user);
    } else {
      StorageService.clearCurrentUser();
    }
  }, [user]);

  const login = async (email: string, _password?: string, intendedRole?: UserRole) => {
    // Check against local stored users
    const users = StorageService.getUsers();
    let found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // If not found by exact email, check if intendedRole matched default demo user
    if (!found && intendedRole) {
      found = users.find(u => u.role === intendedRole);
    }

    if (found) {
      if (!found.isActive) {
        return { success: false, error: 'This account has been deactivated. Contact support.' };
      }
      setUser(found);
      return { success: true };
    }

    // Auto-create demo user if new email
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].toUpperCase(),
      email,
      phone: '+91 98765 00000',
      role: intendedRole || 'customer',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    StorageService.updateUser(newUser);
    setUser(newUser);
    return { success: true };
  };

  const signup = async (data: { 
    name: string; 
    email: string; 
    phone: string; 
    role: UserRole; 
    businessName?: string;
    businessAddress?: string;
  }) => {
    const users = StorageService.getUsers();
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      businessName: data.businessName,
      businessAddress: data.businessAddress,
      sellerVerificationStatus: data.role === 'seller' ? 'Pending' : undefined,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    StorageService.updateUser(newUser);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    StorageService.clearCurrentUser();
  };

  const switchRole = (newRole: UserRole) => {
    const users = StorageService.getUsers();
    let target = users.find(u => u.role === newRole);
    if (!target) {
      target = INITIAL_USERS.find(u => u.role === newRole) || INITIAL_USERS[0];
    }
    setUser(target);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    StorageService.updateUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'customer',
        isAuthenticated: !!user,
        isSupabase,
        login,
        signup,
        logout,
        switchRole,
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
