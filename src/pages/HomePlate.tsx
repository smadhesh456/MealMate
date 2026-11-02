import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { FoodCard } from '../components/common/FoodCard';
import { 
  UtensilsCrossed, 
  ChefHat, 
  ShieldCheck, 
  Heart, 
  Calendar, 
  Layers, 
  ArrowRight, 
  Sparkles,
  Info
} from 'lucide-react';
import { FEE_CONFIG } from '../utils/pricing';

export const HomePlate: React.FC = () => {
  const [mealTimeFilter, setMealTimeFilter] = useState<'All' | 'Breakfast' | 'Lunch' | 'Dinner'>('All');
  const [dietFilter, setDietFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');

  const allMeals = useMemo(() => StorageService.getMeals(), []);
  const homePlateMeals = useMemo(() => {
    return allMeals.filter(m => m.module === 'HomePlate');
  }, [allMeals]);

  const filtered = useMemo(() => {
    return homePlateMeals.filter(m => {
      if (mealTimeFilter !== 'All' && m.category !== mealTimeFilter) return false;
      if (dietFilter === 'Veg' && !m.isVeg) return false;
      if (dietFilter === 'Non-Veg' && m.isVeg) return false;
      return true;
    });
  }, [homePlateMeals, mealTimeFilter, dietFilter]);

  // Unique cooks represented
  const cooks = [
    {
      name: 'Annapoorna Devi',
      kitchen: 'Annapoorna Home Kitchen',
      rating: 4.8,
      specialty: 'Authentic Idli, Masala Dosa, Chapati & Kurma',
      distance: '0.8 km from Campus Gate 2',
      badge: 'Verified Home Cook'
    },
    {
      name: 'Lakshmi Narayanan',
      kitchen: 'Lakshmi Amma Kitchen',
      rating: 4.9,
      specialty: 'South Indian Veg Meals, Lemon Rice, Curd Rice',
      distance: '1.2 km from South Extension',
      badge: 'Master Home Cook'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Hero Banner for HomePlate */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white shadow-card relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>HomePlate Module — 100% Home Cooked</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Authentic Homemade Meals by Local Home Cooks
          </h1>

          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            Healthy, hygienic food cooked in clean residential kitchens with less oil and fresh country spices. Perfect for college students and staff missing mother's cooking.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/subscriptions"
              className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Explore Weekly & Monthly Meal Passes</span>
            </Link>
          </div>
        </div>

        {/* Decorative Badge */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 text-right">
          <div className="w-36 h-36 rounded-full bg-emerald-700/30 border-2 border-emerald-400/30 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
            <span className="text-3xl">👵</span>
            <span className="text-xs font-extrabold mt-1 text-emerald-200">Ghar Ka Khana</span>
            <span className="text-[10px] text-emerald-300">Pure Taste</span>
          </div>
        </div>
      </div>

      {/* Delivery & Seller Fee Transparency Policy Notice */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Transparent Delivery:</strong> Standard delivery fee of ₹{FEE_CONFIG.DELIVERY_FEE_BASE} per order (Free for orders ₹{FEE_CONFIG.DELIVERY_FREE_THRESHOLD}+). Home cooks receive 100% of dish price.
          </span>
        </div>
        <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[11px] flex-shrink-0">
          Cash On Delivery
        </span>
      </div>

      {/* Featured Verified Home Cooks */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-brand-charcoal flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-brand-green" />
          <span>Meet Our Campus Neighborhood Cooks</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cooks.map(cook => (
            <div key={cook.name} className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-soft flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-brand-charcoal">{cook.kitchen}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {cook.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Cooked by {cook.name} • {cook.distance}</p>
                <p className="text-xs text-emerald-700 font-medium">{cook.specialty}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-1 rounded-lg text-xs font-bold">
                  ★ {cook.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtering Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-soft flex flex-wrap items-center justify-between gap-4">
        {/* Meal Time Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-gray-500 mr-2">Meal Time:</span>
          {(['All', 'Breakfast', 'Lunch', 'Dinner'] as const).map(time => (
            <button
              key={time}
              onClick={() => setMealTimeFilter(time)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mealTimeFilter === time
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'bg-cream-50 text-gray-600 hover:bg-cream-100'
              }`}
            >
              {time}
            </button>
          ))}
        </div>

        {/* Diet Tabs */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-500 mr-2">Diet:</span>
          {(['All', 'Veg', 'Non-Veg'] as const).map(diet => (
            <button
              key={diet}
              onClick={() => setDietFilter(diet)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dietFilter === diet
                  ? 'bg-brand-charcoal text-white shadow-sm'
                  : 'bg-cream-50 text-gray-600 hover:bg-cream-100'
              }`}
            >
              {diet}
            </button>
          ))}
        </div>
      </div>

      {/* Meals Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-brand-charcoal">
            Daily Homemade Offerings ({filtered.length})
          </h2>
          <span className="text-xs text-gray-400">Order-ahead supported for all listings</span>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(meal => (
              <FoodCard key={meal.id} food={meal} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center border border-amber-100 shadow-soft">
            <p className="text-sm font-bold text-brand-charcoal">No homemade meals found for this selection.</p>
            <button
              onClick={() => { setMealTimeFilter('All'); setDietFilter('All'); }}
              className="mt-3 px-4 py-2 bg-brand-green text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Subscription Callout Banner */}
      <div className="bg-cream-200/60 rounded-3xl p-6 sm:p-8 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-extrabold text-brand-green uppercase tracking-wider">
            Save up to 25% with Meal Passes
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-brand-charcoal">
            Never Worry About Daily Campus Lunches Again
          </h3>
          <p className="text-xs text-gray-600 max-w-xl">
            Choose our 7-Day Homestyle Lunch Pass or 30-Day Complete Homemade Feast. Pre-scheduled delivery right to your hostel or department lawn.
          </p>
        </div>
        <Link
          to="/subscriptions"
          className="px-6 py-3 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 flex-shrink-0"
        >
          <span>View Subscription Plans</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
