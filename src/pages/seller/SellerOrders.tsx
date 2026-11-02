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
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SellerOrders: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Delivered' | 'Cancelled'>('All');

  // Filter orders related to this seller
  const sellerId = user?.id?.startsWith('seller') ? user.id : 'seller-1';

  const sellerOrders = useMemo(() => {
    return orders.filter(order => {
      // In demo mode allow seller to manage all sample orders or ones with matching seller items
      if (statusFilter === 'Pending') {
        return order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled';
      }
      if (statusFilter === 'Delivered') return order.orderStatus === 'Delivered';
      if (statusFilter === 'Cancelled') return order.orderStatus === 'Cancelled';
      return true;
    });
  }, [orders, statusFilter]);

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus;
    if (currentStatus === 'Order Placed') nextStatus = 'Order Confirmed';
    else if (currentStatus === 'Order Confirmed') nextStatus = 'Preparing';
    else if (currentStatus === 'Preparing') nextStatus = 'Ready for Pickup';
    else if (currentStatus === 'Ready for Pickup') nextStatus = 'Out for Delivery';
    else if (currentStatus === 'Out for Delivery') nextStatus = 'Delivered';
    else return;

    // If marked Delivered, allow confirming COD payment
    const paymentStatus: PaymentStatus | undefined = nextStatus === 'Delivered' ? 'Paid' : undefined;

    const updated = StorageService.updateOrderStatus(orderId, nextStatus, paymentStatus);
    if (updated) {
      setOrders(StorageService.getOrders());
      showToast(`Order status updated to "${nextStatus}"${nextStatus === 'Delivered' ? ' (COD marked Paid)' : ''}`, 'success');
    }
  };

  const handleCancelOrder = (orderId: string) => {
    const reason = prompt('Please enter cancellation reason for the customer:');
    if (reason) {
      const updated = StorageService.updateOrderStatus(orderId, 'Cancelled', undefined, reason);
      if (updated) {
        setOrders(StorageService.getOrders());
        showToast('Order marked as Cancelled', 'info');
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
            <span>Kitchen Order Management</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Accept orders, transition kitchen prep stages, and confirm cash collection upon delivery.
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
            const isTerminal = order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled';

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
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-brand-charcoal text-white">
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Received at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xl font-black text-brand-charcoal">
                      ₹{order.finalTotal.toFixed(2)}
                    </span>
                    <p className="text-xs text-gray-500">
                      Payment: <strong className={order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}>COD {order.paymentStatus}</strong>
                    </p>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Dishes to Prepare:
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

                {/* Action Buttons: Status Advancement */}
                {!isTerminal ? (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Reject / Cancel
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdvanceStatus(order.id, order.orderStatus)}
                        className="px-5 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-2 transition-all hover:scale-102"
                      >
                        {order.orderStatus === 'Order Placed' && <span>Confirm Order</span>}
                        {order.orderStatus === 'Order Confirmed' && <span>Mark as Preparing</span>}
                        {order.orderStatus === 'Preparing' && <span>Mark Ready for Pickup</span>}
                        {order.orderStatus === 'Ready for Pickup' && <span>Dispatch (Out for Delivery)</span>}
                        {order.orderStatus === 'Out for Delivery' && <span>Mark Delivered & Collect COD</span>}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 text-right">
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-xl ${
                      order.orderStatus === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.orderStatus === 'Delivered' ? '✓ Order Fulfilled & Paid' : '✕ Order Cancelled'}
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
