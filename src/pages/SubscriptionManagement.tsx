import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { CustomerSubscription } from '../types';
import { 
  Layers, 
  Calendar, 
  Clock, 
  Pause, 
  Play, 
  XCircle, 
  CheckCircle2, 
  AlertCircle,
  BellRing,
  ArrowRight,
  Store
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SubscriptionManagement: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>(() => {
    return StorageService.getSubscriptions();
  });

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Paused' | 'Cancelled') => {
    StorageService.updateSubscriptionStatus(id, newStatus);
    setSubscriptions(StorageService.getSubscriptions());
    showToast(`Subscription status updated to "${newStatus}"`, 'info');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-brand-green" />
            <span>Manage Meal Subscriptions</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review your active passes, pause for exams/holidays, or check renewal dates.
          </p>
        </div>

        <Link
          to="/subscriptions"
          className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <span>Explore All Subscription Passes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Renewal & Holiday Pause Tips Banner */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <BellRing className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-0.5 font-bold">Holiday & Exam Pause Policy:</strong>
          Heading home for the weekend or busy with midterms? You can pause your meal deliveries anytime and resume when you are back on campus without losing prepaid days.
        </div>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length > 0 ? (
        <div className="space-y-4">
          {subscriptions.map(sub => {
            const startDate = new Date(sub.startDate);
            const endDate = new Date(sub.endDate);
            const isNearExpiry = endDate.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 && sub.status === 'Active';

            return (
              <div
                key={sub.id}
                className="bg-white rounded-3xl p-6 border border-amber-100 shadow-soft hover:shadow-card transition-all space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-lg text-brand-charcoal">
                        {sub.planName}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                        sub.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'Paused'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <p className="text-xs text-brand-green font-semibold flex items-center gap-1">
                      <Store className="w-3.5 h-3.5" />
                      <span>Prepared by {sub.sellerName}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xl font-black text-brand-charcoal">
                      ₹{sub.price}
                    </span>
                    <span className="text-xs text-gray-400 block">
                      Slot: {sub.deliveryTimeSlot}
                    </span>
                  </div>
                </div>

                {/* Date & Destination info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-cream-50/70 p-4 rounded-2xl">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Pass Duration</span>
                    <p className="font-medium text-brand-charcoal">
                      {startDate.toLocaleDateString()} — {endDate.toLocaleDateString()}
                    </p>
                    {isNearExpiry && (
                      <span className="text-[11px] text-amber-700 font-bold block pt-0.5">
                        ⚠️ Expiring soon! Contact cook or renew for next cycle.
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Campus Delivery Spot</span>
                    <p className="font-medium text-gray-700">
                      {sub.deliveryAddress.addressLine1}, {sub.deliveryAddress.city}
                    </p>
                  </div>
                </div>

                {/* Controls (Pause / Resume / Cancel) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    {sub.status === 'Active' && (
                      <button
                        onClick={() => handleStatusChange(sub.id, 'Paused')}
                        className="px-3.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause Deliveries</span>
                      </button>
                    )}

                    {sub.status === 'Paused' && (
                      <button
                        onClick={() => handleStatusChange(sub.id, 'Active')}
                        className="px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Resume Deliveries</span>
                      </button>
                    )}

                    {sub.status !== 'Cancelled' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Cancel this subscription? Future daily deliveries will be stopped.')) {
                            handleStatusChange(sub.id, 'Cancelled');
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cancel Pass
                      </button>
                    )}
                  </div>

                  <span className="text-[11px] text-gray-400">
                    ID: {sub.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-amber-100 shadow-soft space-y-4">
          <Layers className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-brand-charcoal">
            No Active Meal Passes
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You do not currently have any active weekly or monthly meal subscription passes.
          </p>
          <Link
            to="/subscriptions"
            className="px-5 py-2.5 bg-brand-green text-white text-xs font-bold rounded-xl shadow-sm inline-block"
          >
            Explore HomePlate Subscription Passes
          </Link>
        </div>
      )}

    </div>
  );
};
