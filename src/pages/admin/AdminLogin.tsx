import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
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
      setErrorMessage('Please enter both administrator email and password.');
      showToast('Please enter both administrator email and password.', 'warning');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email.trim(), password);
    setIsSubmitting(false);

    if (res.success && res.user) {
      if (res.user.role !== 'admin') {
        setErrorMessage('Access denied. This account does not possess administrator privileges.');
        showToast('Access denied. Administrator privileges required.', 'error');
        return;
      }
      showToast('Welcome to the Administrator Portal!', 'success');
      navigate('/admin/dashboard');
    } else {
      const err = res.error || 'Failed to sign in. Please verify admin credentials.';
      setErrorMessage(err);
      showToast(err, 'error');
    }
  };

  const handleQuickAdminSelect = () => {
    setEmail('admin@mealmate.com');
    setPassword('adminpassword123');
    setErrorMessage('');
    showToast('Loaded admin credentials. Click "Enter Admin Console" to proceed.', 'info');
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

        {/* 1-Click Fast Fill Test Admin Credentials */}
        <div className="bg-purple-50 rounded-3xl p-5 border border-purple-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-purple-900">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <span>Campus Management Access:</span>
            </div>
            <span className="text-[10px] text-gray-400 font-normal">Click to fill</span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdminSelect}
            className="w-full p-3 bg-white hover:bg-purple-100/50 rounded-xl border border-purple-200 text-left transition-all flex items-center justify-between"
          >
            <div>
              <strong className="block text-brand-charcoal text-xs">Priya Sharma (Campus Lead)</strong>
              <span className="text-[11px] text-gray-500">admin@mealmate.com</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900">
              Fill
            </span>
          </button>
        </div>

        {/* Regular Login Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-card space-y-4">
          
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Admin Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="admin@mealmate.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-cream-50 border border-purple-200 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                  placeholder="Enter administrator password"
                  className="w-full pl-9 pr-3 py-2.5 bg-cream-50 border border-purple-200 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating Admin...' : 'Enter Admin Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
            Protected endpoint strictly restricted to campus food administrators.
          </div>
        </div>

      </div>
    </div>
  );
};
