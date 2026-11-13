import React from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { ShieldAlert, ArrowRight, LogOut, Home } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. If visitor is not authenticated, redirect to Sign In / Register
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} 
        replace 
      />
    );
  }

  // 2. If user is authenticated, check role authorization
  if (!allowedRoles.includes(user.role)) {
    const userRole = user.role;
    const homeUrl = userRole === 'admin' ? '/admin/dashboard' : userRole === 'seller' ? '/seller/dashboard' : '/';

    const handleSignOutAndSwitch = () => {
      logout();
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
    };

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-card border border-amber-100 text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-brand-charcoal">
              Access Restricted
            </h2>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              You are signed in as a <strong className="text-brand-orange uppercase">{userRole}</strong> ({user.email}). 
              This section is reserved exclusively for <strong className="capitalize">{allowedRoles.join(' or ')}</strong> accounts.
            </p>
          </div>

          <div className="bg-cream-100 rounded-2xl p-4 border border-amber-200/60 text-left space-y-3">
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
              Authorization Required
            </span>
            <p className="text-xs text-gray-600 leading-relaxed">
              To view this section, please sign in with an authorized <strong className="capitalize">{allowedRoles.join(' or ')}</strong> account.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <Link
                to={homeUrl}
                className="py-2.5 px-3 rounded-xl bg-brand-orange text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm hover:bg-brand-orange-hover"
              >
                <Home className="w-3.5 h-3.5" />
                <span>My Portal</span>
              </Link>
              <button
                onClick={handleSignOutAndSwitch}
                className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-brand-charcoal text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-gray-200"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Switch Account</span>
              </button>
            </div>
          </div>

          <div className="pt-1">
            <Link
              to="/"
              className="text-xs font-semibold text-gray-400 hover:text-brand-orange inline-flex items-center gap-1 transition-colors"
            >
              Back to Campus Home <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
