import React, { useState } from 'react';
import { INITIAL_SUBSCRIPTION_PLANS } from '../data/sampleCatalog';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import type { CustomerSubscription, SubscriptionPlan } from '../types';
import { 
  Layers, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  MapPin
} from 'lucide-react';

export const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [deliverySlot, setDeliverySlot] = useState<'Breakfast (7:30 - 8:30 AM)' | 'Lunch (12:30 - 1:30 PM)' | 'Dinner (7:30 - 8:30 PM)'>('Lunch (12:30 - 1:30 PM)');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const addrs = StorageService.getAddresses();
    return addrs[0]?.id || '';
  });

  const addresses = StorageService.getAddresses();

  const handleSubscribe = () => {
    if (!selectedPlan) return;
    const targetAddr = addresses.find(a => a.id === selectedAddressId) || addresses[0];

    if (!targetAddr) {
      showToast('Please add a delivery address first in Saved Addresses', 'warning');
      return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + selectedPlan.daysCount * 24 * 60 * 60 * 1000);

    const newSub: CustomerSubscription = {
      id: `sub-${Date.now()}`,
      customerId: user?.id || 'demo-user',
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      sellerName: selectedPlan.sellerName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      price: selectedPlan.price,
      status: 'Active',
      deliveryAddress: targetAddr,
      deliveryTimeSlot: deliverySlot,
      createdAt: new Date().toISOString(),
    };

    StorageService.saveSubscription(newSub);
    showToast(`Successfully enrolled in ${selectedPlan.name}!`, 'success');
    setSelectedPlan(null);
    navigate('/subscription-manage');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-brand-green rounded-3xl p-8 sm:p-12 text-white shadow-card text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
          <Layers className="w-4 h-4 text-emerald-300" />
          <span>HomePlate Meal Passes — Zero Cooking Hassle</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mx-auto">
          Wholesome Daily Homemade Food Subscription
        </h1>
        <p className="text-emerald-100 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Pre-book hot daily lunch or breakfast prepared with hygienic care by verified neighborhood home cooks. Save up to 25% compared to daily individual ordering.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {INITIAL_SUBSCRIPTION_PLANS.map(plan => (
          <div
            key={plan.id}
            className="bg-white rounded-3xl overflow-hidden border border-amber-100 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              {/* Plan Header Image */}
              <div className="relative aspect-video w-full overflow-hidden bg-amber-50">
                <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-brand-charcoal text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                  {plan.type} ({plan.daysCount} Days)
                </div>
                <div className="absolute bottom-3 left-3 bg-brand-green text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                  Save {plan.savingsPercent}%
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-extrabold text-lg text-brand-charcoal leading-snug">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-brand-green font-semibold mt-1">
                    Prepared by {plan.sellerName}
                  </p>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {plan.description}
                </p>

                {/* Included Dishes */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Sample Daily Rotation:
                  </span>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    {plan.mealsIncluded.map((meal, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
                        <span>{meal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Price & Action */}
            <div className="p-6 pt-0 mt-auto">
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-black text-brand-charcoal">
                    ₹{plan.price}
                  </span>
                  <span className="text-xs text-gray-400 block">
                    Total for {plan.daysCount} days
                  </span>
                </div>
                <span className="text-xs font-bold text-brand-green bg-emerald-50 px-2.5 py-1 rounded-lg">
                  ~₹{(plan.price / plan.daysCount).toFixed(0)}/day
                </span>
              </div>

              <button
                onClick={() => setSelectedPlan(plan)}
                className="w-full py-3 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Subscribe to Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Subscribe Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-card space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-brand-charcoal">
                  Confirm Subscription Enrollment
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedPlan.name}</p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-gray-400 hover:text-brand-charcoal font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Delivery Time Slot */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Preferred Delivery Time Slot
              </label>
              <select
                value={deliverySlot}
                onChange={(e) => setDeliverySlot(e.target.value as any)}
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs font-medium text-brand-charcoal"
              >
                <option value="Breakfast (7:30 - 8:30 AM)">Breakfast (7:30 - 8:30 AM)</option>
                <option value="Lunch (12:30 - 1:30 PM)">Lunch (12:30 - 1:30 PM)</option>
                <option value="Dinner (7:30 - 8:30 PM)">Dinner (7:30 - 8:30 PM)</option>
              </select>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Hostel / Campus Delivery Location
              </label>
              {addresses.length > 0 ? (
                <select
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs font-medium text-brand-charcoal"
                >
                  {addresses.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.type}: {a.addressLine1}, {a.city}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-red-500">
                  No saved address found. <Link to="/saved-addresses" className="underline font-bold">Add one here</Link>.
                </p>
              )}
            </div>

            {/* Pricing note */}
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
              <div className="flex justify-between font-bold text-sm">
                <span>Total Pass Charge:</span>
                <span>₹{selectedPlan.price}</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Payment collected in Cash on Delivery on the first day of meal delivery.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubscribe}
                className="px-6 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-xl shadow-md"
              >
                Confirm Pass Enrollment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
