import React, { useState, useMemo } from 'react';
import { StorageService } from '../services/storage';
import { FoodCard } from '../components/common/FoodCard';
import type { FoodItem } from '../types';
import { 
  Sparkles, 
  Coins, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpDown, 
  Info, 
  ShoppingBag,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { FEE_CONFIG, calculateBill } from '../utils/pricing';
import { useCart } from '../context/CartContext';

export const BudgetBite: React.FC = () => {
  const [selectedBudget, setSelectedBudget] = useState<number>(100);
  const [customBudgetValue, setCustomBudgetValue] = useState<string>('100');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [includeFeesInBudget, setIncludeFeesInBudget] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'low-to-high' | 'high-to-low'>('low-to-high');
  const [dietFilter, setDietFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const { addToCart } = useCart();
  const allMeals = useMemo(() => StorageService.getMeals(), []);

  // Quick preset budgets
  const budgetPresets = [50, 80, 100, 150];

  const handleSelectPreset = (b: number) => {
    setSelectedBudget(b);
    setCustomBudgetValue(b.toString());
    setIsCustom(false);
  };

  const handleCustomBudgetChange = (val: string) => {
    setCustomBudgetValue(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setSelectedBudget(num);
      setIsCustom(true);
    }
  };

  // Helper to calculate total cost for 1 portion with configured platform & delivery fees
  const getSimulatedTotal = (item: FoodItem) => {
    const singleCartItem = [{ foodItem: item, quantity: 1 }];
    const bill = calculateBill(singleCartItem);
    return bill.finalTotal;
  };

  // Filter and sort items
  const processedMeals = useMemo(() => {
    return allMeals.filter(meal => {
      // Diet filter
      if (dietFilter === 'Veg' && !meal.isVeg) return false;
      if (dietFilter === 'Non-Veg' && meal.isVeg) return false;

      // Category filter
      if (categoryFilter !== 'All' && meal.category !== categoryFilter) return false;

      // Budget check logic:
      if (includeFeesInBudget) {
        // Must fit budget AFTER accounting for delivery fee + platform fee
        const totalWithFees = getSimulatedTotal(meal);
        return totalWithFees <= selectedBudget;
      } else {
        // Fits item menu price
        return meal.price <= selectedBudget;
      }
    }).sort((a, b) => {
      const priceA = includeFeesInBudget ? getSimulatedTotal(a) : a.price;
      const priceB = includeFeesInBudget ? getSimulatedTotal(b) : b.price;
      return sortBy === 'low-to-high' ? priceA - priceB : priceB - priceA;
    });
  }, [allMeals, selectedBudget, includeFeesInBudget, sortBy, dietFilter, categoryFilter]);

  // Meals where item price is under budget, but total with fees exceeds budget
  const deceptiveItems = useMemo(() => {
    if (!includeFeesInBudget) return [];
    return allMeals.filter(meal => {
      return meal.price <= selectedBudget && getSimulatedTotal(meal) > selectedBudget;
    });
  }, [allMeals, selectedBudget, includeFeesInBudget]);

  // Affordable combination suggestions (e.g. combo of 2 items that total <= selectedBudget)
  const affordableCombos = useMemo(() => {
    const combinations: { item1: FoodItem; item2: FoodItem; total: number; savings: number }[] = [];
    if (selectedBudget < 100) return combinations;

    const available = allMeals.filter(m => m.isAvailable && m.stockQuantity > 0);
    for (let i = 0; i < available.length; i++) {
      for (let j = i + 1; j < available.length; j++) {
        const item1 = available[i];
        const item2 = available[j];
        const combinedBill = calculateBill([
          { foodItem: item1, quantity: 1 },
          { foodItem: item2, quantity: 1 }
        ]);

        if (combinedBill.finalTotal <= selectedBudget) {
          combinations.push({
            item1,
            item2,
            total: combinedBill.finalTotal,
            savings: combinedBill.savingsTotal,
          });
        }
      }
    }
    return combinations.slice(0, 3); // show top 3 suggestions
  }, [allMeals, selectedBudget]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-brand-orange rounded-3xl p-8 sm:p-12 text-white shadow-card">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
            <Coins className="w-3.5 h-3.5" />
            <span>BudgetBite — Transparent Campus Dining</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Discover Great Food That Truly Fits Your Budget
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
            Never be misled by checkout fees. We factor in food prices, standard delivery (₹{FEE_CONFIG.DELIVERY_FEE_BASE}), and platform fee (₹{FEE_CONFIG.PLATFORM_FEE}) so your wallet is never surprised!
          </p>
        </div>
      </div>

      {/* Interactive Budget Selector Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-soft space-y-6">
        
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Step 1: Choose Your Spending Budget
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {budgetPresets.map(preset => (
              <button
                key={preset}
                onClick={() => handleSelectPreset(preset)}
                className={`py-3.5 px-4 rounded-2xl text-center font-extrabold text-sm sm:text-base transition-all border-2 ${
                  !isCustom && selectedBudget === preset
                    ? 'bg-brand-orange border-brand-orange text-white shadow-md scale-102'
                    : 'bg-cream-50 border-amber-200 text-brand-charcoal hover:bg-cream-100'
                }`}
              >
                ₹{preset}
              </button>
            ))}

            {/* Custom Budget Input */}
            <div className={`rounded-2xl border-2 p-1.5 flex items-center transition-all ${
              isCustom ? 'border-brand-orange bg-cream-50 ring-2 ring-brand-orange/30' : 'border-amber-200 bg-cream-50'
            }`}>
              <span className="text-xs font-bold text-gray-400 pl-2">₹</span>
              <input
                type="number"
                min="30"
                max="500"
                value={customBudgetValue}
                onChange={(e) => handleCustomBudgetChange(e.target.value)}
                placeholder="Custom"
                className="w-full bg-transparent px-2 text-xs sm:text-sm font-extrabold text-brand-charcoal focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Honest Fee Calculation Toggle */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-50/60 p-4 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <label className="text-xs font-bold text-brand-charcoal block cursor-pointer">
                Strict Final Total Budgeting (Recommended)
              </label>
              <p className="text-[11px] text-gray-500">
                Calculates item price + ₹{FEE_CONFIG.DELIVERY_FEE_BASE} delivery + ₹{FEE_CONFIG.PLATFORM_FEE} platform fee to guarantee the order never exceeds ₹{selectedBudget}.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none flex-shrink-0">
            <input
              type="checkbox"
              checked={includeFeesInBudget}
              onChange={(e) => setIncludeFeesInBudget(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
            <span className="ml-2 text-xs font-semibold text-gray-700">
              {includeFeesInBudget ? 'Include Fees' : 'Item Price Only'}
            </span>
          </label>
        </div>

        {/* Step 3: Dietary & Category Toolbar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400">Diet:</span>
            {(['All', 'Veg', 'Non-Veg'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDietFilter(d)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  dietFilter === d
                    ? 'bg-brand-charcoal text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-bold text-gray-400">Sort:</span>
            <button
              onClick={() => setSortBy(sortBy === 'low-to-high' ? 'high-to-low' : 'low-to-high')}
              className="px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-brand-charcoal transition-all"
            >
              {sortBy === 'low-to-high' ? 'Price: Low to High' : 'Price: High to Low'}
            </button>
          </div>
        </div>

      </div>

      {/* Suggested Affordable Meal Combinations */}
      {affordableCombos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-orange" />
            <h2 className="text-lg font-bold text-brand-charcoal">
              Affordable Combo Pairs Under ₹{selectedBudget}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {affordableCombos.map((combo, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-4 border border-amber-200 shadow-soft flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-brand-charcoal">
                      {combo.item1.name} + {combo.item2.name}
                    </span>
                    <span className="text-xs font-extrabold text-brand-orange bg-amber-50 px-2 py-0.5 rounded">
                      ₹{combo.total}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Includes ₹{combo.item1.price} + ₹{combo.item2.price} + delivery & fees. Fully fits ₹{selectedBudget}!
                  </p>
                </div>

                <button
                  onClick={() => {
                    addToCart(combo.item1, 1);
                    addToCart(combo.item2, 1);
                  }}
                  className="w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Both to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meals Within Budget Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-charcoal">
              Meals Fitting Budget of ₹{selectedBudget} ({processedMeals.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {includeFeesInBudget 
                ? 'Showing meals where item + delivery + fees <= budget' 
                : 'Showing meals where food menu price <= budget'}
            </p>
          </div>
        </div>

        {processedMeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processedMeals.map(meal => (
              <div key={meal.id} className="relative">
                <FoodCard food={meal} />
                {includeFeesInBudget && (
                  <div className="mt-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium flex items-center justify-between border border-emerald-100">
                    <span>Est. Delivered Total:</span>
                    <span className="font-bold">₹{getSimulatedTotal(meal)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-amber-100 shadow-soft space-y-3">
            <Coins className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-brand-charcoal">
              No single meal fits ₹{selectedBudget} after delivery & fees.
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Delivery is ₹{FEE_CONFIG.DELIVERY_FEE_BASE} and platform fee is ₹{FEE_CONFIG.PLATFORM_FEE}. Try increasing your budget to ₹100 or ₹150, or toggle "Item Price Only".
            </p>
            <button
              onClick={() => handleSelectPreset(100)}
              className="px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-xl"
            >
              Switch to ₹100 Budget
            </button>
          </div>
        )}
      </div>

      {/* Deceptive Pricing Warning Box */}
      {deceptiveItems.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Avoid Misleading Prices Notice</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            There are {deceptiveItems.length} dish(es) with an item price under ₹{selectedBudget} (such as {deceptiveItems[0].name} at ₹{deceptiveItems[0].price}), but after adding the ₹{FEE_CONFIG.DELIVERY_FEE_BASE} delivery fee and ₹{FEE_CONFIG.PLATFORM_FEE} platform fee, their delivered total is ₹{getSimulatedTotal(deceptiveItems[0])}. We have hidden them from the strict list above to protect your budget!
          </p>
        </div>
      )}

    </div>
  );
};
