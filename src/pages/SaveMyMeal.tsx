import React, { useState, useMemo, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { FoodCard } from '../components/common/FoodCard';
import { 
  Clock, 
  Leaf, 
  AlertTriangle, 
  Sparkles, 
  TrendingDown, 
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SaveMyMeal: React.FC = () => {
  const [filterType, setFilterType] = useState<'All' | 'Available' | 'SoldOutOrExpired'>('All');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const allMeals = useMemo(() => StorageService.getMeals(), []);

  // Update timer every second for real-time live countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const saveMyMealItems = useMemo(() => {
    return allMeals.filter(m => m.module === 'SaveMyMeal');
  }, [allMeals]);

  // Strict dynamic cutoff & inventory calculation (Requirement 5)
  const processedItems = useMemo(() => {
    return saveMyMealItems.map(item => {
      // Dynamic fallback cutoff (tonight 10:30 PM or 4 hours from now)
      const cutoffTimestamp = item.cutoffTime 
        ? new Date(item.cutoffTime).getTime() 
        : Date.now() + 4 * 3600 * 1000;

      const isPastCutoff = currentTime >= cutoffTimestamp;
      const isSoldOut = !item.isAvailable || item.stockQuantity <= 0;
      const isOrderable = !isPastCutoff && !isSoldOut;

      const diff = Math.max(0, cutoffTimestamp - currentTime);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      const countdownStr = isPastCutoff ? 'Cutoff Passed' : `${hours}h ${mins}m ${secs}s left`;

      return {
        ...item,
        cutoffTime: new Date(cutoffTimestamp).toISOString(),
        isPastCutoff,
        isSoldOut,
        isOrderable,
        countdownStr,
        status: isSoldOut ? 'SOLD OUT' : isPastCutoff ? 'EXPIRED' : 'ACTIVE'
      };
    }).filter(item => {
      if (filterType === 'Available') return item.isOrderable;
      if (filterType === 'SoldOutOrExpired') return !item.isOrderable;
      return true;
    });
  }, [saveMyMealItems, filterType, currentTime]);

  // Total potential savings calculation
  const totalSavings = useMemo(() => {
    return saveMyMealItems.reduce((acc, curr) => {
      if (curr.originalPrice && curr.originalPrice > curr.price) {
        return acc + (curr.originalPrice - curr.price) * curr.stockQuantity;
      }
      return acc;
    }, 0);
  }, [saveMyMealItems]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-red-900 rounded-3xl p-8 sm:p-12 text-white shadow-card relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>SaveMyMeal Module — Real-Time Campus Food Rescue</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Delicious Surplus Food at up to 45% Off!
          </h1>
          <p className="text-rose-100 text-xs sm:text-sm leading-relaxed">
            Partner campus dining halls, bakeries, and kitchens list fresh surplus food before cutoff. Save money, enjoy premium restaurant cooking, and prevent food waste.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl">
              <TrendingDown className="w-4 h-4 text-rose-300" />
              <span>Over ₹{totalSavings} Total Potential Savings Today</span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Eco-Certified Campus Food Rescue</span>
            </span>
          </div>
        </div>
      </div>

      {/* Strict Cutoff & Waste Disclaimer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-soft flex items-start gap-3 text-xs text-gray-600">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <strong className="text-brand-charcoal block mb-0.5">Strict Order Cutoff Policy:</strong>
            Active items are only orderable BEFORE their live cutoff time and while portions remain. Once cutoff is reached or stock drops to zero, ordering is locked.
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-soft flex items-start gap-3 text-xs text-gray-600">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <strong className="text-brand-charcoal block mb-0.5">Environmental Impact:</strong>
            Every rescued portion prevents ~0.40 kg of greenhouse waste and reduces kitchen carbon footprints.
          </div>
        </div>
      </div>

      {/* Filtering Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">Filter Status:</span>
          {(['All', 'Available', 'SoldOutOrExpired'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === f
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'All' ? 'All Surplus Deals' : f === 'Available' ? 'Ready to Order (Active)' : 'Closed / Sold Out'}
            </button>
          ))}
        </div>

        <Link
          to="/profile"
          className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
        >
          <span>View My Food Savings & Impact</span>
        </Link>
      </div>

      {/* Food Listings Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-brand-charcoal">
            Active Surplus Deals ({processedItems.length})
          </h2>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live countdown active
          </span>
        </div>

        {processedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedItems.map(meal => (
              <div key={meal.id} className="relative flex flex-col">
                <FoodCard food={meal} />
                {meal.isOrderable && (
                  <div className="mt-2 p-2.5 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between text-xs text-rose-800 font-bold">
                    <span>⚡ Rescue discount:</span>
                    <span className="font-extrabold text-sm text-red-600">
                      Save ₹{meal.originalPrice! - meal.price} ({meal.discountPercentage}% OFF)
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-amber-100 shadow-soft">
            <p className="text-sm font-bold text-brand-charcoal">No surplus listings match this status filter.</p>
          </div>
        )}
      </div>

    </div>
  );
};
