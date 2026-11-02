import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { FoodItem } from '../../types';
import { 
  Package, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  Search,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SellerInventory: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [meals, setMeals] = useState<FoodItem[]>(() => StorageService.getMeals());
  const [search, setSearch] = useState('');

  const sellerId = user?.id?.startsWith('seller') ? user.id : 'seller-1';
  const sellerMeals = meals.filter(m => {
    if (search.trim()) {
      return m.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const handleUpdateStock = (mealId: string, delta: number) => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal) return;

    const newQty = Math.max(0, meal.stockQuantity + delta);
    const updated: FoodItem = {
      ...meal,
      stockQuantity: newQty,
      isAvailable: newQty > 0,
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveMeal(updated);
    setMeals(StorageService.getMeals());
    showToast(`Updated stock for "${meal.name}" (${newQty} portions)`, 'info');
  };

  const handleToggleAvailable = (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal) return;

    const updated: FoodItem = {
      ...meal,
      isAvailable: !meal.isAvailable,
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveMeal(updated);
    setMeals(StorageService.getMeals());
    showToast(`"${meal.name}" is now ${updated.isAvailable ? 'available' : 'hidden from ordering'}`, 'info');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <Link
            to="/seller/dashboard"
            className="text-xs font-bold text-gray-500 hover:text-brand-orange flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-brand-orange" />
            <span>Kitchen Inventory & Stock Control</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Keep portions accurate so customers cannot order unavailable food.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-brand-charcoal"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellerMeals.map(meal => {
          const isLowStock = meal.stockQuantity > 0 && meal.stockQuantity <= 5;
          const isSoldOut = !meal.isAvailable || meal.stockQuantity === 0;

          return (
            <div
              key={meal.id}
              className={`bg-white rounded-3xl p-5 border-2 transition-all space-y-4 flex flex-col justify-between ${
                isSoldOut
                  ? 'border-red-200 bg-red-50/20'
                  : isLowStock
                  ? 'border-amber-300 bg-amber-50/20 shadow-sm'
                  : 'border-amber-100 shadow-soft'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-brand-charcoal truncate">
                      {meal.name}
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      {meal.module} • ₹{meal.price}
                    </p>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {meal.sellerName}
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 text-xs">
                  {isSoldOut ? (
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-red-100 text-red-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Sold Out
                    </span>
                  ) : isLowStock ? (
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Low Stock ({meal.stockQuantity})
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      In Stock ({meal.stockQuantity})
                    </span>
                  )}

                  <span className="text-[11px] text-gray-400">
                    {meal.isAvailable ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* Quantity Controls & Visibility Toggle */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Portions:</span>
                  <div className="flex items-center gap-2 bg-cream-100 border border-amber-200 rounded-xl px-2 py-1">
                    <button
                      onClick={() => handleUpdateStock(meal.id, -1)}
                      className="w-6 h-6 flex items-center justify-center font-bold text-gray-700 hover:bg-cream-200 rounded"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-black text-sm text-brand-charcoal">
                      {meal.stockQuantity}
                    </span>
                    <button
                      onClick={() => handleUpdateStock(meal.id, 1)}
                      className="w-6 h-6 flex items-center justify-center font-bold text-gray-700 hover:bg-cream-200 rounded"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleToggleAvailable(meal.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
                      meal.isAvailable
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {meal.isAvailable ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{meal.isAvailable ? 'Mark Unavailable' : 'Reactivate Listing'}</span>
                  </button>

                  <Link
                    to={`/seller/edit-meal/${meal.id}`}
                    className="text-xs font-bold text-brand-orange hover:underline"
                  >
                    Edit Dish
                  </Link>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
