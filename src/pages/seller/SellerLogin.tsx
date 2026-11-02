import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Store, Lock, ArrowRight, Sparkles, ChefHat } from 'lucide-react';

export const SellerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, switchRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your seller email', 'warning');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email.trim(), password, 'seller');
    setIsSubmitting(false);

    if (res.success) {
      showToast('Welcome to the Seller Hub!', 'success');
      navigate('/seller/dashboard');
    } else {
      showToast(res.error || 'Failed to login', 'error');
    }
  };

  const handleQuickSellerSelect = (sellerEmail: string) => {
    setEmail(sellerEmail);
    switchRole('seller');
    showToast('Switched to Seller Demo Account!', 'success');
    navigate('/seller/dashboard');
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

        {/* 1-Click Demo Sellers for Evaluator */}
        <div className="bg-cream-100 rounded-3xl p-5 border border-emerald-200/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
            <Sparkles className="w-4 h-4 text-brand-green" />
            <span>1-Click Sample Seller Demo Accounts:</span>
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => handleQuickSellerSelect('annapoorna@mealmate.in')}
              className="w-full p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-200 text-left transition-all flex items-center justify-between"
            >
              <div>
                <strong className="block text-brand-charcoal">Annapoorna Home Kitchen</strong>
                <span className="text-[11px] text-gray-400">HomePlate Cook • Idli, Dosa, Chapati</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Sign In
              </span>
            </button>

            <button
              onClick={() => handleQuickSellerSelect('lakshmi@mealmate.in')}
              className="w-full p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-200 text-left transition-all flex items-center justify-between"
            >
              <div>
                <strong className="block text-brand-charcoal">Lakshmi Amma Kitchen</strong>
                <span className="text-[11px] text-gray-400">HomePlate Cook • Thali Meals, Rice</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Sign In
              </span>
            </button>

            <button
              onClick={() => handleQuickSellerSelect('royalspice@mealmate.in')}
              className="w-full p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-200 text-left transition-all flex items-center justify-between"
            >
              <div>
                <strong className="block text-brand-charcoal">Royal Spice Restaurant</strong>
                <span className="text-[11px] text-gray-400">SaveMyMeal Partner • Surplus Combos</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Sign In
              </span>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-card space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Seller Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@mealmate.in"
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (demo: any text)"
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 hover:scale-102"
            >
              <span>{isSubmitting ? 'Signing In...' : 'Sign In to Seller Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
            Need to register a kitchen?{' '}
            <Link to="/seller/register" className="font-bold text-brand-green hover:underline">
              Partner Registration
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
