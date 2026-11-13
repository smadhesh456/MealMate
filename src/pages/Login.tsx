import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Lock, Store, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import type { UserRole } from '../types';

export const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      showToast('Please enter your email address.', 'warning');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      showToast('Please enter your password.', 'warning');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email.trim(), password);
    setIsSubmitting(false);

    if (res.success && res.user) {
      const actualRole = res.user.role;
      showToast(`Welcome back, ${res.user.name}!`, 'success');

      // Preserve Role-Based Navigation & Return to previous page where possible (Requirement 3 & 5)
      if (actualRole === 'seller') {
        navigate('/seller/dashboard');
      } else if (actualRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        // Customer role: return to intended page if valid, else home
        if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('/seller') && !redirectParam.startsWith('/admin')) {
          navigate(redirectParam);
        } else {
          navigate('/');
        }
      }
    } else {
      const err = res.error || 'Failed to sign in. Please verify your credentials.';
      setErrorMessage(err);
      showToast(err, 'error');
    }
  };

  // Demo Credentials Pre-filler (fills form without bypassing authentication)
  const handleFillDemo = (targetEmail: string, targetPass: string, roleName: string) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setErrorMessage('');
    showToast(`Loaded ${roleName} credentials. Click "Sign In" to proceed.`, 'info');
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
            {redirectParam 
              ? 'Please sign in or create an account to order food and continue'
              : 'Access your student meals, kitchen dashboard, or campus admin console'}
          </p>
        </div>

        {/* 1-Click Fast Fill Test Credentials Pills */}
        <div className="bg-cream-100 rounded-3xl p-5 border border-amber-200 space-y-3 shadow-soft">
          <div className="flex items-center justify-between text-xs font-bold text-brand-charcoal">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-orange" />
              <span>Quick Test Credentials:</span>
            </div>
            <span className="text-[10px] text-gray-400 font-normal">Click to fill form</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('madesh@gmail.com', 'madeshpassword123', 'Customer')}
              className="p-3 bg-white hover:bg-cream-200 rounded-2xl border border-amber-200 text-center transition-all shadow-sm hover:scale-102"
            >
              <User className="w-5 h-5 text-brand-orange mx-auto mb-1" />
              <span className="text-xs font-bold block text-brand-charcoal">Customer</span>
              <span className="text-[10px] text-gray-400 block truncate">Madesh</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('seller1@mealmate.com', 'sellerpassword123', 'Seller')}
              className="p-3 bg-white hover:bg-emerald-50 rounded-2xl border border-emerald-200 text-center transition-all shadow-sm hover:scale-102"
            >
              <Store className="w-5 h-5 text-brand-green mx-auto mb-1" />
              <span className="text-xs font-bold block text-brand-charcoal">Seller</span>
              <span className="text-[10px] text-gray-400 block truncate">Lakshmi</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('admin@mealmate.com', 'adminpassword123', 'Admin')}
              className="p-3 bg-white hover:bg-purple-50 rounded-2xl border border-purple-200 text-center transition-all shadow-sm hover:scale-102"
            >
              <ShieldCheck className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <span className="text-xs font-bold block text-brand-charcoal">Admin</span>
              <span className="text-[10px] text-gray-400 block truncate">Priya</span>
            </button>
          </div>
        </div>

        {/* Standard Sign In Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-card space-y-5">
          
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <div className="space-y-1">
                <span className="font-bold block">{errorMessage}</span>
                {errorMessage.includes('not found') && (
                  <Link 
                    to={`/signup${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
                    className="text-brand-orange underline font-bold block text-[11px]"
                  >
                    Click here to create a new account now &rarr;
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. madesh@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  required
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter your account password"
                  className="w-full pl-10 pr-3 py-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 hover:scale-102 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-gray-500 border-t border-gray-100">
            Don't have an account?{' '}
            <Link 
              to={`/signup${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`} 
              className="font-bold text-brand-orange hover:underline"
            >
              Create an Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
