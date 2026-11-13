import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Phone, Lock, Store, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { UserRole } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Signup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';

  const [role, setRole] = useState<'customer' | 'seller'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Validate required fields
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      showToast('Please enter your full name.', 'warning');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      showToast('Please enter your email address.', 'warning');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      setErrorMessage('Please enter a valid email address format (e.g. name@college.edu).');
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please enter your contact phone number.');
      showToast('Please enter your phone number.', 'warning');
      return;
    }

    if (phone.trim().replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      showToast('Please enter a valid 10-digit phone number.', 'warning');
      return;
    }

    if (!password) {
      setErrorMessage('Please choose a password.');
      showToast('Please choose a password.', 'warning');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      showToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password confirmation.');
      showToast('Passwords do not match.', 'warning');
      return;
    }

    if (role === 'seller') {
      if (!businessName.trim() || !businessAddress.trim()) {
        setErrorMessage('Please enter your kitchen business name and address.');
        showToast('Please enter your kitchen business name and address.', 'warning');
        return;
      }
    }

    setIsSubmitting(true);
    const res = await signup({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      role,
      businessName: role === 'seller' ? businessName.trim() : undefined,
      businessAddress: role === 'seller' ? businessAddress.trim() : undefined,
    });
    setIsSubmitting(false);

    if (res.success && res.user) {
      showToast('Account created successfully! Welcome to MealMate.', 'success');

      // Preserve Role-Based Navigation
      if (role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('/seller') && !redirectParam.startsWith('/admin')) {
          navigate(redirectParam);
        } else {
          navigate('/');
        }
      }
    } else {
      const err = res.error || 'Failed to create account. Please try again.';
      setErrorMessage(err);
      showToast(err, 'error');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange flex items-center justify-center text-white text-2xl font-bold shadow-md">
              🍲
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight">
            Create Your MealMate Account
          </h1>
          <p className="text-xs text-gray-500">
            Join our campus food tech community as a customer or home cook kitchen partner
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-card space-y-5">
          
          {/* Account Type Selector */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Select Account Type:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                  role === 'customer'
                    ? 'border-brand-orange bg-orange-50/50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User className="w-5 h-5 text-brand-orange mx-auto mb-1" />
                <span className="text-xs font-extrabold text-brand-charcoal block">Student / Customer</span>
                <span className="text-[10px] text-gray-500">Order meals & passes</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                  role === 'seller'
                    ? 'border-brand-green bg-emerald-50/50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Store className="w-5 h-5 text-brand-green mx-auto mb-1" />
                <span className="text-xs font-extrabold text-brand-charcoal block">Home Cook / Partner</span>
                <span className="text-[10px] text-gray-500">Sell homemade or surplus</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <div className="space-y-1">
                <span className="font-bold block">{errorMessage}</span>
                {errorMessage.includes('already exists') && (
                  <Link 
                    to={`/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
                    className="text-brand-orange underline font-bold block text-[11px]"
                  >
                    Click here to sign in with your existing account &rarr;
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Your Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. Priya Sundaram"
                  className="w-full pl-10 pr-3 py-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  required
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    placeholder="name@college.edu"
                    className="w-full pl-10 pr-3 py-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    required
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="+91 98404 00000"
                    className="w-full pl-10 pr-3 py-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    required
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Password (min 6 chars) *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Choose a password"
                    className="w-full pl-10 pr-3 py-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    required
                    minLength={6}
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-3 py-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    required
                    minLength={6}
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Additional Fields if Seller */}
            {role === 'seller' && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in">
                <span className="text-xs font-bold text-emerald-900 block">
                  Kitchen / Business Information
                </span>
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                    Home Kitchen or Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Priya Healthy Bakes & Meals"
                    className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs"
                    required={role === 'seller'}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                    Kitchen Address or Campus Vicinity *
                  </label>
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="e.g. 5B, Green Valley Apts, Near Gate 2"
                    className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs"
                    required={role === 'seller'}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 hover:scale-102 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating Account...' : `Register as ${role === 'seller' ? 'Seller' : 'Customer'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-gray-500 border-t border-gray-100">
            Already registered?{' '}
            <Link 
              to={`/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`} 
              className="font-bold text-brand-orange hover:underline"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
