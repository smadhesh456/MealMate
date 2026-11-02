import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StorageService } from '../services/storage';
import type { Address, Order, OrderItem } from '../types';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  User, 
  IndianRupee, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Plus,
  Gift,
  Sparkles
} from 'lucide-react';
import { calculateBill } from '../utils/pricing';
import { RewardsService } from '../services/rewards';

export const Checkout: React.FC = () => {
  const { items, bill, couponCode, useRewardPoints, setUseRewardPoints, clearCart, isItemInCutoff } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load saved addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>(() => {
    return StorageService.getAddresses();
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const def = savedAddresses.find(a => a.isDefault);
    return def ? def.id : savedAddresses[0]?.id || 'new';
  });

  // Customer contact info
  const [customerName, setCustomerName] = useState(user?.name || 'Rahul Sharma');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+91 98765 43210');

  // New address fields
  const [showNewAddressForm, setShowNewAddressForm] = useState(savedAddresses.length === 0);
  const [newAddressLine1, setNewAddressLine1] = useState('');
  const [newAddressLine2, setNewAddressLine2] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newCity, setNewCity] = useState('Chennai');
  const [newPincode, setNewPincode] = useState('600025');
  const [newAddressType, setNewAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLine1.trim() || !newCity.trim() || !newPincode.trim()) {
      showToast('Please fill all mandatory address fields', 'warning');
      return;
    }

    const created: Address = {
      id: `addr-${Date.now()}`,
      fullName: customerName,
      phone: customerPhone,
      addressLine1: newAddressLine1.trim(),
      addressLine2: newAddressLine2.trim() || undefined,
      landmark: newLandmark.trim() || undefined,
      city: newCity.trim(),
      pincode: newPincode.trim(),
      isDefault: savedAddresses.length === 0,
      type: newAddressType,
    };

    StorageService.saveAddress(created);
    setSavedAddresses(StorageService.getAddresses());
    setSelectedAddressId(created.id);
    setShowNewAddressForm(false);
    showToast('Delivery address saved successfully!', 'success');
  };

  const handlePlaceOrder = async () => {
    setValidationError('');

    // 1. Validate customer details
    if (!customerName.trim() || !customerPhone.trim()) {
      setValidationError('Please enter customer name and contact phone number.');
      return;
    }

    // 2. Resolve delivery address
    const targetAddress = savedAddresses.find(a => a.id === selectedAddressId);
    if (!targetAddress) {
      setValidationError('Please select or create a valid delivery address.');
      return;
    }

    // 3. Strict Pre-checkout Validation of items, availability, stock, and SaveMyMeal cutoff
    const freshMeals = StorageService.getMeals();
    for (const cartItem of items) {
      const freshMeal = freshMeals.find(m => m.id === cartItem.foodItem.id);
      if (!freshMeal || !freshMeal.isAvailable) {
        setValidationError(`"${cartItem.foodItem.name}" is no longer available. Please remove it from your cart.`);
        return;
      }

      if (cartItem.quantity > freshMeal.stockQuantity) {
        setValidationError(`Only ${freshMeal.stockQuantity} portion(s) available for "${cartItem.foodItem.name}". Please adjust quantity.`);
        return;
      }

      if (isItemInCutoff(freshMeal)) {
        setValidationError(`The ordering cutoff time for SaveMyMeal dish "${freshMeal.name}" has expired.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Simulate trusted server-side recalculated bill
      const authoritativeBill = calculateBill(items, couponCode, useRewardPoints);

      // Map cart items to frozen OrderItems
      const orderItems: OrderItem[] = items.map(ci => ({
        foodId: ci.foodItem.id,
        name: ci.foodItem.name,
        image: ci.foodItem.image,
        price: ci.foodItem.price,
        originalPrice: ci.foodItem.originalPrice,
        quantity: ci.quantity,
        lineTotal: ci.foodItem.price * ci.quantity,
        sellerId: ci.foodItem.sellerId,
        sellerName: ci.foodItem.sellerName,
        module: ci.foodItem.module,
      }));

      const newOrderId = `ORD-${Date.now()}`;
      const newOrderNumber = `MM-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder: Order = {
        id: newOrderId,
        orderNumber: newOrderNumber,
        customerId: user?.id || 'demo-user',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: targetAddress,
        items: orderItems,
        itemTotal: authoritativeBill.itemTotal,
        savingsTotal: authoritativeBill.savingsTotal,
        deliveryFee: authoritativeBill.deliveryFee,
        platformFee: authoritativeBill.platformFee,
        couponDiscount: authoritativeBill.couponDiscount,
        couponCode: couponCode || undefined,
        rewardDiscount: authoritativeBill.rewardDiscount || 0,
        rewardPointsUsed: authoritativeBill.rewardPointsUsed || 0,
        finalTotal: authoritativeBill.finalTotal,
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        orderStatus: 'Order Placed',
        statusTimestamps: {
          'Order Placed': new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 4. Handle Reward Points: either redeem 100 pts for 20% offer OR award +20 pts for unique order day
      let rewardNotice = '';
      if (authoritativeBill.rewardPointsUsed && authoritativeBill.rewardPointsUsed >= 100) {
        RewardsService.redeemPointsForOffer(newOrderNumber, user?.id);
        rewardNotice = '🎉 100 Points Redeemed! 20% discount applied to this order.';
      } else {
        const awardRes = RewardsService.awardOrderDayPoints(newOrderId, newOrder.createdAt, user?.id);
        if (awardRes.awarded) {
          newOrder.pointsEarned = awardRes.pointsAwarded;
          rewardNotice = awardRes.message;
        }
      }

      // 5. Save order to persistent storage
      StorageService.saveOrder(newOrder);

      // 6. Deduct inventory stock
      StorageService.reduceStock(
        items.map(i => ({ foodId: i.foodItem.id, quantity: i.quantity }))
      );

      // 7. Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore if canvas not available
      }

      // 8. Clear cart and redirect
      clearCart();
      showToast(`Order ${newOrderNumber} placed! ${rewardNotice}`, 'success');
      navigate(`/order-confirmation/${newOrderId}`);
    } catch (err) {
      console.error('Order creation error', err);
      setValidationError('An unexpected error occurred while placing the order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <Link
            to="/cart"
            className="text-xs font-bold text-gray-500 hover:text-brand-orange flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight">
            Checkout & Cash on Delivery
          </h1>
        </div>
      </div>

      {validationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700 font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Contact & Address Selection */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Customer Contact Details */}
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-soft space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal flex items-center gap-2">
              <User className="w-4 h-4 text-brand-orange" />
              <span>1. Customer Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs font-medium text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs font-medium text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-green" />
                <span>2. Delivery Address</span>
              </h2>

              <button
                type="button"
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showNewAddressForm ? 'Select Saved' : '+ New Address'}</span>
              </button>
            </div>

            {/* Saved Addresses Radio Cards */}
            {!showNewAddressForm && savedAddresses.length > 0 && (
              <div className="space-y-3">
                {savedAddresses.map(addr => (
                  <label
                    key={addr.id}
                    className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-brand-green bg-emerald-50/40 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 text-brand-green focus:ring-brand-green"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-brand-charcoal">{addr.type}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                            {addr.landmark && `Near ${addr.landmark}, `}
                            {addr.city} - {addr.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Add New Address Sub-Form */}
            {showNewAddressForm && (
              <form onSubmit={handleAddNewAddress} className="space-y-3 p-4 bg-cream-50 rounded-2xl border border-amber-200">
                <span className="text-xs font-bold text-brand-charcoal block">
                  Add Delivery Location
                </span>

                <div>
                  <input
                    type="text"
                    value={newAddressLine1}
                    onChange={(e) => setNewAddressLine1(e.target.value)}
                    placeholder="Hostel Block, Room / Flat No., Department *"
                    className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newAddressLine2}
                    onChange={(e) => setNewAddressLine2(e.target.value)}
                    placeholder="Campus Lane / Street"
                    className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                  />
                  <input
                    type="text"
                    value={newLandmark}
                    onChange={(e) => setNewLandmark(e.target.value)}
                    placeholder="Landmark (e.g. Near Library)"
                    className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="City *"
                    className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                    required
                  />
                  <input
                    type="text"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    placeholder="Pincode *"
                    className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-charcoal text-white rounded-xl text-xs font-bold hover:bg-black"
                >
                  Save and Use Address
                </button>
              </form>
            )}
          </div>

          {/* 3. Cash on Delivery Only Notice */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500/30 shadow-soft space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-brand-green" />
              <span>3. Payment Method: Cash on Delivery (COD)</span>
            </h2>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                <p className="font-bold">Strictly Cash on Delivery Only</p>
                <p className="mt-0.5 text-[11px] text-emerald-800">
                  Online payments (UPI/Card/NetBanking) are disabled in this platform. You will pay <strong>₹{bill.finalTotal.toFixed(2)}</strong> in cash to the delivery partner upon arrival. Payment status will be marked 'Paid' only when cash is handed over.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Order Preview & Authoritative Bill */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-card space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Order Items ({items.length})
            </h2>

            <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 pr-1 text-xs">
              {items.map(item => (
                <div key={item.foodItem.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate max-w-[200px]">
                    <span className="font-bold text-gray-400">{item.quantity}x</span>
                    <span className="font-medium text-brand-charcoal truncate">{item.foodItem.name}</span>
                  </div>
                  <span className="font-bold text-brand-charcoal">
                    ₹{item.foodItem.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* 100 Points Redemption Toggle if available */}
            {RewardsService.getRewardStatus(user?.id).canRedeem && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-amber-50 border border-purple-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-purple-900 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-purple-600" />
                    100 Points Milestone Available!
                  </span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Redeem 100 pts for 20% OFF on this 6th order
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseRewardPoints(!useRewardPoints)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    useRewardPoints
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'bg-white border border-purple-300 text-purple-800 hover:bg-purple-50'
                  }`}
                >
                  {useRewardPoints ? '✓ 20% OFF Applied' : 'Apply 20% OFF'}
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span>₹{bill.itemTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span>₹{bill.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>₹{bill.platformFee.toFixed(2)}</span>
              </div>
              {bill.couponDiscount > 0 && (
                <div className="flex justify-between text-brand-green font-bold">
                  <span>Coupon Discount</span>
                  <span>−₹{bill.couponDiscount.toFixed(2)}</span>
                </div>
              )}
              {bill.rewardDiscount !== undefined && bill.rewardDiscount > 0 && (
                <div className="flex justify-between text-purple-700 font-extrabold bg-purple-50 p-2 rounded-xl border border-purple-200">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-purple-600" />
                    <span>Loyalty Reward (100 Pts = 20% OFF)</span>
                  </span>
                  <span>−₹{bill.rewardDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t-2 border-dashed border-gray-200 flex justify-between items-baseline">
                <span className="text-base font-extrabold text-brand-charcoal">
                  FINAL CASH PAYABLE
                </span>
                <span className="text-2xl font-black text-brand-charcoal">
                  ₹{bill.finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm flex items-center justify-center gap-2 shadow-elevated transition-all disabled:opacity-50 hover:scale-102"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Validating & Placing Order...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>CONFIRM & PLACE COD ORDER</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-gray-400 text-center">
              By placing this order you agree to pay cash upon delivery.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
