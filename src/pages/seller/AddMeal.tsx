import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storage';
import type { FoodCategory, ModuleType, FoodItem } from '../../types';
import { Plus, ArrowLeft, Image as ImageIcon, Sparkles, Clock, UtensilsCrossed } from 'lucide-react';

export const AddMeal: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80');
  const [module, setModule] = useState<ModuleType>('HomePlate');
  const [category, setCategory] = useState<FoodCategory>('Lunch');
  const [price, setPrice] = useState<number>(80);
  const [originalPrice, setOriginalPrice] = useState<number>(120);
  const [stockQuantity, setStockQuantity] = useState<number>(20);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(20);
  const [isVeg, setIsVeg] = useState<boolean>(true);
  const [cutoffHours, setCutoffHours] = useState<number>(3); // 3 hours from now for SaveMyMeal

  // Image presets
  const sampleImages = [
    { label: 'Thali Feast', url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80' },
    { label: 'Idli & Sambar', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80' },
    { label: 'Masala Dosa', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80' },
    { label: 'Veg Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
    { label: 'Fried Rice', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Chapati Kurma', url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || price <= 0 || stockQuantity < 0) {
      showToast('Please fill all required meal details', 'warning');
      return;
    }

    if (module === 'SaveMyMeal') {
      if (originalPrice <= price) {
        showToast('For SaveMyMeal, original price must be higher than discounted price', 'warning');
        return;
      }
    }

    const discountPercentage = module === 'SaveMyMeal' && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined;

    const cutoffTime = module === 'SaveMyMeal'
      ? new Date(Date.now() + cutoffHours * 60 * 60 * 1000).toISOString()
      : undefined;

    const newMeal: FoodItem = {
      id: `meal-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      image,
      category,
      price,
      originalPrice: module === 'SaveMyMeal' ? originalPrice : undefined,
      discountPercentage,
      sellerId: user?.id || 'seller-1',
      sellerName: user?.businessName || user?.name || 'Home Kitchen',
      module,
      rating: 4.8,
      reviewCount: 1,
      isVeg,
      isAvailable: stockQuantity > 0,
      stockQuantity,
      prepTimeMinutes,
      cutoffTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveMeal(newMeal);
    showToast(`"${name}" has been added to your menu!`, 'success');
    navigate('/seller/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <Link
          to="/seller/dashboard"
          className="text-xs font-bold text-gray-500 hover:text-brand-orange flex items-center gap-1 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Seller Dashboard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight flex items-center gap-2">
          <Plus className="w-7 h-7 text-brand-orange" />
          <span>Add New Meal Listing</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Create a dish listing for HomePlate homemade meals, BudgetBite, or SaveMyMeal surplus rescue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-card space-y-6">
        
        {/* Module Choice */}
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-2">
            Select Platform Module *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setModule('HomePlate')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                module === 'HomePlate'
                  ? 'border-brand-green bg-emerald-50/50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <UtensilsCrossed className="w-5 h-5 text-brand-green mb-1" />
              <strong className="text-xs font-bold block text-brand-charcoal">HomePlate</strong>
              <span className="text-[11px] text-gray-500">Fresh daily homemade cooking</span>
            </button>

            <button
              type="button"
              onClick={() => setModule('BudgetBite')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                module === 'BudgetBite'
                  ? 'border-brand-orange bg-amber-50/50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Sparkles className="w-5 h-5 text-brand-orange mb-1" />
              <strong className="text-xs font-bold block text-brand-charcoal">BudgetBite</strong>
              <span className="text-[11px] text-gray-500">Fast pocket-friendly campus dining</span>
            </button>

            <button
              type="button"
              onClick={() => setModule('SaveMyMeal')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                module === 'SaveMyMeal'
                  ? 'border-rose-500 bg-rose-50/50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Clock className="w-5 h-5 text-rose-600 mb-1" />
              <strong className="text-xs font-bold block text-brand-charcoal">SaveMyMeal</strong>
              <span className="text-[11px] text-gray-500">Discounted surplus before cutoff</span>
            </button>
          </div>
        </div>

        {/* Basic Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Food Item Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Masala Dosa with Sambar"
              className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Food Category *
            </label>
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
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Description & Recipe Notes *
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe ingredients, authentic style, and serving portions..."
            className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
            required
          />
        </div>

        {/* Pricing & Stock Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              {module === 'SaveMyMeal' ? 'Discounted Price (₹) *' : 'Selling Price (₹) *'}
            </label>
            <input
              type="number"
              min="10"
              max="500"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal font-bold"
              required
            />
          </div>

          {module === 'SaveMyMeal' && (
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Original Price (₹) *
              </label>
              <input
                type="number"
                min={price + 1}
                max="1000"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal font-bold"
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Available Stock Portions *
            </label>
            <input
              type="number"
              min="0"
              max="200"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal font-bold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Prep Time (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={prepTimeMinutes}
              onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
              className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
            />
          </div>
        </div>

        {/* SaveMyMeal Cutoff Hours */}
        {module === 'SaveMyMeal' && (
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 space-y-2">
            <span className="text-xs font-bold text-rose-900 block">
              Surplus Cutoff Window
            </span>
            <div className="flex items-center gap-4 text-xs">
              <label className="text-gray-700">Order cutoff time from now:</label>
              <select
                value={cutoffHours}
                onChange={(e) => setCutoffHours(Number(e.target.value))}
                className="p-1.5 bg-white border border-rose-200 rounded-lg text-xs"
              >
                <option value="1">1 Hour from now</option>
                <option value="2">2 Hours from now</option>
                <option value="3">3 Hours from now (Tonight)</option>
                <option value="5">5 Hours from now</option>
              </select>
            </div>
          </div>
        )}

        {/* Veg / Non-Veg Toggle */}
        <div className="flex items-center gap-4 pt-2">
          <label className="text-xs font-bold text-gray-700">Dietary Category:</label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs">
              <input
                type="radio"
                name="vegType"
                checked={isVeg}
                onChange={() => setIsVeg(true)}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="font-semibold text-green-700">Pure Vegetarian</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs">
              <input
                type="radio"
                name="vegType"
                checked={!isVeg}
                onChange={() => setIsVeg(false)}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="font-semibold text-red-700">Non-Vegetarian</span>
            </label>
          </div>
        </div>

        {/* Image Selection */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <label className="text-xs font-bold text-gray-700 block">
            Food Photography Image URL
          </label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Paste image URL"
            className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
            required
          />

          <div className="pt-2">
            <span className="text-[11px] text-gray-400 block mb-1.5">Or pick a campus preset:</span>
            <div className="flex flex-wrap gap-2">
              {sampleImages.map(img => (
                <button
                  key={img.label}
                  type="button"
                  onClick={() => setImage(img.url)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    image === img.url
                      ? 'bg-brand-orange text-white border-brand-orange font-bold'
                      : 'bg-cream-50 text-gray-600 hover:bg-cream-100 border-amber-200'
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Dish to Menu</span>
        </button>

      </form>

    </div>
  );
};
