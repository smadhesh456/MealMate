import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { OrderTimeline } from '../components/common/OrderTimeline';
import { useToast } from '../context/ToastContext';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare,
  Compass,
  Gift,
  Sparkles
} from 'lucide-react';
import type { Order } from '../types';

export const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | undefined>(() => {
    return StorageService.getOrderById(orderId || '');
  });
  const { showToast } = useToast();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-brand-charcoal">Order Not Found</h2>
        <p className="text-xs text-gray-500">Could not locate order #{orderId}.</p>
        <Link to="/orders" className="px-5 py-2.5 bg-brand-orange text-white rounded-xl text-xs font-bold inline-block">
          View All Orders
        </Link>
      </div>
    );
  }

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      showToast('Please provide a reason for cancellation', 'warning');
      return;
    }

    const updated = StorageService.updateOrderStatus(order.id, 'Cancelled', undefined, cancelReason);
    if (updated) {
      setOrder({ ...updated });
      setShowCancelModal(false);
      showToast('Order has been cancelled.', 'info');
    }
  };

  const handleFileComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDesc.trim()) {
      showToast('Please fill all complaint fields', 'warning');
      return;
    }

    StorageService.addComplaint({
      id: `comp-${Date.now()}`,
      orderId: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customerName,
      customerEmail: 'rahul.student@college.edu',
      subject: complaintSubject.trim(),
      description: complaintDesc.trim(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    });

    setShowComplaintModal(false);
    setComplaintSubject('');
    setComplaintDesc('');
    showToast('Complaint submitted to campus admin support.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-orange"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/order-confirmation/${order.id}`}
            className="px-3 py-1.5 rounded-xl border border-amber-200 bg-white hover:bg-cream-50 text-xs font-bold text-brand-charcoal flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-brand-orange" />
            <span>Digital Receipt</span>
          </Link>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-card space-y-6">
        
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-brand-charcoal">
                Order #{order.orderNumber}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-brand-charcoal text-white">
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xl font-black text-brand-charcoal">
              ₹{order.finalTotal.toFixed(2)}
            </span>
            <p className="text-xs text-gray-500">
              COD Payment: <strong className={order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}>{order.paymentStatus}</strong>
            </p>
          </div>
        </div>

        {/* Manual Order Tracking Timeline */}
        <div className="py-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-brand-green" />
            <span>Live Order Progress Timeline</span>
          </h2>
          <OrderTimeline
            currentStatus={order.orderStatus}
            statusTimestamps={order.statusTimestamps}
            cancellationReason={order.cancellationReason}
          />
        </div>

        {/* Ordered Dishes List */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
            Items in this order
          </span>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-cream-100 font-bold flex items-center justify-center text-brand-charcoal">
                    {item.quantity}x
                  </span>
                  <div>
                    <h4 className="font-bold text-brand-charcoal text-sm">{item.name}</h4>
                    <p className="text-[11px] text-gray-400">Cook: {item.sellerName} • {item.module}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-brand-charcoal">
                    ₹{item.lineTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Itemized Bill & Rewards Summary */}
          <div className="p-4 bg-cream-50 rounded-2xl border border-amber-100 space-y-2 text-xs text-gray-600">
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
              <span>{order.deliveryFee === 0 ? 'FREE (₹0.00)' : `₹${order.deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span>₹{order.platformFee.toFixed(2)}</span>
            </div>
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-brand-green font-bold">
                <span>Coupon Discount ({order.couponCode || 'APPLIED'})</span>
                <span>−₹{order.couponDiscount.toFixed(2)}</span>
              </div>
            )}
            {order.rewardDiscount !== undefined && order.rewardDiscount > 0 && (
              <div className="flex justify-between text-purple-700 font-extrabold bg-purple-100/70 p-2 rounded-xl border border-purple-200">
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-purple-600" />
                  <span>Loyalty Reward (100 Pts = 20% OFF Redeemed)</span>
                </span>
                <span>−₹{order.rewardDiscount.toFixed(2)}</span>
              </div>
            )}
            {order.pointsEarned !== undefined && order.pointsEarned > 0 && (
              <div className="flex justify-between text-amber-900 font-bold bg-amber-100/70 p-2 rounded-xl border border-amber-200">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>5-Day Milestone Progress</span>
                </span>
                <span>+{order.pointsEarned} Pts Earned for this Order Date</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline font-bold">
              <span className="text-brand-charcoal">Total Amount (COD)</span>
              <span className="text-base text-brand-charcoal font-black">₹{order.finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="bg-cream-50/70 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold text-gray-400 uppercase text-[10px] block mb-1">
              Customer Contact
            </span>
            <p className="font-bold text-brand-charcoal">{order.customerName}</p>
            <p className="text-gray-600">{order.customerPhone}</p>
          </div>

          <div>
            <span className="font-bold text-gray-400 uppercase text-[10px] block mb-1">
              Delivery Address
            </span>
            <p className="text-gray-700">
              {order.deliveryAddress.addressLine1}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
            </p>
          </div>
        </div>

        {/* Actions Row */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            {order.orderStatus === 'Order Placed' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>

          <button
            onClick={() => setShowComplaintModal(true)}
            className="text-xs font-semibold text-gray-500 hover:text-brand-orange flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Need Help or File a Complaint?</span>
          </button>
        </div>

      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-card space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-brand-charcoal">
              Confirm Order Cancellation
            </h3>
            <p className="text-xs text-gray-500">
              Please let us know why you wish to cancel this order:
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Placed duplicate order, changed mind..."
              className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-card space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-brand-charcoal">
              File a Complaint for #{order.orderNumber}
            </h3>
            <form onSubmit={handleFileComplaint} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Subject</label>
                <input
                  type="text"
                  value={complaintSubject}
                  onChange={(e) => setComplaintSubject(e.target.value)}
                  placeholder="e.g. Food was cold, missing item..."
                  className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Details</label>
                <textarea
                  rows={3}
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  placeholder="Describe what went wrong so campus administrators can assist..."
                  className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-hover rounded-xl"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
