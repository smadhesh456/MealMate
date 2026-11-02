import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import type { FoodCategory, ModuleType, FoodItem } from '../../types';
import { Save, ArrowLeft, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export const EditMeal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [meal, setMeal] = useState<FoodItem | undefined>(() => StorageService.getMealById(id || ''));

  const [name, setName] = useState(meal?.name || '');
  const [description, setDescription] = useState(meal?.description || '');
  const [image, setImage] = useState(meal?.image || '');
  const [module, setModule] = useState<ModuleType>(meal?.module || 'HomePlate');
  const [category, setCategory] = useState<FoodCategory>(meal?.category || 'Lunch');
  const [price, setPrice] = useState<number>(meal?.price || 50);
  const [originalPrice, setOriginalPrice] = useState<number>(meal?.originalPrice || 80);
  const [stockQuantity, setStockQuantity] = useState<number>(meal?.stockQuantity || 10);
  const [isAvailable, setIsAvailable] = useState<boolean>(meal?.isAvailable ?? true);
  const [isVeg, setIsVeg] = useState<boolean>(meal?.isVeg ?? true);

  if (!meal) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-brand-charcoal">Dish Not Found</h2>
        <Link to="/seller/dashboard" className="text-xs font-bold text-brand-orange hover:underline">
          Return to Seller Dashboard
        </Link>
      </div>
    );
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (module === 'SaveMyMeal' && originalPrice <= price) {
      showToast('Original price must be greater than discounted price', 'warning');
      return;
    }

    const discountPercentage = module === 'SaveMyMeal' && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined;

    const updated: FoodItem = {
      ...meal,
      name: name.trim(),
      description: description.trim(),
      image,
      module,
      category,
      price,
      originalPrice: module === 'SaveMyMeal' ? originalPrice : undefined,
      discountPercentage,
      stockQuantity,
      isAvailable: isAvailable && stockQuantity > 0,
      isVeg,
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveMeal(updated);
    showToast(`Updated "${name}" successfully!`, 'success');
    navigate('/seller/dashboard');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${meal.name}"?`)) {
      StorageService.deleteMeal(meal.id);
      showToast(`"${meal.name}" removed from catalogue`, 'info');
      navigate('/seller/dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <Link
            to="/seller/dashboard"
            className="text-xs font-bold text-gray-500 hover:text-brand-orange flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight">
            Edit Dish Listing: {meal.name}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Dish</span>
        </button>
      </div>

      <form onSubmit={handleUpdate} className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-card space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Food Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Rice">Rice</option>
              <option value="Combos">Combos</option>
              <option value="Snacks">Snacks</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
            required
          />
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Selling Price (₹)</label>
            <input
              type="number"
              min="10"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal font-bold"
              required
            />
          </div>

          {module === 'SaveMyMeal' && (
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Original Price (₹)</label>
              <input
                type="number"
                min={price + 1}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal font-bold"
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Stock Quantity</label>
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal font-bold"
              required
            />
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="rounded text-brand-green focus:ring-brand-green h-4 w-4"
            />
            <span>Active & Listed for Online Orders</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
            <input
              type="checkbox"
              checked={isVeg}
              onChange={(e) => setIsVeg(e.target.checked)}
              className="rounded text-brand-green focus:ring-brand-green h-4 w-4"
            />
            <span>Vegetarian Recipe</span>
          </label>
        </div>

        {/* Image Input */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Image URL</label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>

      </form>

    </div>
  );
};
