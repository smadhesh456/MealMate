import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Shield, Heart, IndianRupee, Sparkles, Clock, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-charcoal text-cream-100 pt-14 pb-8 border-t border-gray-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-gray-800">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center shadow-md">
                <span className="text-xl">🍲</span>
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Meal<span className="text-brand-orange">Mate</span>
              </span>
            </Link>
            
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Smart Food Delivery Platform bringing wholesome homemade meals (HomePlate), affordable campus dining (BudgetBite), and discounted surplus rescue (SaveMyMeal) together under one roof.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-semibold">
                <IndianRupee className="w-3.5 h-3.5" />
                Cash On Delivery Only
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                No Fake Markups
              </span>
            </div>
          </div>

          {/* Module Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              Explore Modules
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/homeplate" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3 h-3 text-emerald-400" />
                  HomePlate Homemade
                </Link>
              </li>
              <li>
                <Link to="/budgetbite" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  BudgetBite Under ₹100
                </Link>
              </li>
              <li>
                <Link to="/savemymeal" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-rose-400" />
                  SaveMyMeal Surplus
                </Link>
              </li>
              <li>
                <Link to="/subscriptions" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-purple-400" />
                  Meal Subscription Passes
                </Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-emerald-400" />
                  Food-Waste Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Student & Customer Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              Customer Hub
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  All 20 Sample Meals
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Swiggy-Style Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Live Manual Order Tracking
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  My Profile & Saved Addresses
                </Link>
              </li>
              <li>
                <Link to="/subscription-manage" className="hover:text-white transition-colors">
                  Manage Subscriptions
                </Link>
              </li>
            </ul>
          </div>

          {/* Seller & Admin Portals */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              Partners & Admin
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/seller/register" className="hover:text-white transition-colors">
                  Register as Home Cook
                </Link>
              </li>
              <li>
                <Link to="/seller/login" className="hover:text-white transition-colors">
                  Seller Portal Login
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="hover:text-white transition-colors">
                  Seller Operations Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors">
                  Administrator Login
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-white transition-colors">
                  Master Admin Dashboard
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About MealMate Team
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Help & Contact Us
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>© 2026 MealMate Technologies. Built for College Engineering Capstone Project.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-brand-green" />
              Transparent Pricing
            </span>
            <span>•</span>
            <span>Zero Hidden Fees</span>
            <span>•</span>
            <span>Local Storage Mock Mode</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
