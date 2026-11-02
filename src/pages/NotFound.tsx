import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Sparkles, Clock, ArrowRight, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-amber-100 text-brand-orange flex items-center justify-center text-4xl mx-auto shadow-inner">
          🍲
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold text-brand-charcoal">
            Dish or Page Not Found
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            The page you are looking for may have been moved, expired, or doesn't exist in MealMate.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-100 shadow-soft space-y-2 text-left">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Popular MealMate Destinations:
          </span>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <Link to="/homeplate" className="flex items-center gap-2 p-2 rounded-xl hover:bg-cream-100 font-bold text-brand-charcoal">
              <UtensilsCrossed className="w-4 h-4 text-brand-green" />
              <span>HomePlate Homemade Meals</span>
            </Link>
            <Link to="/budgetbite" className="flex items-center gap-2 p-2 rounded-xl hover:bg-cream-100 font-bold text-brand-charcoal">
              <Sparkles className="w-4 h-4 text-brand-orange" />
              <span>BudgetBite (Under ₹100)</span>
            </Link>
            <Link to="/savemymeal" className="flex items-center gap-2 p-2 rounded-xl hover:bg-cream-100 font-bold text-brand-charcoal">
              <Clock className="w-4 h-4 text-rose-600" />
              <span>SaveMyMeal Surplus Deals</span>
            </Link>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-xs font-bold shadow-md transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to MealMate Home</span>
        </Link>
      </div>
    </div>
  );
};
