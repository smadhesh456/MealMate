import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  Truck
} from 'lucide-react';
import type { OrderStatus } from '../types';

export const MyOrders: React.FC = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Delivered' | 'Cancelled'>('All');

  const allOrders = useMemo(() => StorageService.getOrders(), []);

  // Filter for current customer or demo
  const customerOrders = useMemo(() => {
    return allOrders.filter(o => {
      // In demo mode show all or match user
      if (statusFilter === 'All') return true;
      if (statusFilter === 'Delivered') return o.orderStatus === 'Delivered';
      if (statusFilter === 'Cancelled') return o.orderStatus === 'Cancelled';
      if (statusFilter === 'Active') {
        return o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled';
      }
      return true;
    });
  }, [allOrders, statusFilter]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">Delivered</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-bold">Cancelled</span>;
      case 'Out for Delivery':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-bold animate-pulse">Out for Delivery</span>;
      case 'Preparing':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold">In Kitchen</span>;
      default:
        return <span className="px-2.5 py-1 bg-cream-200 text-brand-charcoal rounded-lg text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-brand-orange" />
            <span>My Orders & Order History</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track active deliveries and review previous meal receipts.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-amber-100 shadow-sm text-xs">
          {(['All', 'Active', 'Delivered', 'Cancelled'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === tab
                  ? 'bg-brand-charcoal text-white shadow-sm'
                  : 'text-gray-500 hover:text-brand-charcoal'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {customerOrders.length > 0 ? (
        <div className="space-y-4">
          {customerOrders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-6 border border-amber-100 shadow-soft hover:shadow-card transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-brand-charcoal text-base">
                      Order #{order.orderNumber}
                    </span>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-lg font-black text-brand-charcoal">
                    ₹{order.finalTotal.toFixed(2)}
                  </span>
                  <p className="text-[10px] text-gray-500">
                    COD: <strong className={order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}>{order.paymentStatus}</strong>
                  </p>
                </div>
              </div>

              {/* Items summary */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {order.items.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cream-50 rounded-lg border border-amber-100 text-gray-700 font-medium"
                  >
                    <span className="font-bold text-brand-orange">{item.quantity}x</span>
                    <span>{item.name}</span>
                  </span>
                ))}
              </div>

              {/* Destination & Action */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5 truncate max-w-md">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{order.deliveryAddress.addressLine1}, {order.deliveryAddress.city}</span>
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/orders/${order.id}`}
                    className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Track Order Timeline</span>
                  </Link>
                  <Link
                    to={`/order-confirmation/${order.id}`}
                    className="px-3 py-2 bg-cream-100 hover:bg-cream-200 text-brand-charcoal rounded-xl text-xs font-bold border border-amber-200"
                  >
                    View Receipt
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-amber-100 shadow-soft space-y-4">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-brand-charcoal">
            No Orders Found
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You don't have any orders matching the "{statusFilter}" filter.
          </p>
          <Link
            to="/explore"
            className="px-5 py-2.5 bg-brand-orange text-white text-xs font-bold rounded-xl shadow-sm inline-block"
          >
            Explore Catalogue & Place an Order
          </Link>
        </div>
      )}

    </div>
  );
};
