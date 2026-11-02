import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import type { Order, OrderStatus, PaymentStatus } from '../../types';
import { ShoppingBag, ArrowLeft, Search, CheckCircle2, XCircle, Clock, MapPin, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManageOrders: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'All' && o.orderStatus !== statusFilter) return false;
    if (search.trim()) {
      return (
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerPhone.includes(search)
      );
    }
    return true;
  });

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const paymentStatus: PaymentStatus | undefined = newStatus === 'Delivered' ? 'Paid' : undefined;
    const updated = StorageService.updateOrderStatus(orderId, newStatus, paymentStatus);
    if (updated) {
      setOrders(StorageService.getOrders());
      showToast(`Order status updated to "${newStatus}"`, 'success');
    }
  };

  const handleTogglePayment = (orderId: string, current: PaymentStatus) => {
    const newPayment: PaymentStatus = current === 'Paid' ? 'Pending' : 'Paid';
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const updated = StorageService.updateOrderStatus(orderId, order.orderStatus, newPayment);
      if (updated) {
        setOrders(StorageService.getOrders());
        showToast(`Payment status updated to "${newPayment}"`, 'info');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <Link
            to="/admin/dashboard"
            className="text-xs font-bold text-gray-500 hover:text-brand-orange flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-brand-orange" />
            <span>Master Orders Management ({orders.length})</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time delivery progress monitoring and Cash-on-Delivery collection audits.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, phone..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-brand-charcoal"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {(['All', 'Order Placed', 'Order Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === tab
                ? 'bg-brand-charcoal text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-cream-100 border border-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Master Orders Table */}
      <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50 text-gray-500 font-bold uppercase border-y border-gray-100">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">COD Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-charcoal">
                    {order.orderNumber}
                    <span className="block text-[10px] text-gray-400 font-normal">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-brand-charcoal block">{order.customerName}</span>
                    <span className="text-[10px] text-gray-400">{order.customerPhone}</span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="truncate text-gray-700">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-brand-charcoal">
                    ₹{order.finalTotal.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleTogglePayment(order.id, order.paymentStatus)}
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] cursor-pointer transition-colors ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                      title="Click to toggle payment collected status"
                    >
                      COD {order.paymentStatus}
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                      className="p-1 bg-cream-50 border border-amber-200 rounded-lg text-xs font-semibold text-brand-charcoal"
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Order Confirmed">Order Confirmed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready for Pickup">Ready for Pickup</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/orders/${order.id}`}
                      className="px-2.5 py-1 bg-cream-100 hover:bg-cream-200 text-brand-charcoal rounded-lg font-bold inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Details</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
