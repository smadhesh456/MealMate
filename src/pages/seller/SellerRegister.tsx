import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Store, ChefHat, CheckCircle2, ArrowRight, ShieldCheck, DollarSign, Lock } from 'lucide-react';

export const SellerRegister: React.FC = () => {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [kitchenName, setKitchenName] = useState('');
  const [kitchenAddress, setKitchenAddress] = useState('');
  const [cuisineType, setCuisineType] = useState('HomePlate Homemade Food');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !kitchenName.trim() || !kitchenAddress.trim() || !password) {
      showToast('Please fill all mandatory seller registration details', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    setIsSubmitting(true);
    const res = await signup({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      role: 'seller',
      businessName: kitchenName.trim(),
      businessAddress: kitchenAddress.trim(),
    });
    setIsSubmitting(false);

    if (res.success) {
      showToast(`Welcome ${kitchenName}! Your seller portal is ready.`, 'success');
      navigate('/seller/dashboard');
    } else {
      showToast(res.error || 'Registration failed', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-800 to-brand-green rounded-3xl p-8 sm:p-12 text-white shadow-card grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
            <Store className="w-3.5 h-3.5" />
            <span>Join Campus Home Cooks & Restaurant Partners</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Share Your Homemade Passion. Earn from Your Kitchen.
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            Sell daily homemade lunches, campus student budget meals, or rescue evening restaurant surplus before closing time. MealMate handles campus deliveries!
          </p>
        </div>

        <div className="md:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 block">
            Why Partner With Us?
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Zero onboarding or registration fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Reach 5,000+ hungry campus students</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Guaranteed Cash on Delivery collections</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-emerald-100 shadow-card space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-brand-charcoal">
            Register Your Home Kitchen / Outlet
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Complete the details below to start listing delicious dishes on MealMate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Your Full Name (Chef / Owner) *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Annapoorna Devi"
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98401 00000"
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@mealmate.in"
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Account Password (min 6 chars) *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-brand-green uppercase tracking-wider block mb-3">
              Kitchen Details
            </span>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Kitchen / Business Brand Name *
                </label>
                <input
                  type="text"
                  value={kitchenName}
                  onChange={(e) => setKitchenName(e.target.value)}
                  placeholder="e.g. Annapoorna Home Kitchen"
                  className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Kitchen Address or Campus Vicinity *
                </label>
                <input
                  type="text"
                  value={kitchenAddress}
                  onChange={(e) => setKitchenAddress(e.target.value)}
                  placeholder="e.g. Near Campus Gate 2, Hostel Cross Road"
                  className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Primary Speciality
                </label>
                <select
                  value={cuisineType}
                  onChange={(e) => setCuisineType(e.target.value)}
                  className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                >
                  <option value="HomePlate Homemade Food">HomePlate – South Indian Traditional Meals</option>
                  <option value="BudgetBite Student Meals">BudgetBite – Low-Cost Meals Under ₹100</option>
                  <option value="SaveMyMeal Surplus Rescue">SaveMyMeal – Evening Surplus Deals & Snacks</option>
                  <option value="All-Round Multi-Cuisine">Multi-Category Campus Kitchen</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4"
          >
            <span>{isSubmitting ? 'Registering Seller...' : 'Submit Seller Application'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Already registered as a food partner?{' '}
          <Link to="/seller/login" className="text-brand-green font-bold hover:underline">
            Sign In to Seller Hub
          </Link>
        </div>
      </div>

    </div>
  );
};
