import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { 
  CheckCircle2, 
  Printer, 
  ArrowRight, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  User, 
  IndianRupee, 
  Clock, 
  Compass, 
  ShieldCheck,
  Gift,
  Sparkles
} from 'lucide-react';

export const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const order = useMemo(() => StorageService.getOrderById(orderId || ''), [orderId]);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-brand-charcoal">Order Not Found</h2>
        <p className="text-xs text-gray-500">Could not find record for this order ID.</p>
        <Link to="/explore" className="px-5 py-2.5 bg-brand-orange text-white rounded-xl text-xs font-bold inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Success Notification Banner (hidden in print) */}
      <div className="bg-gradient-to-r from-emerald-600 to-brand-green rounded-3xl p-6 sm:p-8 text-white shadow-elevated flex flex-col sm:flex-row items-center justify-between gap-4 no-print animate-in fade-in">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">
              Order Placed Successfully!
            </h1>
            <p className="text-emerald-100 text-xs mt-0.5">
              Order #{order.orderNumber} is confirmed and sent to kitchen partners.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white text-brand-charcoal hover:bg-cream-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-brand-orange" />
            <span>Print Receipt</span>
          </button>
          <Link
            to={`/orders/${order.id}`}
            className="px-4 py-2 bg-brand-charcoal hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Track Order</span>
          </Link>
        </div>
      </div>

      {/* Digital Receipt Card (printable) */}
      <div className="print-receipt-card bg-white rounded-3xl p-6 sm:p-10 border border-amber-200/80 shadow-card space-y-6">
        
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange flex items-center justify-center text-white text-xl font-bold">
              🍲
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-brand-charcoal">
                Meal<span className="text-brand-orange">Mate</span>
              </span>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Official Digital Cash-On-Delivery Receipt
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-black text-brand-charcoal">
              Order ID: <span className="font-mono text-brand-orange">{order.orderNumber}</span>
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Customer & Delivery Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-cream-50/60 p-5 rounded-2xl text-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Customer Details
            </span>
            <p className="font-bold text-brand-charcoal flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-orange" />
              <span>{order.customerName}</span>
            </p>
            <p className="text-gray-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span>{order.customerPhone}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Delivery Destination
            </span>
            <p className="font-semibold text-brand-charcoal flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-green flex-shrink-0 mt-0.5" />
              <span>
                {order.deliveryAddress.addressLine1}, {order.deliveryAddress.addressLine2 && `${order.deliveryAddress.addressLine2}, `}
                {order.deliveryAddress.landmark && `Near ${order.deliveryAddress.landmark}, `}
                {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
              </span>
            </p>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
            Ordered Dishes
          </span>

          <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-cream-100 text-brand-charcoal font-bold flex items-center justify-center text-xs">
                    {item.quantity}x
                  </span>
                  <div>
                    <h4 className="font-bold text-brand-charcoal text-sm">{item.name}</h4>
                    <p className="text-[11px] text-gray-400">
                      Seller: {item.sellerName} • {item.module}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-brand-charcoal text-sm">
                    ₹{item.lineTotal.toFixed(2)}
                  </span>
                  <p className="text-[11px] text-gray-400">
                    ₹{item.price} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Itemized Charges Breakdown */}
        <div className="bg-cream-50 p-5 rounded-2xl space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Item Subtotal</span>
            <span className="font-semibold text-brand-charcoal">₹{order.itemTotal.toFixed(2)}</span>
          </div>

          {order.savingsTotal > 0 && (
            <div className="flex justify-between text-brand-green font-semibold">
              <span>SaveMyMeal Surplus Savings</span>
              <span>−₹{order.savingsTotal.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-semibold text-brand-charcoal">
              {order.deliveryFee === 0 ? 'FREE (₹0.00)' : `₹${order.deliveryFee.toFixed(2)}`}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Platform Fee</span>
            <span className="font-semibold text-brand-charcoal">₹{order.platformFee.toFixed(2)}</span>
          </div>

          {order.couponDiscount > 0 && (
            <div className="flex justify-between text-brand-green font-bold">
              <span>Coupon Discount ({order.couponCode || 'APPLIED'})</span>
              <span>−₹{order.couponDiscount.toFixed(2)}</span>
            </div>
          )}

          {order.rewardDiscount !== undefined && order.rewardDiscount > 0 && (
            <div className="flex justify-between text-purple-700 font-extrabold bg-purple-50 p-2 rounded-xl border border-purple-200">
              <span className="flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-purple-600" />
                <span>Loyalty Reward (100 Pts = 20% OFF Redeemed)</span>
              </span>
              <span>−₹{order.rewardDiscount.toFixed(2)}</span>
            </div>
          )}

          {order.pointsEarned !== undefined && order.pointsEarned > 0 && (
            <div className="flex justify-between text-amber-900 font-bold bg-amber-50 p-2 rounded-xl border border-amber-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>5-Day Milestone Progress</span>
              </span>
              <span>+{order.pointsEarned} Pts Earned for Today!</span>
            </div>
          )}

          <div className="pt-3 border-t-2 border-dashed border-gray-300 flex justify-between items-baseline">
            <span className="text-sm sm:text-base font-extrabold text-brand-charcoal">
              FINAL PAYABLE AMOUNT (COD)
            </span>
            <span className="text-2xl font-black text-brand-charcoal">
              ₹{order.finalTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment & Order Status */}
        <div className="grid grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Payment Status</span>
            <span className="font-bold text-amber-800 text-sm mt-0.5 inline-block">
              {order.paymentStatus} (Cash upon delivery)
            </span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Fulfillment Status</span>
            <span className="font-bold text-emerald-800 text-sm mt-0.5 inline-block">
              {order.orderStatus}
            </span>
          </div>
        </div>

        {/* Print Footer note */}
        <div className="text-[11px] text-gray-400 text-center pt-2">
          Thank you for choosing MealMate! Cash to be collected upon physical receipt of order.
        </div>

      </div>

      {/* Bottom Action Links (hidden in print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print pt-2">
        <Link
          to="/explore"
          className="px-5 py-2.5 rounded-xl border border-amber-200 bg-white hover:bg-cream-50 text-xs font-bold text-brand-charcoal"
        >
          Continue Shopping
        </Link>
        <Link
          to={`/orders/${order.id}`}
          className="px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold shadow-sm"
        >
          View Live Order Timeline →
        </Link>
      </div>

    </div>
  );
};
