import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { FoodCard } from '../components/common/FoodCard';
import { 
  UtensilsCrossed, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  HeartHandshake, 
  Coins, 
  Leaf, 
  Star, 
  CheckCircle2, 
  Search,
  Layers
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const allMeals = StorageService.getMeals();

  // Filter 4 featured items for each section
  const homePlateFeatured = allMeals.filter(m => m.module === 'HomePlate').slice(0, 4);
  const budgetBiteFeatured = allMeals.filter(m => m.module === 'BudgetBite').slice(0, 4);
  const saveMyMealFeatured = allMeals.filter(m => m.module === 'SaveMyMeal').slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/explore?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-100/50 via-cream-100 to-transparent pt-8 sm:pt-14 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold tracking-wide">
                <Sparkles className="w-4 h-4 text-brand-orange" />
                <span>The Complete Smart Food Platform for College & Beyond</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-charcoal tracking-tight leading-[1.15]">
                Fresh Homemade Food, <span className="text-brand-orange">Budget Meals</span> & Surplus Rescues.
              </h1>

              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                Craving genuine home-cooked meals? On a tight campus budget? Or want to save great surplus food at huge discounts? MealMate has you covered with 100% Cash on Delivery.
              </p>

              {/* Hero Search & Quick Chips */}
              <div className="pt-2 max-w-xl mx-auto lg:mx-0">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-card rounded-2xl bg-white border border-amber-200/80 p-1.5 focus-within:ring-2 focus-within:ring-brand-orange/50 transition-all">
                  <Search className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search Idli Sambar, Fried Rice, Thali, Biryani..."
                    className="w-full px-3 py-2.5 text-sm text-brand-charcoal placeholder-gray-400 bg-transparent focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Popular Keywords */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500 justify-center lg:justify-start">
                  <span className="font-semibold">Quick picks:</span>
                  <button onClick={() => navigate('/explore?search=Idli')} className="hover:text-brand-orange underline">Idli Sambar (₹40)</button>
                  <span>•</span>
                  <button onClick={() => navigate('/budgetbite?maxBudget=80')} className="hover:text-brand-orange underline">Under ₹80</button>
                  <span>•</span>
                  <button onClick={() => navigate('/savemymeal')} className="hover:text-brand-orange underline">SaveMyMeal 40% Off</button>
                </div>
              </div>

              {/* Quick Hero Metrics */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-amber-200/60 max-w-lg mx-auto lg:mx-0 text-center">
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-brand-charcoal">20</p>
                  <p className="text-[11px] text-gray-500 font-medium">Curated Menu Items</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-brand-green">100%</p>
                  <p className="text-[11px] text-gray-500 font-medium">COD Security</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-brand-orange">₹30-₹120</p>
                  <p className="text-[11px] text-gray-500 font-medium">Pocket-Friendly</p>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-amber-50 relative aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1000&q=80"
                    alt="Authentic Homemade Thali with variety dishes"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-green">
                      HomePlate Cook of the Day
                    </span>
                    <h3 className="text-lg font-bold mt-1">Lakshmi Amma's Homemade Veg Meals</h3>
                    <p className="text-xs text-amber-100">Fresh daily lunch cooked with love • ₹90</p>
                  </div>
                </div>

                {/* Floating Badge 1 - SaveMyMeal Discount */}
                <div className="absolute -top-4 -right-4 sm:-right-6 bg-white rounded-2xl p-3 shadow-card border border-amber-100 flex items-center gap-2.5 animate-bounce duration-1000">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Surplus Alert</p>
                    <p className="text-xs font-extrabold text-brand-charcoal">Save up to 45%</p>
                  </div>
                </div>

                {/* Floating Badge 2 - Student Budget */}
                <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-white rounded-2xl p-3 shadow-card border border-amber-100 flex items-center gap-2.5 shadow-soft">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">BudgetBite</p>
                    <p className="text-xs font-extrabold text-brand-charcoal">Meals from ₹40</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THE THREE CORE MODULES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-brand-charcoal tracking-tight">
            Three Tailored Ways to Order
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Switch between mother's style home food, student budget-friendly choices, and end-of-day restaurant surplus savings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: HomePlate */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-soft hover:shadow-card transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-7 h-7" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                MODULE A
              </div>
              <h3 className="text-2xl font-bold text-brand-charcoal mb-2">
                HomePlate
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Connect with local neighborhood home cooks. Fresh breakfast, lunch, and dinner cooked in hygienic residential kitchens with weekly & monthly subscription passes.
              </p>
              <ul className="text-xs text-gray-600 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Healthy homestyle breakfast & thali rices</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Verified home cooks & transparent kitchen details</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>7-Day & 30-Day meal passes available</span>
                </li>
              </ul>
            </div>
            <Link
              to="/homeplate"
              className="w-full py-3 px-4 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold text-center flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>Explore HomePlate Meals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: BudgetBite */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-soft hover:shadow-card transition-all group flex flex-col justify-between relative ring-2 ring-brand-orange/20">
            <div className="absolute -top-3 right-6 bg-brand-orange text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              Student Favorite
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
                MODULE B
              </div>
              <h3 className="text-2xl font-bold text-brand-charcoal mb-2">
                BudgetBite
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Pick your budget (₹50, ₹80, ₹100, ₹150) and discover satisfying meals with transparent final totals including delivery so you never face checkout surprises.
              </p>
              <ul className="text-xs text-gray-600 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Preset budget buttons: ₹50, ₹80, ₹100, ₹150</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Fee consideration prevents checkout shock</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Affordable combo suggestions</span>
                </li>
              </ul>
            </div>
            <Link
              to="/budgetbite"
              className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold text-center flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>Explore Budget Meals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: SaveMyMeal */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-soft hover:shadow-card transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 mb-2">
                MODULE C
              </div>
              <h3 className="text-2xl font-bold text-brand-charcoal mb-2">
                SaveMyMeal
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Rescue fresh surplus food from premium restaurants before cutoff hours at massive discounts (up to 45% off). Save money and curb food waste!
              </p>
              <ul className="text-xs text-gray-600 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                  <span>Live countdown timers to order cutoff</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                  <span>Strict cutoff locking prevents stale orders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                  <span>Track recorded food-waste kilograms rescued</span>
                </li>
              </ul>
            </div>
            <Link
              to="/savemymeal"
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold text-center flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>View Surplus Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* 3. HOMEPLATE FEATURED MEALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green uppercase tracking-wider mb-1">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Homemade Comfort Food</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
              HomePlate Daily Specials
            </h2>
          </div>
          <Link
            to="/homeplate"
            className="text-xs font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1 group"
          >
            <span>View All 7 Homemade Dishes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {homePlateFeatured.map(meal => (
            <FoodCard key={meal.id} food={meal} />
          ))}
        </div>
      </section>

      {/* 4. BUDGETBITE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Pocket Savers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
              BudgetBite Quick Picks
            </h2>
          </div>
          <Link
            to="/budgetbite"
            className="text-xs font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1 group"
          >
            <span>Filter by Custom Budget</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {budgetBiteFeatured.map(meal => (
            <FoodCard key={meal.id} food={meal} />
          ))}
        </div>
      </section>

      {/* 5. SAVEMYMEAL SURPLUS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Surplus Food Deals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
              SaveMyMeal Rescue Deals
            </h2>
          </div>
          <Link
            to="/savemymeal"
            className="text-xs font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1 group"
          >
            <span>View All Surplus Listings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {saveMyMealFeatured.map(meal => (
            <FoodCard key={meal.id} food={meal} />
          ))}
        </div>
      </section>

      {/* 6. HOW MEALMATE WORKS */}
      <section className="bg-white py-16 border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl font-extrabold text-brand-charcoal mt-1">
              How MealMate Works
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              Designed specifically for college students and local neighborhood food artisans.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-3 p-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-brand-orange flex items-center justify-center mx-auto text-xl font-black">
                1
              </div>
              <h3 className="font-bold text-base text-brand-charcoal">Choose Your Vibe</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pick homemade food in HomePlate, budget meals in BudgetBite, or discounted surplus in SaveMyMeal.
              </p>
            </div>

            <div className="text-center space-y-3 p-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-brand-green flex items-center justify-center mx-auto text-xl font-black">
                2
              </div>
              <h3 className="font-bold text-base text-brand-charcoal">Swiggy-Style Cart</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Review line-item totals, delivery fees, and discount coupons with 100% price transparency.
              </p>
            </div>

            <div className="text-center space-y-3 p-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto text-xl font-black">
                3
              </div>
              <h3 className="font-bold text-base text-brand-charcoal">Cash On Delivery</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                No credit cards, UPI failures, or internet banking hassle. Pay in cash only when food arrives!
              </p>
            </div>

            <div className="text-center space-y-3 p-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-black">
                4
              </div>
              <h3 className="font-bold text-base text-brand-charcoal">Manual Order Tracking</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Follow order stages from kitchen preparation to dispatch with verifiable timestamps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOD-WASTE IMPACT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-brand-charcoal to-gray-900 rounded-3xl p-8 sm:p-12 text-white shadow-card overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-600 text-emerald-400 text-xs font-bold">
                <Leaf className="w-3.5 h-3.5" />
                <span>SaveMyMeal Ecological Impact</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Rescuing Good Food, One Plate at a Time.
              </h2>

              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                Every surplus meal bought on SaveMyMeal prevents wholesome food from ending up in landfills. This directly reduces methane emissions and conserves kitchen resources.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800 text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400">142 kg</p>
                  <p className="text-[11px] text-gray-400">Recorded Food Saved (Demo)</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-amber-400">350+</p>
                  <p className="text-[11px] text-gray-400">Student Meals Rescued</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-rose-400">₹24,500</p>
                  <p className="text-[11px] text-gray-400">Student Money Saved</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/impact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold transition-all"
                >
                  <span>Explore Environmental Impact Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-64 h-64 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
                <span className="text-4xl mb-2">🌍</span>
                <span className="text-xl font-bold text-white">Save The Planet</span>
                <span className="text-xs text-emerald-300 mt-1">Zero Food Waste Campus Initiative</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. CUSTOMER TESTIMONIALS (Clearly labeled as sample) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 mb-2">
            Sample College Feedback
          </div>
          <h2 className="text-3xl font-extrabold text-brand-charcoal">
            What Students & Cooks Say
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            *Representative sample testimonials illustrating college platform adoption.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-soft space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-600 italic leading-relaxed">
              "Being in hostel, I missed home food immensely. Lakshmi Amma's weekly lunch pass on HomePlate has been a lifesaver. Sambar tastes identical to mom's cooking!"
            </p>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-brand-charcoal">Rahul Sharma</p>
              <p className="text-[11px] text-gray-400">3rd Year B.Tech • Engineering Hostel Block C</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-soft space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-600 italic leading-relaxed">
              "BudgetBite makes ordering stress-free at end of month. Clicking 'Under ₹80' shows meals where the final bill with delivery stays under my budget. No fake prices!"
            </p>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-brand-charcoal">Sneha Patel</p>
              <p className="text-[11px] text-gray-400">M.Sc Biotechnology • Campus Day Scholar</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-soft space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-600 italic leading-relaxed">
              "As a home cook, selling through HomePlate gave me independence. I prepare 25 fresh lunches daily and the seller order management dashboard is clean and easy."
            </p>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-brand-charcoal">Annapoorna Devi</p>
              <p className="text-[11px] text-gray-400">Home Chef • Annapoorna Home Kitchen</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-orange to-amber-500 rounded-3xl p-8 sm:p-12 text-white shadow-elevated text-center space-y-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready for Wholesome, Affordable Meals?
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Order delicious food today or sign up as a home cook to share your culinary talent with our campus community.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/explore"
              className="px-6 py-3 rounded-xl bg-brand-charcoal hover:bg-black text-white text-xs font-bold transition-all shadow-md"
            >
              Start Ordering Now
            </Link>
            <Link
              to="/seller/register"
              className="px-6 py-3 rounded-xl bg-white hover:bg-cream-100 text-brand-charcoal text-xs font-bold transition-all shadow-md"
            >
              Partner as a Cook / Restaurant
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
