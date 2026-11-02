import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, switchRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter admin email', 'warning');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email.trim(), password, 'admin');
    setIsSubmitting(false);

    if (res.success) {
      showToast('Welcome to the Administrator Portal!', 'success');
      navigate('/admin/dashboard');
    } else {
      showToast(res.error || 'Failed to sign in', 'error');
    }
  };

  const handleQuickAdminSelect = () => {
    setEmail('admin@mealmate.in');
    switchRole('admin');
    showToast('Switched to Master Administrator Account!', 'success');
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-700 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-xs text-gray-500">
            Platform governance, seller verifications, order oversight & complaint moderation
          </p>
        </div>

        {/* 1-Click Demo Admin Button */}
        <div className="bg-purple-50 rounded-3xl p-5 border border-purple-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-purple-900">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Project Evaluator Access</span>
            </span>
            <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full font-bold">
              Instant
            </span>
          </div>
          <button
            onClick={handleQuickAdminSelect}
            className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-102"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sign In as Master Administrator (1-Click)</span>
          </button>
        </div>

        {/* Credentials Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-card space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mealmate.in"
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
              className="w-full py-3.5 rounded-xl bg-brand-charcoal hover:bg-black text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Administrator'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
            <Link to="/" className="text-gray-400 hover:text-brand-charcoal">
              ← Return to Main Store
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
