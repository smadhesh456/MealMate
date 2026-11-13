import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | 'guest';
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  signup: (data: { 
    name: string; 
    email: string; 
    phone: string; 
    password: string; 
    role: UserRole; 
    businessName?: string; 
    businessAddress?: string 
  }) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => StorageService.getCurrentUser());

  useEffect(() => {
    if (user) {
      StorageService.setCurrentUser(user);
    } else {
      StorageService.clearCurrentUser();
    }
  }, [user]);

  // Synchronize on mount if JWT token exists
  useEffect(() => {
    const token = localStorage.getItem('mealmate_jwt_token');
    if (token && user) {
      api.getMe().then(res => {
        if (res.success && res.user) {
          setUser(prev => prev ? { ...prev, name: res.user.name, email: res.user.email, role: res.user.role } : null);
        }
      }).catch(() => {
        // Keep existing stored profile if offline
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (!email || !email.trim() || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Authenticate with backend REST API (MySQL 8.0)
      const apiRes = await api.login(cleanEmail, password);
      
      if (apiRes.success && apiRes.user) {
        if (apiRes.token) {
          localStorage.setItem('mealmate_jwt_token', apiRes.token);
        }
        const profile: UserProfile = {
          id: apiRes.user.id,
          name: apiRes.user.name,
          email: apiRes.user.email,
          phone: apiRes.user.phone,
          role: apiRes.user.role, // strictly preserved from database!
          isActive: apiRes.user.accountStatus === 'active',
          avatarUrl: apiRes.user.avatarUrl,
          businessName: apiRes.user.businessName,
          businessAddress: apiRes.user.businessAddress,
          rewardPoints: apiRes.user.rewardPoints || 0,
          createdAt: new Date().toISOString()
        };
        setUser(profile);
        StorageService.updateUser(profile);
        return { success: true, user: profile };
      }

      // If backend returned a clear validation error (not found, incorrect password, deactivated, etc.)
      if (apiRes.error) {
        return { success: false, error: apiRes.error };
      }
    } catch {
      // API server offline or network unavailable: execute local verified authentication
    }

    // 2. Local Fallback Authentication
    const users = StorageService.getUsers();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    // If the email does not exist, show: "Account not found. Please register first."
    // Strictly NO account auto-creation and NO role-substitution during login!
    if (!found) {
      return { success: false, error: 'Account not found. Please register first.' };
    }

    if (!found.isActive) {
      return { success: false, error: 'This account has been deactivated. Please contact campus admin.' };
    }

    // Verify password against stored password
    if (found.password && found.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    setUser(found);
    return { success: true, user: found };
  };

  const signup = async (data: { 
    name: string; 
    email: string; 
    phone: string; 
    password: string;
    role: UserRole; 
    businessName?: string; 
    businessAddress?: string; 
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();

    try {
      // 1. Register with backend REST API
      const apiRes = await api.register({
        name: data.name.trim(),
        email: cleanEmail,
        phone: data.phone.trim(),
        password: data.password,
        role: data.role,
        businessName: data.businessName?.trim(),
        businessAddress: data.businessAddress?.trim()
      });

      if (apiRes.success && apiRes.user) {
        if (apiRes.token) {
          localStorage.setItem('mealmate_jwt_token', apiRes.token);
        }
        const profile: UserProfile = {
          id: apiRes.user.id,
          name: apiRes.user.name,
          email: apiRes.user.email,
          phone: apiRes.user.phone,
          password: data.password,
          role: apiRes.user.role,
          isActive: true,
          businessName: data.businessName,
          businessAddress: data.businessAddress,
          sellerVerificationStatus: data.role === 'seller' ? 'Verified' : undefined,
          rewardPoints: 20,
          createdAt: new Date().toISOString()
        };
        setUser(profile);
        StorageService.updateUser(profile);
        return { success: true, user: profile };
      }

      if (apiRes.error) {
        return { success: false, error: apiRes.error };
      }
    } catch {
      // API server offline: execute local storage registration
    }

    // 2. Fallback local storage registration
    const users = StorageService.getUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      password: data.password,
      role: data.role,
      businessName: data.businessName?.trim(),
      businessAddress: data.businessAddress?.trim(),
      sellerVerificationStatus: data.role === 'seller' ? 'Verified' : undefined,
      isActive: true,
      rewardPoints: 20,
      createdAt: new Date().toISOString()
    };

    StorageService.updateUser(newUser);
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    StorageService.clearCurrentUser();
    try {
      localStorage.removeItem('mealmate_jwt_token');
    } catch {}
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
        role: user ? user.role : 'guest',
        isAuthenticated: !!user,
        login,
        signup,
        logout,
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
