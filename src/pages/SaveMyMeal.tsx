import React, { useState, useMemo } from 'react';
import { StorageService } from '../services/storage';
import { FoodCard } from '../components/common/FoodCard';
import { 
  Clock, 
  Leaf, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  HeartHandshake, 
  TrendingDown, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SaveMyMeal: React.FC = () => {
  const [filterType, setFilterType] = useState<'All' | 'Available' | 'SoldOutOrExpired'>('All');
  const allMeals = useMemo(() => StorageService.getMeals(), []);

  const saveMyMealItems = useMemo(() => {
    return allMeals.filter(m => m.module === 'SaveMyMeal');
  }, [allMeals]);

  // Check cutoff & stock
  const processedItems = useMemo(() => {
    return saveMyMealItems.map(item => {
      const isPastCutoff = item.cutoffTime ? Date.now() > new Date(item.cutoffTime).getTime() : false;
      const isSoldOut = !item.isAvailable || item.stockQuantity <= 0;
      const isOrderable = !isPastCutoff && !isSoldOut;
      return {
        ...item,
        isPastCutoff,
        isSoldOut,
        isOrderable,
      };
    }).filter(item => {
      if (filterType === 'Available') return item.isOrderable;
      if (filterType === 'SoldOutOrExpired') return !item.isOrderable;
      return true;
    });
  }, [saveMyMealItems, filterType]);

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
            <span>SaveMyMeal Module — Surplus Food Rescue</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Delicious Surplus Food at up to 45% Off!
          </h1>
          <p className="text-rose-100 text-xs sm:text-sm leading-relaxed">
            Partner restaurants list eligible high-quality surplus meals before daily cutoff times. Save money, enjoy premium restaurant cooking, and help eliminate campus food waste.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl">
              <TrendingDown className="w-4 h-4 text-rose-300" />
              <span>Over ₹{totalSavings} Total Potential Savings Today</span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Eco-Certified Food Rescue</span>
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
            Listings automatically lock when the cutoff time is reached or stock drops to zero. Expired items cannot be added to cart or checked out.
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-soft flex items-start gap-3 text-xs text-gray-600">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <strong className="text-brand-charcoal block mb-0.5">Verified Environmental Metrics (Demo):</strong>
            Each rescued portion prevents ~0.4 kg of kitchen food waste. All impact calculations are based on actual recorded order logs and verified demo data.
          </div>
        </div>
      </div>

      {/* Filtering Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-soft flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">Filter By Status:</span>
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
              {f === 'All' ? 'All Surplus Deals (6)' : f === 'Available' ? 'Ready to Order' : 'Sold Out / Closed'}
            </button>
          ))}
        </div>

        <Link
          to="/impact"
          className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
        >
          <span>View Full Impact Stats</span>
        </Link>
      </div>

      {/* Food Listings Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-brand-charcoal">
            Active Surplus Deals ({processedItems.length})
          </h2>
          <span className="text-xs text-gray-400">Live countdowns active</span>
        </div>

        {processedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedItems.map(meal => (
              <div key={meal.id} className="relative">
                <FoodCard food={meal} />
                {meal.isOrderable && (
                  <div className="mt-2 p-2 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between text-xs text-rose-800">
                    <span className="font-semibold">Rescue discount:</span>
                    <span className="font-extrabold text-sm">
                      ₹{meal.originalPrice! - meal.price} SAVED ({meal.discountPercentage}% OFF)
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
