import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { FoodItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { Clock, Star, Store, Plus, Minus, AlertTriangle, ShieldCheck } from 'lucide-react';

interface FoodCardProps {
  food: FoodItem;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  const { items, addToCart, updateQuantity, isItemInCutoff } = useCart();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const cartItem = items.find(i => i.foodItem.id === food.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

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
      className="group bg-white rounded-2xl overflow-hidden border border-amber-100/60 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Food Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-amber-50">
        <img
          src={food.image}
          alt={food.name}
          loading="lazy"
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
          <div className="absolute bottom-3 left-3 bg-red-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
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
      <div className="p-4 flex flex-col flex-grow">
        {/* SaveMyMeal Cutoff Countdown */}
        {food.module === 'SaveMyMeal' && timeLeft && (
          <div className={`mb-2 text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1.5 ${
            isCutoff ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-800'
          }`}>
            <Clock className="w-3 h-3 flex-shrink-0 animate-pulse text-brand-orange" />
            <span>{timeLeft}</span>
          </div>
        )}

        {/* Seller Info & Rating */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span className="flex items-center gap-1 truncate max-w-[160px]" title={food.sellerName}>
            <Store className="w-3 h-3 text-brand-green" />
            <span className="truncate">{food.sellerName}</span>
          </span>
          <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded font-semibold text-[11px]">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{food.rating.toFixed(1)}</span>
            <span className="text-gray-400 text-[10px]">({food.reviewCount})</span>
          </div>
        </div>

        {/* Food Name */}
        <Link to={`/meal/${food.id}`} className="group-hover:text-brand-orange transition-colors">
          <h3 className="font-bold text-brand-charcoal text-base leading-snug line-clamp-1 mb-1">
            {food.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-grow">
          {food.description}
        </p>

        {/* Stock status indicator */}
        <div className="text-[11px] text-gray-400 mb-2 flex items-center justify-between">
          <span>{food.category}</span>
          {food.stockQuantity > 0 && food.stockQuantity <= 5 && !isDisabled && (
            <span className="text-amber-600 font-semibold animate-pulse">
              Only {food.stockQuantity} left!
            </span>
          )}
        </div>

        {/* Price & Action Button Row */}
        <div className="pt-2 border-t border-amber-50 flex items-center justify-between mt-auto">
          {/* Price breakdown */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-brand-charcoal">
                ₹{food.price}
              </span>
              {food.originalPrice && food.originalPrice > food.price && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  ₹{food.originalPrice}
                </span>
              )}
            </div>
            {food.originalPrice && food.originalPrice > food.price && (
              <span className="text-[10px] text-brand-green font-bold">
                Save ₹{food.originalPrice - food.price}
              </span>
            )}
          </div>

          {/* Cart Buttons */}
          <div>
            {qtyInCart > 0 ? (
              <div className="flex items-center gap-2 bg-brand-orange text-white rounded-xl px-2 py-1 shadow-sm">
                <button
                  onClick={() => updateQuantity(food.id, qtyInCart - 1)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-md transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold w-4 text-center">{qtyInCart}</span>
                <button
                  onClick={() => addToCart(food, 1)}
                  disabled={qtyInCart >= food.stockQuantity || isDisabled}
                  className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-md transition-colors disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(food, 1)}
                disabled={isDisabled}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                  isDisabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-brand-orange text-white hover:bg-brand-orange-hover shadow-sm hover:shadow hover:-translate-y-0.5'
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
