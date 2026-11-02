import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  Info, 
  IndianRupee, 
  Store,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Gift,
  Award,
  Calendar
} from 'lucide-react';
import { FEE_CONFIG, formatCurrency } from '../utils/pricing';
import { RewardsService } from '../services/rewards';

export const Cart: React.FC = () => {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    bill, 
    couponCode, 
    applyCoupon, 
    removeCoupon,
    useRewardPoints,
    setUseRewardPoints,
    totalItemsCount 
  } = useCart();

  const { user } = useAuth();
  const [rewardStatus, setRewardStatus] = useState(() => RewardsService.getRewardStatus(user?.id));
  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!inputCoupon.trim()) return;

    const result = applyCoupon(inputCoupon);
    if (!result.success) {
      setCouponError(result.message);
    } else {
      setInputCoupon('');
    }
  };

  const handleClearWithConfirm = () => {
    if (window.confirm('Are you sure you want to clear all items from your cart?')) {
      clearCart();
    }
  };

  // If empty cart
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-cream-200/60 text-brand-orange flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
            Your MealMate Cart is Empty
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Looks like you haven't added any dishes yet. Explore our HomePlate home meals, BudgetBite selections, or SaveMyMeal surplus rescue deals!
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/explore"
            className="px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-2xl shadow-sm transition-all inline-flex items-center gap-2"
          >
            <span>Explore All 20 Catalog Meals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/budgetbite"
            className="px-6 py-3 bg-white border border-amber-200 text-brand-charcoal text-xs font-bold rounded-2xl shadow-sm hover:bg-cream-50 transition-all"
          >
            Find Meals Under ₹100
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Clear Option */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-orange" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight">
              Swiggy-Style Food Cart
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {totalItemsCount} item{totalItemsCount > 1 ? 's' : ''} in your order • 100% Cash on Delivery
          </p>
        </div>

        <button
          onClick={handleClearWithConfirm}
          className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 border border-red-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Line Items List */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-soft space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Selected Dishes
            </h2>

            <div className="divide-y divide-gray-100">
              {items.map(({ foodItem, quantity }) => {
                const lineTotal = foodItem.price * quantity;
                const originalTotal = foodItem.originalPrice ? foodItem.originalPrice * quantity : 0;
                const lineSavings = originalTotal > lineTotal ? originalTotal - lineTotal : 0;

                return (
                  <div key={foodItem.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                    
                    {/* Food Thumbnail */}
                    <img
                      src={foodItem.image}
                      alt={foodItem.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-shrink-0 bg-amber-50 border border-amber-100"
                    />

                    {/* Meal Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 border-2 rounded-sm flex items-center justify-center ${
                          foodItem.isVeg ? 'border-green-600' : 'border-red-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${foodItem.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                        </span>
                        <h3 className="font-bold text-sm text-brand-charcoal truncate">
                          {foodItem.name}
                        </h3>
                      </div>

                      <p className="text-[11px] text-gray-400 flex items-center gap-1 truncate">
                        <Store className="w-3 h-3 text-brand-green" />
                        <span>{foodItem.sellerName}</span>
                      </p>

                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-xs font-bold text-brand-charcoal">
                          ₹{foodItem.price} each
                        </span>
                        {foodItem.originalPrice && foodItem.originalPrice > foodItem.price && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ₹{foodItem.originalPrice}
                          </span>
                        )}
                        {lineSavings > 0 && (
                          <span className="text-[10px] text-brand-green font-bold bg-emerald-50 px-1.5 rounded">
                            Save ₹{lineSavings}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Line Total */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-2 bg-cream-100 border border-amber-200 rounded-xl px-2 py-1">
                        <button
                          onClick={() => updateQuantity(foodItem.id, quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-brand-charcoal font-bold"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-extrabold w-4 text-center text-brand-charcoal">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(foodItem.id, quantity + 1)}
                          disabled={quantity >= foodItem.stockQuantity}
                          className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-brand-charcoal font-bold disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-black text-brand-charcoal">
                        ₹{lineTotal}
                      </span>

                      <button
                        onClick={() => removeFromCart(foodItem.id)}
                        className="text-[11px] text-gray-400 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <Link
                to="/explore"
                className="font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue Shopping & Add More</span>
              </Link>
              <span className="text-gray-400">
                Max {items.length} unique items
              </span>
            </div>

          </div>

          {/* Delivery & Security Note */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3 text-xs text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">MealMate COD Guarantee</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Pay in cash directly to delivery personnel at your doorstep. No prepayment risk.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Swiggy-Style Itemized Bill Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 5-Day Milestone & Loyalty Rewards Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-purple-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-300 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-brand-orange text-white flex items-center justify-center font-black shadow-sm">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-brand-charcoal">
                    5-Day Loyalty Streak & 100 Pts
                  </h2>
                  <p className="text-[10px] text-gray-500 font-semibold">
                    20 pts/day • 5 days = 100 pts • 6th order 20% OFF
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-black border border-amber-200">
                🪙 {rewardStatus.points} Pts
              </span>
            </div>

            {/* 5-Day Visual Progress Track */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-brand-charcoal">
                  Day Progress: {rewardStatus.daysCount}/5 Days
                </span>
                <span className={rewardStatus.canRedeem ? 'text-purple-700 font-extrabold' : 'text-gray-500'}>
                  {rewardStatus.canRedeem ? '🎉 20% Offer Ready!' : `${rewardStatus.daysRemaining} days remaining`}
                </span>
              </div>

              {/* Step Dots */}
              <div className="grid grid-cols-6 gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((d) => {
                  const completed = d <= rewardStatus.daysCount;
                  return (
                    <div
                      key={d}
                      className={`text-center py-1.5 px-1 rounded-xl border text-[10px] font-bold transition-all ${
                        completed
                          ? 'bg-amber-400 border-amber-500 text-white shadow-sm'
                          : 'bg-white/80 border-gray-200 text-gray-400'
                      }`}
                    >
                      <span>Day {d}</span>
                      <span className="block text-[9px] font-black">{completed ? '✓ 20p' : '20p'}</span>
                    </div>
                  );
                })}

                {/* 6th Order 20% Offer Badge */}
                <div
                  className={`text-center py-1.5 px-1 rounded-xl border text-[10px] font-bold transition-all ${
                    rewardStatus.canRedeem
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-700 text-white shadow-sm animate-pulse'
                      : 'bg-white/80 border-gray-200 text-gray-400'
                  }`}
                >
                  <span>Order 6</span>
                  <span className="block text-[9px] font-black">🎁 20% OFF</span>
                </div>
              </div>
            </div>

            {/* Redemption or Progress Banner */}
            {rewardStatus.canRedeem ? (
              <div className="bg-white rounded-2xl p-4 border border-purple-200 space-y-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      100 Points Milestone Unlocked!
                    </span>
                    <p className="text-[11px] text-gray-600">
                      Redeem your 100 points right now to get a flat <strong>20% discount</strong> on this food order!
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  {useRewardPoints ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-100 border border-purple-300 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-700 flex-shrink-0" />
                        <span className="font-extrabold text-purple-900">
                          20% Loyalty Offer Applied! (−₹{bill.rewardDiscount || 0})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseRewardPoints(false)}
                        className="text-[11px] font-bold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setUseRewardPoints(true)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Redeem 100 Points for 20% OFF This Order</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/80 rounded-2xl p-3 border border-amber-200 text-xs text-gray-600 space-y-2">
                <p className="text-[11px]">
                  Finish orders on <strong>5 different calendar days</strong> (20 points each = 100 points). On your 6th order, use your 100 points for a flat <strong>20% discount</strong>!
                </p>
                {/* Evaluator Demo Quick Actions */}
                <div className="pt-1 border-t border-amber-100 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="font-bold text-amber-800">⚡ College Demo:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const res = RewardsService.simulateAddOrderDay(user?.id);
                      setRewardStatus(res);
                    }}
                    className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold transition-colors"
                  >
                    + Add Day Order (+20 pts)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const res = RewardsService.simulateSet100Points(user?.id);
                      setRewardStatus(res);
                      setUseRewardPoints(true);
                    }}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors"
                  >
                    ⚡ Set 100 Pts (Ready for 20% OFF)
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Coupons Card */}
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-soft space-y-4">
            <h2 className="text-sm font-bold text-brand-charcoal flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-orange" />
              <span>Apply Campus Coupons</span>
            </h2>

            {couponCode ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                <div>
                  <span className="font-extrabold text-emerald-800 tracking-wider">
                    🎉 COUPON '{couponCode}' APPLIED!
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Saved ₹{bill.couponDiscount} on this order
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    placeholder="Enter code (MEAL10 / COLLEGE20 / FREEDEL)"
                    className="flex-1 px-3 py-2 bg-cream-50 border border-amber-200 rounded-xl text-xs font-semibold text-brand-charcoal uppercase focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-charcoal text-white hover:bg-black text-xs font-bold rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-red-600 font-semibold">{couponError}</p>
                )}
                <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => { setInputCoupon('MEAL10'); }}
                    className="text-brand-orange font-bold hover:underline"
                  >
                    MEAL10 (10% off &gt;₹100)
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => { setInputCoupon('COLLEGE20'); }}
                    className="text-brand-orange font-bold hover:underline"
                  >
                    COLLEGE20 (20% off &gt;₹150)
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Itemized Order Summary Box */}
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-card space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Bill Details (Swiggy-Style Itemized)
            </h2>

            <div className="space-y-3 text-xs text-gray-600">
              {/* Item Total */}
              <div className="flex justify-between items-center">
                <span>Item Total</span>
                <span className="font-semibold text-brand-charcoal">
                  ₹{bill.itemTotal.toFixed(2)}
                </span>
              </div>

              {/* Surplus Savings if any */}
              {bill.savingsTotal > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-medium">
                  <span>SaveMyMeal Item Discounts</span>
                  <span>−₹{bill.savingsTotal.toFixed(2)}</span>
                </div>
              )}

              {/* Delivery Fee with Threshold logic */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span>Delivery Partner Fee</span>
                  {bill.deliveryFee === 0 && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                      FREE
                    </span>
                  )}
                </div>
                <span className={bill.deliveryFee === 0 ? 'text-emerald-700 font-bold' : 'text-brand-charcoal font-semibold'}>
                  {bill.deliveryFee === 0 ? '₹0.00' : `₹${bill.deliveryFee.toFixed(2)}`}
                </span>
              </div>

              {/* Platform Fee */}
              <div className="flex justify-between items-center">
                <span>Platform Fee</span>
                <span className="font-semibold text-brand-charcoal">
                  ₹{bill.platformFee.toFixed(2)}
                </span>
              </div>

              {/* Coupon Discount */}
              {bill.couponDiscount > 0 && (
                <div className="flex justify-between items-center text-brand-green font-bold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span>−₹{bill.couponDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* 20% Reward Discount (6th Order / 100 Points) */}
              {bill.rewardDiscount !== undefined && bill.rewardDiscount > 0 && (
                <div className="flex justify-between items-center text-purple-700 font-extrabold bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                  <span className="flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-purple-600" />
                    <span>Loyalty Reward (100 Pts = 20% OFF)</span>
                  </span>
                  <span>−₹{bill.rewardDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Delivery threshold reminder */}
              {bill.itemTotal < FEE_CONFIG.DELIVERY_FREE_THRESHOLD && (
                <div className="p-2.5 bg-amber-50 rounded-xl text-[11px] text-amber-900 border border-amber-200">
                  Add ₹{(FEE_CONFIG.DELIVERY_FREE_THRESHOLD - bill.itemTotal).toFixed(0)} more of tasty food to unlock <strong>FREE Delivery</strong>!
                </div>
              )}

              {/* Final Grand Total */}
              <div className="pt-3 border-t-2 border-dashed border-gray-200 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-extrabold text-brand-charcoal block">
                    TO PAY
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Payment Method: Cash on Delivery
                  </span>
                </div>
                <span className="text-2xl font-black text-brand-charcoal">
                  ₹{bill.finalTotal.toFixed(2)}
                </span>
              </div>

              {/* Total Savings Summary banner */}
              {(bill.savingsTotal > 0 || bill.couponDiscount > 0 || (bill.rewardDiscount && bill.rewardDiscount > 0)) && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-bold">
                  🎉 You are saving ₹{(bill.savingsTotal + bill.couponDiscount + (bill.rewardDiscount || 0)).toFixed(2)} on this order!
                </div>
              )}
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-brand-orange hover:bg-brand-orange-hover text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-elevated transition-all hover:scale-102"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
