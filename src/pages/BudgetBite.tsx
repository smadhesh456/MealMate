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
  Plus,
  UtensilsCrossed
} from 'lucide-react';
import { FEE_CONFIG, calculateBill } from '../utils/pricing';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const BudgetBite: React.FC = () => {
  const [selectedBudget, setSelectedBudget] = useState<number>(100);
  const [customBudgetValue, setCustomBudgetValue] = useState<string>('100');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [includeFeesInBudget, setIncludeFeesInBudget] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'low-to-high' | 'high-to-low'>('low-to-high');
  const [dietFilter, setDietFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const { addToCart } = useCart();
  const { showToast } = useToast();
  const allMeals = useMemo(() => StorageService.getMeals(), []);

  // Preset budgets: ₹50, ₹80, ₹100, ₹150 (Requirement 4)
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

  // Helper to calculate total payable amount for 1 portion with delivery and platform fees
  const getSimulatedTotal = (item: FoodItem) => {
    const singleCartItem = [{ foodItem: item, quantity: 1 }];
    const bill = calculateBill(singleCartItem);
    return bill.finalTotal;
  };

  // Filter and sort items strictly according to budget and diet
  const processedMeals = useMemo(() => {
    return allMeals.filter(meal => {
      // 1. Diet Filter (Requirement 4: Vegetarian, Non-Vegetarian, All)
      if (dietFilter === 'Veg' && !meal.isVeg) return false;
      if (dietFilter === 'Non-Veg' && meal.isVeg) return false;

      // 2. Category Filter
      if (categoryFilter !== 'All' && meal.category !== categoryFilter) return false;

      // 3. Strict Budget Calculation
      if (includeFeesInBudget) {
        // Guaranteed total payable amount including delivery (₹25) and platform fee (₹5)
        const totalPayable = getSimulatedTotal(meal);
        return totalPayable <= selectedBudget;
      } else {
        return meal.price <= selectedBudget;
      }
    }).sort((a, b) => {
      const priceA = includeFeesInBudget ? getSimulatedTotal(a) : a.price;
      const priceB = includeFeesInBudget ? getSimulatedTotal(b) : b.price;
      return sortBy === 'low-to-high' ? priceA - priceB : priceB - priceA;
    });
  }, [allMeals, selectedBudget, includeFeesInBudget, sortBy, dietFilter, categoryFilter]);

  // Suggested affordable meal combinations
  const affordableCombos = useMemo(() => {
    const combinations: { item1: FoodItem; item2: FoodItem; total: number; savings: number }[] = [];
    if (selectedBudget < 80) return combinations;

    const available = allMeals.filter(m => m.isAvailable && m.stockQuantity > 0);
    for (let i = 0; i < available.length; i++) {
      for (let j = i + 1; j < available.length; j++) {
        const item1 = available[i];
        const item2 = available[j];

        // Apply diet filter to combos if selected
        if (dietFilter === 'Veg' && (!item1.isVeg || !item2.isVeg)) continue;
        if (dietFilter === 'Non-Veg' && (item1.isVeg && item2.isVeg)) continue;

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
    return combinations.slice(0, 3);
  }, [allMeals, selectedBudget, dietFilter]);

  const handleAddComboToCart = (item1: FoodItem, item2: FoodItem) => {
    addToCart(item1);
    addToCart(item2);
    showToast(`Added combo "${item1.name} + ${item2.name}" to cart!`, 'success');
  };

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
            Never be surprised by checkout fees. We factor in food prices, standard delivery (₹{FEE_CONFIG.DELIVERY_FEE_BASE}), and platform fee (₹{FEE_CONFIG.PLATFORM_FEE}) so your final bill never exceeds your budget! Orders above ₹300 receive free delivery.
          </p>
        </div>
      </div>

      {/* Interactive Budget Selector Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-soft space-y-6">
        
        {/* Step 1: Choose Budget */}
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
                min="20"
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
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-50/70 p-4 rounded-2xl">
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
              {includeFeesInBudget ? 'Include Fees (Strict)' : 'Menu Price Only'}
            </span>
          </label>
        </div>

        {/* Step 3: Food Filters (Requirement 4: All Foods, Vegetarian, Non-Vegetarian) */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Food Filter:</span>
            
            <button
              onClick={() => setDietFilter('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dietFilter === 'All'
                  ? 'bg-brand-charcoal text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Foods
            </button>

            <button
              onClick={() => setDietFilter('Veg')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                dietFilter === 'Veg'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Vegetarian
            </button>

            <button
              onClick={() => setDietFilter('Non-Veg')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                dietFilter === 'Non-Veg'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-gray-100 text-red-800 hover:bg-red-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              Non-Vegetarian
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-bold text-gray-400">Sort:</span>
            <button
              onClick={() => setSortBy(sortBy === 'low-to-high' ? 'high-to-low' : 'low-to-high')}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-brand-charcoal transition-all"
            >
              {sortBy === 'low-to-high' ? 'Price: Low to High' : 'Price: High to Low'}
            </button>
          </div>
        </div>

      </div>

      {/* Suggested Affordable Meal Combinations (Requirement 4) */}
      {affordableCombos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-orange" />
            <h2 className="text-xl font-extrabold text-brand-charcoal">
              Affordable Meal Combinations Under ₹{selectedBudget}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {affordableCombos.map((combo, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-4 border border-amber-200 shadow-soft flex flex-col justify-between gap-3 hover:shadow-card transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    <span>Combo Pair #{idx + 1}</span>
                    <span>Total ₹{combo.total} (Inc. Fees)</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <img src={combo.item1.image} alt={combo.item1.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-brand-charcoal line-clamp-1">{combo.item1.name}</p>
                        <p className="text-gray-400 text-[10px]">₹{combo.item1.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src={combo.item2.image} alt={combo.item2.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-brand-charcoal line-clamp-1">{combo.item2.name}</p>
                        <p className="text-gray-400 text-[10px]">₹{combo.item2.price}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAddComboToCart(combo.item1, combo.item2)}
                  className="w-full py-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Combo to Cart</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Food Listings Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-brand-charcoal">
            Meals Under ₹{selectedBudget} ({processedMeals.length})
          </h2>
          <span className="text-xs text-gray-500">
            {dietFilter === 'Non-Veg' ? 'Showing Non-Vegetarian options' : dietFilter === 'Veg' ? 'Showing Vegetarian options' : 'Showing all options'}
          </span>
        </div>

        {processedMeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedMeals.map(meal => (
              <FoodCard key={meal.id} food={meal} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-amber-200 shadow-soft space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-brand-orange rounded-2xl flex items-center justify-center mx-auto">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brand-charcoal">
              No {dietFilter === 'Non-Veg' ? 'Non-Vegetarian' : dietFilter === 'Veg' ? 'Vegetarian' : ''} meals found strictly under ₹{selectedBudget} with fees.
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Try switching to a higher budget preset (₹80, ₹100, ₹150) or toggling "Menu Price Only" to view items whose base price fits your budget!
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => handleSelectPreset(150)}
                className="px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-xl shadow-sm hover:bg-brand-orange-hover"
              >
                View Meals Under ₹150
              </button>
              <button
                onClick={() => setDietFilter('All')}
                className="px-4 py-2 bg-cream-100 text-brand-charcoal text-xs font-bold rounded-xl hover:bg-cream-200"
              >
                Show All Foods
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
