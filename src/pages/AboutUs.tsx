import React from 'react';
import { UtensilsCrossed, Sparkles, Clock, Heart, Users, ShieldCheck, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutUs: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-amber-100 shadow-card text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 text-white flex items-center justify-center mx-auto text-3xl shadow-md">
          🍲
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">
            Our Mission & Purpose
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal tracking-tight">
            About MealMate
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Smart Food Delivery Platform engineered to solve real campus challenges: connecting students with healthy home-cooked food, preventing budget shock, and eliminating edible food waste.
          </p>
        </div>
      </div>

      {/* The 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-soft space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-brand-green flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-brand-charcoal">HomePlate</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Empowering neighborhood mothers and home cooks to sell fresh daily homestyle cooking with flexible weekly and monthly subscription passes.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-soft space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-brand-charcoal">BudgetBite</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Guaranteed honest pricing for students on pocket money. We factor in delivery fees and taxes before showing results so students never face cart checkout surprises.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-soft space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-brand-charcoal">SaveMyMeal</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Connecting restaurants with students to rescue high-quality surplus meals at steep discounts before scheduled cutoff hours, reducing campus carbon footprints.
          </p>
        </div>
      </div>

      {/* College Project Credits */}
      <div className="bg-cream-100 rounded-3xl p-8 border border-amber-200/80 space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-brand-orange" />
          <h2 className="text-lg font-bold text-brand-charcoal">
            College Capstone Engineering Project
          </h2>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          MealMate is designed and developed as a complete full-stack web application capstone demonstration. Built with modern React 19, TypeScript, Vite, Tailwind CSS, persistent LocalStorage data pipelines, and ready for Supabase backend deployment.
        </p>

        <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-gray-700">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-green" />
            100% Cash On Delivery Only
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-green" />
            Role-Based Access Control
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-green" />
            Swiggy-Grade Itemized Bill Architecture
          </span>
        </div>
      </div>

    </div>
  );
};
