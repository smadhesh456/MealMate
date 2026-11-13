import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { FoodItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { Clock, Star, Store, Plus, Minus, AlertTriangle } from 'lucide-react';
import { FALLBACK_FOOD_IMAGE } from '../../services/api';

interface FoodCardProps {
  food: FoodItem;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  const { items, addToCart, updateQuantity, isItemInCutoff } = useCart();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string>(food.image || FALLBACK_FOOD_IMAGE);

  const cartItem = items.find(i => i.foodItem.id === food.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  useEffect(() => {
    setImgSrc(food.image || FALLBACK_FOOD_IMAGE);
  }, [food.image]);

  useEffect(() => {
    if (food.module === 'SaveMyMeal' && food.cutoffTime) {
      const updateTimer = () => {
        const diff = new Date(food.cutoffTime!).getTime() - Date.now();
        if (diff <= 0) {
          setTimeLeft('Cutoff Passed');
          setIsExpired(true);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${mins}m ${secs}s left`);
          setIsExpired(false);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [food.module, food.cutoffTime]);

  const isCutoff = isItemInCutoff(food) || isExpired;
  const isSoldOut = !food.isAvailable || food.stockQuantity <= 0;
  const isDisabled = isSoldOut || isCutoff;

  // Module color badges
  const moduleBadge = {
    HomePlate: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'HomePlate' },
    BudgetBite: { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'BudgetBite' },
    SaveMyMeal: { bg: 'bg-rose-100 text-rose-800 border-rose-200', label: 'SaveMyMeal' },
  }[food.module];

  return (
    <article 
      aria-label={`${food.name} - ₹${food.price}`}
      className="group bg-white rounded-2xl overflow-hidden border border-amber-100 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Food Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-amber-50">
        <img
          src={imgSrc}
          alt={food.name}
          loading="lazy"
          onError={() => setImgSrc(FALLBACK_FOOD_IMAGE)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isDisabled ? 'grayscale opacity-60' : ''
          }`}
        />

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
          <span 
            className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center ${
              food.isVeg ? 'border-green-600' : 'border-red-600'
            }`}
            title={food.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${food.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
          </span>
        </div>

        {/* Module Badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${moduleBadge.bg}`}>
            {moduleBadge.label}
          </span>
        </div>

        {/* SaveMyMeal Discount Tag */}
        {food.module === 'SaveMyMeal' && food.discountPercentage && (
          <div className="absolute bottom-3 left-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
            <span>{food.discountPercentage}% OFF</span>
          </div>
        )}

        {/* Overlay if disabled */}
        {isDisabled && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
            <span className="bg-white/95 text-red-600 font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {isSoldOut ? 'Sold Out' : 'Cutoff Time Passed'}
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3">
        
        {/* Title, Category & Kitchen Info */}
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <Link 
              to={`/meal/${food.id}`}
              className="text-sm sm:text-base font-extrabold text-brand-charcoal hover:text-brand-orange transition-colors line-clamp-1"
            >
              {food.name}
            </Link>
            
            {/* Rating */}
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-black flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{food.rating}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {food.description}
          </p>

          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 pt-0.5">
            <Store className="w-3 h-3 text-gray-400" />
            <span className="truncate max-w-[170px]">{food.sellerName}</span>
          </div>
        </div>

        {/* SaveMyMeal Live Timer or Prep Time */}
        {food.module === 'SaveMyMeal' ? (
          <div className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
            isExpired ? 'bg-red-50 text-red-600' : 'bg-rose-50 text-rose-700'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft || 'Calculating cutoff...'}</span>
            <span className="ml-auto text-[11px] font-semibold text-gray-500">
              {food.stockQuantity} portion{food.stockQuantity !== 1 ? 's' : ''} left
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Prep: {food.prepTimeMinutes} mins</span>
            <span className={food.stockQuantity < 5 ? 'text-amber-600 font-bold' : ''}>
              {food.stockQuantity < 5 ? `Only ${food.stockQuantity} left!` : 'Available'}
            </span>
          </div>
        )}

        {/* Price & Add to Cart Controls */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
          
          {/* Price Box */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-brand-charcoal">
                ₹{food.price}
              </span>
              {food.originalPrice && food.originalPrice > food.price && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{food.originalPrice}
                </span>
              )}
            </div>
            {food.originalPrice && food.originalPrice > food.price && (
              <span className="text-[10px] text-emerald-600 font-bold">
                Save ₹{food.originalPrice - food.price}
              </span>
            )}
          </div>

          {/* Cart Quantity Action Buttons */}
          <div>
            {qtyInCart > 0 ? (
              <div className="flex items-center gap-2 bg-brand-orange text-white rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => updateQuantity(food.id, qtyInCart - 1)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-black/10 rounded-lg transition-colors font-bold"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-4 text-center text-xs font-black select-none">
                  {qtyInCart}
                </span>
                <button
                  onClick={() => updateQuantity(food.id, qtyInCart + 1)}
                  disabled={qtyInCart >= food.stockQuantity}
                  className="w-7 h-7 flex items-center justify-center hover:bg-black/10 rounded-lg transition-colors font-bold disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(food)}
                disabled={isDisabled}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm ${
                  isDisabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-orange hover:bg-brand-orange-hover text-white hover:shadow'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </article>
  );
};
