import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Store, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export const SellerLogin: React.FC = () => {
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

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both seller email and password.');
      showToast('Please enter both seller email and password.', 'warning');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email.trim(), password);
    setIsSubmitting(false);

    if (res.success && res.user) {
      if (res.user.role !== 'seller' && res.user.role !== 'admin') {
        showToast('This account is registered as a customer. Redirecting to Customer Portal.', 'info');
        navigate('/');
        return;
      }
      showToast(`Welcome back, ${res.user.name}! Your Kitchen Portal is ready.`, 'success');
      navigate('/seller/dashboard');
    } else {
      const err = res.error || 'Failed to sign in. Please verify your seller credentials.';
      setErrorMessage(err);
      showToast(err, 'error');
    }
  };

  const handleQuickSellerSelect = (sellerEmail: string, sellerPass: string, kitchenTitle: string) => {
    setEmail(sellerEmail);
    setPassword(sellerPass);
    setErrorMessage('');
    showToast(`Loaded credentials for ${kitchenTitle}. Click "Sign In" to proceed.`, 'info');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-green text-white flex items-center justify-center mx-auto shadow-md">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight">
            Seller & Home Cook Portal
          </h1>
          <p className="text-xs text-gray-500">
            Sign in to manage dishes, incoming orders, and daily inventory
          </p>
        </div>

        {/* 1-Click Fast Fill Test Credentials */}
        <div className="bg-cream-100 rounded-3xl p-5 border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-green" />
              <span>Sample Verified Kitchen Partners:</span>
            </div>
            <span className="text-[10px] text-gray-400 font-normal">Click to fill</span>
          </div>

          <div className="space-y-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickSellerSelect('seller1@mealmate.com', 'sellerpassword123', 'Annapoorna Home Kitchen')}
              className="w-full p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-200 text-left transition-all flex items-center justify-between"
            >
              <div>
                <strong className="block text-brand-charcoal">Annapoorna Home Kitchen</strong>
                <span className="text-[11px] text-gray-400">Lakshmi Narayanan • seller1@mealmate.com</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Fill
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSellerSelect('seller2@mealmate.com', 'sellerpassword123', 'Campus Dhaba & Grills')}
              className="w-full p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-200 text-left transition-all flex items-center justify-between"
            >
              <div>
                <strong className="block text-brand-charcoal">Campus Dhaba & Grills</strong>
                <span className="text-[11px] text-gray-400">Ramesh Sundaram • seller2@mealmate.com</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Fill
              </span>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-card space-y-4">
          
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <div className="space-y-1">
                <span className="font-bold block">{errorMessage}</span>
                {errorMessage.includes('not found') && (
                  <Link to="/seller/register" className="text-brand-green underline font-bold block text-[11px]">
                    Click here to register your kitchen &rarr;
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Seller Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="seller1@mealmate.com"
                className="w-full p-2.5 bg-cream-50 border border-emerald-200 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green"
                required
              />
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
                  placeholder="Enter your kitchen password"
                  className="w-full pl-9 pr-3 py-2.5 bg-cream-50 border border-emerald-200 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verifying Kitchen Access...' : 'Sign In to Seller Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
            Want to start selling homemade campus food?{' '}
            <Link to="/seller/register" className="text-brand-green font-bold hover:underline">
              Register as Partner
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
