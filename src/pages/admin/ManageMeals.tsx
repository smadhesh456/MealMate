import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import type { FoodItem, ModuleType } from '../../types';
import { UtensilsCrossed, ArrowLeft, Search, Plus, Trash2, Edit3, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManageMeals: React.FC = () => {
  const { showToast } = useToast();
  const [meals, setMeals] = useState<FoodItem[]>(() => StorageService.getMeals());
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<ModuleType | 'All'>('All');

  const filteredMeals = meals.filter(m => {
    if (moduleFilter !== 'All' && m.module !== moduleFilter) return false;
    if (search.trim()) {
      return (
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.sellerName.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  const handleToggleAvailability = (meal: FoodItem) => {
    const updated: FoodItem = {
      ...meal,
      isAvailable: !meal.isAvailable,
      updatedAt: new Date().toISOString(),
    };
    StorageService.saveMeal(updated);
    setMeals(StorageService.getMeals());
    showToast(`"${meal.name}" availability toggled to ${updated.isAvailable ? 'Active' : 'Hidden'}`, 'info');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" from catalogue permanently?`)) {
      StorageService.deleteMeal(id);
      setMeals(StorageService.getMeals());
      showToast(`"${name}" deleted`, 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <Link
            to="/admin/dashboard"
            className="text-xs font-bold text-gray-500 hover:text-brand-orange flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-7 h-7 text-brand-orange" />
            <span>Master Meals & Categories Catalogue ({meals.length})</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse and manage all dishes across HomePlate, BudgetBite, and SaveMyMeal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/seller/add-meal"
            className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">Module:</span>
          {(['All', 'HomePlate', 'BudgetBite', 'SaveMyMeal'] as const).map(m => (
            <button
              key={m}
              onClick={() => setModuleFilter(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                moduleFilter === m
                  ? 'bg-brand-charcoal text-white shadow-sm'
                  : 'bg-cream-50 text-gray-600 hover:bg-cream-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meal, seller, or category..."
            className="w-full pl-9 pr-3 py-2 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Master Catalogue Table */}
      <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50 text-gray-500 font-bold uppercase border-y border-gray-100">
              <tr>
                <th className="py-3 px-4">Dish Name</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Seller Kitchen</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Diet</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMeals.map(meal => (
                <tr key={meal.id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={meal.image} alt={meal.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <span className="font-bold text-brand-charcoal block">{meal.name}</span>
                        <span className="text-[10px] text-gray-400">★ {meal.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-700">{meal.module}</td>
                  <td className="py-3.5 px-4 text-gray-600">{meal.category}</td>
                  <td className="py-3.5 px-4 text-brand-green font-medium truncate max-w-[150px]">
                    {meal.sellerName}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-brand-charcoal">
                    ₹{meal.price}
                    {meal.originalPrice && (
                      <span className="text-[10px] text-gray-400 line-through ml-1">₹{meal.originalPrice}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-700">{meal.stockQuantity}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      meal.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {meal.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {meal.isAvailable ? (
                      <span className="text-[11px] font-bold text-emerald-700">Listed</span>
                    ) : (
                      <span className="text-[11px] font-bold text-red-600">Hidden</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleToggleAvailability(meal)}
                      className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                      title={meal.isAvailable ? 'Hide from store' : 'Unhide in store'}
                    >
                      {meal.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-500" />}
                    </button>
                    <Link
                      to={`/seller/edit-meal/${meal.id}`}
                      className="p-1.5 hover:bg-gray-100 rounded text-brand-orange inline-block"
                      title="Edit dish"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(meal.id, meal.name)}
                      className="p-1.5 hover:bg-red-50 rounded text-red-500"
                      title="Delete dish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
