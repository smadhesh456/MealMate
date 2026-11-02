import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { FoodCard } from '../components/common/FoodCard';
import type { FoodCategory, ModuleType } from '../types';
import { 
  Search, 
  RotateCcw, 
  SlidersHorizontal, 
  Sparkles, 
  UtensilsCrossed, 
  Clock, 
  Check, 
  Filter
} from 'lucide-react';

export const ExploreMeals: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialModule = searchParams.get('module') as ModuleType | null;

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedModule, setSelectedModule] = useState<ModuleType | 'All'>(initialModule || 'All');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'All'>('All');
  const [dietFilter, setDietFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating' | 'newest' | 'discount'>('rating');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync if URL search param updates
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  const allMeals = useMemo(() => StorageService.getMeals(), []);

  // Filter categories list
  const categories: (FoodCategory | 'All')[] = [
    'All',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Rice',
    'Combos',
    'Homemade',
    'Budget Meals',
    'Discounted Meals',
  ];

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedModule('All');
    setSelectedCategory('All');
    setDietFilter('All');
    setMinPrice(0);
    setMaxPrice(200);
    setOnlyAvailable(false);
    setSortBy('rating');
    setSearchParams({});
  };

  // Coordinated Multi-filter logic
  const filteredMeals = useMemo(() => {
    return allMeals.filter(meal => {
      // 1. Text Search (food name, seller name, description, category)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = meal.name.toLowerCase().includes(query);
        const matchesSeller = meal.sellerName.toLowerCase().includes(query);
        const matchesCategory = meal.category.toLowerCase().includes(query);
        const matchesDesc = meal.description.toLowerCase().includes(query);
        if (!matchesName && !matchesSeller && !matchesCategory && !matchesDesc) {
          return false;
        }
      }

      // 2. Module Filter
      if (selectedModule !== 'All' && meal.module !== selectedModule) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Homemade' && meal.module !== 'HomePlate') return false;
        if (selectedCategory === 'Budget Meals' && meal.module !== 'BudgetBite') return false;
        if (selectedCategory === 'Discounted Meals' && meal.module !== 'SaveMyMeal') return false;
        if (
          selectedCategory !== 'Homemade' && 
          selectedCategory !== 'Budget Meals' && 
          selectedCategory !== 'Discounted Meals' && 
          meal.category !== selectedCategory
        ) {
          return false;
        }
      }

      // 4. Diet Filter
      if (dietFilter === 'Veg' && !meal.isVeg) return false;
      if (dietFilter === 'Non-Veg' && meal.isVeg) return false;

      // 5. Price Range Filter
      if (meal.price < minPrice || meal.price > maxPrice) return false;

      // 6. Availability Filter
      if (onlyAvailable) {
        if (!meal.isAvailable || meal.stockQuantity <= 0) return false;
        if (meal.module === 'SaveMyMeal' && meal.cutoffTime) {
          if (Date.now() > new Date(meal.cutoffTime).getTime()) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // 7. Sort Options
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'discount') {
        const discA = a.discountPercentage || 0;
        const discB = b.discountPercentage || 0;
        return discB - discA;
      }
      return 0;
    });
  }, [allMeals, searchQuery, selectedModule, selectedCategory, dietFilter, minPrice, maxPrice, onlyAvailable, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Search Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Campus Food Catalog
            </span>
            <h1 className="text-3xl font-extrabold text-brand-charcoal tracking-tight mt-1">
              Explore All Meals
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Browse all 20 curated sample dishes across HomePlate, BudgetBite, and SaveMyMeal.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="w-full md:w-96 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by meal, kitchen, or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-amber-200/80 rounded-2xl text-xs sm:text-sm text-brand-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Module Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-500 mr-2">Module:</span>
          <button
            onClick={() => setSelectedModule('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedModule === 'All'
                ? 'bg-brand-charcoal text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Modules (20)
          </button>
          <button
            onClick={() => setSelectedModule('HomePlate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedModule === 'HomePlate'
                ? 'bg-brand-green text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            HomePlate (7)
          </button>
          <button
            onClick={() => setSelectedModule('BudgetBite')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedModule === 'BudgetBite'
                ? 'bg-brand-orange text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            BudgetBite (7)
          </button>
          <button
            onClick={() => setSelectedModule('SaveMyMeal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedModule === 'SaveMyMeal'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            SaveMyMeal (6)
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Food Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Mobile Filter Button */}
        <div className="lg:hidden flex items-center justify-between bg-white p-3.5 rounded-2xl border border-amber-100 shadow-sm">
          <span className="text-xs font-bold text-brand-charcoal">
            Filters & Sorting ({filteredMeals.length} found)
          </span>
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange text-white rounded-xl text-xs font-bold"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{mobileFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        {/* Sidebar Filters */}
        <div className={`space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-soft space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="font-bold text-sm text-brand-charcoal flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-brand-orange" />
                Filter Options
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All
              </button>
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Sort Meals By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2.5 bg-cream-50 border border-amber-200/80 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange/40 font-medium"
              >
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Biggest Discount (%)</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* Dietary Preference (Veg / Non-Veg) */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Dietary Preference
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['All', 'Veg', 'Non-Veg'] as const).map(diet => (
                  <button
                    key={diet}
                    onClick={() => setDietFilter(diet)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                      dietFilter === diet
                        ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-cream-50'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                      selectedCategory === cat
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-cream-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-2">
                <span>Max Price Limit</span>
                <span className="text-brand-orange font-extrabold">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="30"
                max="200"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-orange cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>₹30</span>
                <span>₹100</span>
                <span>₹200</span>
              </div>
            </div>

            {/* Only Available Toggle */}
            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded text-brand-orange focus:ring-brand-orange h-4 w-4"
                />
                <span className="text-xs font-medium text-gray-700">
                  Hide Out-of-Stock & Expired
                </span>
              </label>
            </div>

          </div>
        </div>

        {/* Food Items Showcase Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Active summary bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 bg-white px-5 py-3 rounded-2xl border border-amber-100">
            <span>
              Showing <strong className="text-brand-charcoal">{filteredMeals.length}</strong> delicious meals
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Sorted by:</span>
              <span className="font-bold text-brand-charcoal capitalize">
                {sortBy.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Grid or Empty Results */}
          {filteredMeals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMeals.map(meal => (
                <FoodCard key={meal.id} food={meal} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-amber-100 shadow-soft space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl">
                🔍
              </div>
              <h3 className="text-lg font-bold text-brand-charcoal">
                No Meals Match Your Filter Combination
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Try widening your price range, clearing dietary filters, or resetting back to the initial 20 sample items.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-brand-orange text-white text-xs font-bold hover:bg-brand-orange-hover transition-colors shadow-sm inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
