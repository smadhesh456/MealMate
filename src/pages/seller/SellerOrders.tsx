import React, { useState, useMemo } from 'react';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Order, OrderStatus, PaymentStatus } from '../../types';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  XCircle, 
  ChefHat, 
  Bike, 
  IndianRupee,
  ArrowRight,
  Filter,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SellerOrders: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Delivered' | 'Cancelled'>('All');
  
  // OTP Verification input state mapped by orderId
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [verifyingOrder, setVerifyingOrder] = useState<string | null>(null);

  const sellerOrders = useMemo(() => {
    return orders.filter(order => {
      if (statusFilter === 'Pending') {
        return order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Rejected';
      }
      if (statusFilter === 'Delivered') return order.orderStatus === 'Delivered';
      if (statusFilter === 'Cancelled') return order.orderStatus === 'Cancelled' || order.orderStatus === 'Rejected';
      return true;
    });
  }, [orders, statusFilter]);

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus;
    if (currentStatus === 'Order Placed') nextStatus = 'Order Confirmed';
    else if (currentStatus === 'Order Confirmed') nextStatus = 'Preparing';
    else if (currentStatus === 'Preparing') nextStatus = 'Ready for Pickup';
    else if (currentStatus === 'Ready for Pickup') nextStatus = 'Out for Delivery';
    else return;

    const updated = StorageService.updateOrderStatus(orderId, nextStatus);
    if (updated) {
      setOrders(StorageService.getOrders());
      showToast(`Order status updated to "${nextStatus}".`, 'success');
    }
  };

  // OTP Verification for Out for Delivery -> Delivered (Requirement 7)
  const handleVerifyOtp = (orderId: string) => {
    const enteredOtp = otpInputs[orderId] || '';
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      showToast('Please enter the 6-digit delivery OTP given by the customer.', 'warning');
      return;
    }

    setVerifyingOrder(orderId);
    const result = StorageService.verifyDeliveryOtp(orderId, enteredOtp);

    if (result.success) {
      setOrders(StorageService.getOrders());
      showToast(result.message, 'success');
      // Clear input
      setOtpInputs(prev => ({ ...prev, [orderId]: '' }));
    } else {
      showToast(result.message, 'error');
    }
    setVerifyingOrder(null);
  };

  const handleCancelOrder = (orderId: string) => {
    const reason = prompt('Please enter rejection/cancellation reason for the customer:');
    if (reason && reason.trim()) {
      const updated = StorageService.updateOrderStatus(orderId, 'Rejected', undefined, reason.trim());
      if (updated) {
        setOrders(StorageService.getOrders());
        showToast('Order rejected. Food inventory restored.', 'info');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-brand-green" />
            <span>Kitchen Order Management & Delivery Verification</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Accept orders, transition kitchen stages, verify customer delivery OTPs, and confirm Cash on Delivery.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-amber-100 shadow-sm text-xs">
          {(['All', 'Pending', 'Delivered', 'Cancelled'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === tab
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'text-gray-500 hover:text-brand-charcoal'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {sellerOrders.length > 0 ? (
        <div className="space-y-6">
          {sellerOrders.map(order => {
            const isTerminal = order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled' || order.orderStatus === 'Rejected';
            const isOutForDelivery = order.orderStatus === 'Out for Delivery';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-amber-100 shadow-soft space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-brand-charcoal">
                        Order #{order.orderNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'Out for Delivery'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : 'bg-brand-charcoal text-white'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xl font-black text-brand-charcoal">
                      ₹{order.finalTotal.toFixed(2)}
                    </span>
                    <p className="text-xs text-gray-500">
                      Payment: <strong className={order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}>COD ({order.paymentStatus})</strong>
                    </p>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Dishes in this Order:
                  </span>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl p-2 bg-cream-50/50">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-2 px-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-brand-orange w-5">{item.quantity}x</span>
                          <span className="font-bold text-brand-charcoal">{item.name}</span>
                          <span className="text-[10px] text-gray-400">({item.module})</span>
                        </div>
                        <span className="font-bold text-gray-700">₹{item.lineTotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Details & Campus Drop-off */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-cream-50 p-4 rounded-2xl">
                  <div className="space-y-1">
                    <span className="font-bold text-gray-400 uppercase text-[10px] block">Customer Contact</span>
                    <p className="font-bold text-brand-charcoal flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-orange" />
                      <span>{order.customerName}</span>
                    </p>
                    <p className="text-gray-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{order.customerPhone}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-gray-400 uppercase text-[10px] block">Delivery Location</span>
                    <p className="text-gray-700 flex items-start gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-brand-green flex-shrink-0 mt-0.5" />
                      <span>{order.deliveryAddress.addressLine1}, {order.deliveryAddress.city}</span>
                    </p>
                  </div>
                </div>

                {/* OTP Verification UI for Out for Delivery Stage (Strict Requirement 7) */}
                {isOutForDelivery && (
                  <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                      <KeyRound className="w-4 h-4 text-brand-orange" />
                      <span>Mandatory Customer OTP Verification</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Ask the customer for their unique 6-digit delivery OTP shown on their screen, collect cash payment, and verify below to complete delivery:
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={otpInputs[order.id] || ''}
                        onChange={(e) => setOtpInputs({ ...otpInputs, [order.id]: e.target.value.replace(/\D/g, '') })}
                        className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-xs font-black tracking-widest text-center text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange w-full sm:w-48"
                      />
                      <button
                        onClick={() => handleVerifyOtp(order.id)}
                        disabled={verifyingOrder === order.id}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify OTP & Mark Delivered</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons: Status Advancement */}
                {!isTerminal ? (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Reject Order
                    </button>

                    {!isOutForDelivery && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdvanceStatus(order.id, order.orderStatus)}
                          className="px-5 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-2 transition-all hover:scale-102"
                        >
                          {order.orderStatus === 'Order Placed' && <span>Confirm Order</span>}
                          {order.orderStatus === 'Order Confirmed' && <span>Mark as Preparing</span>}
                          {order.orderStatus === 'Preparing' && <span>Mark Ready for Pickup</span>}
                          {order.orderStatus === 'Ready for Pickup' && <span>Dispatch (Out for Delivery)</span>}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 text-right">
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-xl ${
                      order.orderStatus === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.orderStatus === 'Delivered' ? '✓ Order Fulfilled via OTP & Cash Collected' : `✕ Order ${order.orderStatus}`}
                    </span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-amber-100 shadow-soft">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-brand-charcoal">No Orders for this Filter</h3>
        </div>
      )}

    </div>
  );
};
