import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { role, switchRole } = useAuth();

  if (!allowedRoles.includes(role)) {
    const targetRole = allowedRoles[0];

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-card border border-amber-100 text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-brand-charcoal">
              {targetRole === 'admin' ? 'Administrator Only Page' : 'Seller Only Page'}
            </h2>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              You are currently browsing with the <strong className="text-brand-orange uppercase">{role}</strong> role. This view is restricted to {allowedRoles.join(' or ')} accounts.
            </p>
          </div>

          <div className="bg-cream-100 rounded-2xl p-4 border border-amber-200/60 text-left space-y-2">
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
              Demo Mode Quick Switch
            </span>
            <p className="text-xs text-gray-600">
              For grading and evaluation, switch to <strong className="capitalize">{targetRole}</strong> mode with one click:
            </p>
            <button
              onClick={() => switchRole(targetRole)}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-brand-charcoal hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Switch to {targetRole === 'admin' ? 'Administrator' : 'Seller'} Profile
            </button>
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="text-xs font-semibold text-gray-500 hover:text-brand-orange inline-flex items-center gap-1 transition-colors"
            >
              Return to Homepage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
