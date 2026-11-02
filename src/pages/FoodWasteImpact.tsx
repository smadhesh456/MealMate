import React from 'react';
import { Leaf, HeartHandshake, TrendingDown, Scale, ShieldCheck, ArrowRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FoodWasteImpact: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero */}
      <div className="bg-gradient-to-tr from-emerald-800 to-teal-950 rounded-3xl p-8 sm:p-14 text-white shadow-card relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>SaveMyMeal Ecological Impact Report</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Fighting Food Waste & Campus Hunger Together
          </h1>

          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            In colleges and nearby cafeterias, perfectly fresh cooked meals often go unserved at the end of lunch and dinner shifts. SaveMyMeal connects hungry students with these delicious dishes at heavy discounts before cutoff time.
          </p>
        </div>
      </div>

      {/* Verified Demo Metrics Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-soft space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-brand-green">142.5 kg</span>
          <h3 className="font-bold text-xs text-brand-charcoal">Food Rescued</h3>
          <p className="text-[11px] text-gray-400">Recorded landfill diversion (Demo)</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-soft space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-emerald-600">356+</span>
          <h3 className="font-bold text-xs text-brand-charcoal">Surplus Meals Sold</h3>
          <p className="text-[11px] text-gray-400">High-protein student meals</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-soft space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-teal-700">285 kg</span>
          <h3 className="font-bold text-xs text-brand-charcoal">CO₂e Emissions Prevented</h3>
          <p className="text-[11px] text-gray-400">~2 kg CO₂e saved per kg food</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-soft space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-brand-orange">₹24,800</span>
          <h3 className="font-bold text-xs text-brand-charcoal">Student Savings</h3>
          <p className="text-[11px] text-gray-400">Kept in student pockets</p>
        </div>
      </div>

      {/* How the Science Works */}
      <div className="bg-white rounded-3xl p-8 border border-amber-100 shadow-card space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">
            Methodology & Formulas
          </span>
          <h2 className="text-2xl font-extrabold text-brand-charcoal mt-1">
            How MealMate Computes Environmental Impact
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            We follow standard UNEP food waste and GHG equivalence metrics for educational honesty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600">
          <div className="p-5 rounded-2xl bg-cream-50 border border-amber-100 space-y-2">
            <Scale className="w-6 h-6 text-brand-green mb-1" />
            <h4 className="font-bold text-brand-charcoal text-sm">1. Meal Weight Standard</h4>
            <p className="leading-relaxed text-[11px]">
              Every rescued portion in SaveMyMeal (e.g. Veg Biryani, Fried Rice Combo) accounts for an average of 400 grams (0.4 kg) of cooked edible surplus.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-cream-50 border border-amber-100 space-y-2">
            <Leaf className="w-6 h-6 text-emerald-600 mb-1" />
            <h4 className="font-bold text-brand-charcoal text-sm">2. Carbon Factor (2.0x)</h4>
            <p className="leading-relaxed text-[11px]">
              Rotting organic matter in landfills generates methane gas. For every 1 kg of food diverted, approximately 2.0 kg of CO₂ equivalent greenhouse gas is avoided.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-cream-50 border border-amber-100 space-y-2">
            <Award className="w-6 h-6 text-brand-orange mb-1" />
            <h4 className="font-bold text-brand-charcoal text-sm">3. Honest Labeling</h4>
            <p className="leading-relaxed text-[11px]">
              All calculations reflect actual orders placed in the MealMate database layered on calibrated initial sample project data.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 text-center">
          <Link
            to="/savemymeal"
            className="px-6 py-3 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2"
          >
            <span>Explore Today's SaveMyMeal Surplus Deals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
};
