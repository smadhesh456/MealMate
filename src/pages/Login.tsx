import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Lock, Store, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import type { UserRole } from '../types';

export const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get('role') as UserRole) || 'customer';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, switchRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your email', 'warning');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email.trim(), password, selectedRole);
    setIsSubmitting(false);

    if (res.success) {
      showToast(`Welcome back! Signed in as ${selectedRole}`, 'success');
      if (selectedRole === 'seller') navigate('/seller/dashboard');
      else if (selectedRole === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } else {
      showToast(res.error || 'Failed to sign in', 'error');
    }
  };

  const handleQuickDemoLogin = (targetEmail: string, role: UserRole) => {
    setEmail(targetEmail);
    setSelectedRole(role);
    switchRole(role);
    showToast(`Quick signed in as demo ${role}!`, 'success');
    if (role === 'seller') navigate('/seller/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange flex items-center justify-center text-white text-2xl font-bold shadow-md">
              🍲
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight">
            Sign In to MealMate
          </h1>
          <p className="text-xs text-gray-500">
            Access your orders, meal subscriptions, or kitchen store
          </p>
        </div>

        {/* Demo Fast Login Pills (College Project Feature) */}
        <div className="bg-cream-100 rounded-3xl p-5 border border-amber-200/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-charcoal">
            <Sparkles className="w-4 h-4 text-brand-orange" />
            <span>1-Click Evaluator Demo Sign-In:</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('rahul.student@college.edu', 'customer')}
              className="p-2.5 bg-white hover:bg-cream-200 rounded-xl border border-amber-200 text-center transition-all shadow-sm"
            >
              <User className="w-4 h-4 text-brand-orange mx-auto mb-1" />
              <span className="text-[11px] font-bold block text-brand-charcoal">Customer</span>
              <span className="text-[9px] text-gray-400 block truncate">Rahul</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('annapoorna@mealmate.in', 'seller')}
              className="p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-200 text-center transition-all shadow-sm"
            >
              <Store className="w-4 h-4 text-brand-green mx-auto mb-1" />
              <span className="text-[11px] font-bold block text-brand-charcoal">Seller</span>
              <span className="text-[9px] text-gray-400 block truncate">Annapoorna</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@mealmate.in', 'admin')}
              className="p-2.5 bg-white hover:bg-purple-50 rounded-xl border border-purple-200 text-center transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold block text-brand-charcoal">Admin</span>
              <span className="text-[9px] text-gray-400 block truncate">Master</span>
            </button>
          </div>
        </div>

        {/* Standard Sign In Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-card space-y-5">
          
          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-2xl text-xs font-bold">
            {(['customer', 'seller', 'admin'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`py-2 rounded-xl capitalize transition-all ${
                  selectedRole === r
                    ? 'bg-white text-brand-charcoal shadow-sm'
                    : 'text-gray-500 hover:text-brand-charcoal'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu or seller email"
                  className="w-full pl-10 pr-3 py-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  required
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (demo: any text)"
                  className="w-full pl-10 pr-3 py-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 hover:scale-102"
            >
              <span>{isSubmitting ? 'Signing In...' : `Sign In as ${selectedRole}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-gray-500 border-t border-gray-100">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-brand-orange hover:underline">
              Create an Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
