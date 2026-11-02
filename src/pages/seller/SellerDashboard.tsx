import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { 
  Store, 
  ShoppingBag, 
  Plus, 
  UtensilsCrossed, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Clock, 
  Layers,
  ArrowRight,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const allMeals = StorageService.getMeals();
  const allOrders = StorageService.getOrders();

  // Get current seller's listings (fallback to seller-1 if generic)
  const sellerId = user?.id?.startsWith('seller') ? user.id : 'seller-1';
  const sellerMeals = useMemo(() => {
    return allMeals.filter(m => m.sellerId === sellerId || m.sellerName.toLowerCase().includes(user?.businessName?.toLowerCase() || 'annapoorna'));
  }, [allMeals, sellerId, user]);

  // Seller orders
  const sellerOrders = useMemo(() => {
    return allOrders.filter(o => o.items.some(i => i.sellerId === sellerId || sellerMeals.some(sm => sm.id === i.foodId)));
  }, [allOrders, sellerId, sellerMeals]);

  const pendingOrders = sellerOrders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled');
  const deliveredOrders = sellerOrders.filter(o => o.orderStatus === 'Delivered');

  const totalRevenue = deliveredOrders.reduce((sum, o) => {
    // Sum only items belonging to this seller
    const sellerItemSum = o.items
      .filter(i => i.sellerId === sellerId || sellerMeals.some(sm => sm.id === i.foodId))
      .reduce((sub, item) => sub + item.lineTotal, 0);
    return sum + sellerItemSum;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-green to-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
            <Store className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-brand-charcoal">
                {user?.businessName || 'Annapoorna Home Kitchen'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Verified Kitchen
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Chef {user?.name || 'Annapoorna Devi'} • {user?.businessAddress || '14, Gandhi Nagar, Campus Gate 2'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/seller/add-meal"
            className="px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </Link>
          <Link
            to="/seller/orders"
            className="px-4 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Manage Orders ({pendingOrders.length})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase">
            <span>Active Listings</span>
            <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-brand-charcoal">{sellerMeals.length}</p>
          <span className="text-[11px] text-emerald-700 font-medium">In menu catalogue</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase">
            <span>Pending Orders</span>
            <Clock className="w-4 h-4 text-brand-orange" />
          </div>
          <p className="text-3xl font-black text-brand-orange">{pendingOrders.length}</p>
          <span className="text-[11px] text-gray-500 font-medium">Requiring fulfillment</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-blue-100 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase">
            <span>Completed Orders</span>
            <PackageCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-blue-800">{deliveredOrders.length}</p>
          <span className="text-[11px] text-gray-500 font-medium">Delivered & verified</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase">
            <span>Recorded Revenue</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-purple-900">₹{totalRevenue.toFixed(0)}</p>
          <span className="text-[11px] text-emerald-700 font-semibold">100% COD Payout</span>
        </div>

      </div>

      {/* Operational Hub Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/seller/inventory"
          className="bg-cream-100 hover:bg-cream-200 p-5 rounded-2xl border border-amber-200/80 transition-all space-y-2 block"
        >
          <span className="text-xs font-bold text-brand-charcoal flex items-center justify-between">
            <span>Real-time Stock Inventory</span>
            <ArrowRight className="w-4 h-4 text-brand-orange" />
          </span>
          <p className="text-xs text-gray-500">
            Adjust available portions or pause sold-out dishes instantly.
          </p>
        </Link>

        <Link
          to="/seller/orders"
          className="bg-cream-100 hover:bg-cream-200 p-5 rounded-2xl border border-amber-200/80 transition-all space-y-2 block"
        >
          <span className="text-xs font-bold text-brand-charcoal flex items-center justify-between">
            <span>Incoming Kitchen Orders</span>
            <ArrowRight className="w-4 h-4 text-brand-orange" />
          </span>
          <p className="text-xs text-gray-500">
            Advance order status: Confirmed → Preparing → Ready for Pickup.
          </p>
        </Link>

        <Link
          to="/seller/profile"
          className="bg-cream-100 hover:bg-cream-200 p-5 rounded-2xl border border-amber-200/80 transition-all space-y-2 block"
        >
          <span className="text-xs font-bold text-brand-charcoal flex items-center justify-between">
            <span>Kitchen Business Profile</span>
            <ArrowRight className="w-4 h-4 text-brand-orange" />
          </span>
          <p className="text-xs text-gray-500">
            Edit business contact, operating hours, and service radius.
          </p>
        </Link>
      </div>

      {/* Seller's Food Menu Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-soft space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-brand-charcoal">
              Your Menu Listings ({sellerMeals.length})
            </h2>
            <p className="text-xs text-gray-400">
              Dishes registered under your kitchen account
            </p>
          </div>

          <Link
            to="/seller/add-meal"
            className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Dish</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50 text-gray-500 font-bold uppercase border-y border-gray-100">
              <tr>
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sellerMeals.map(meal => (
                <tr key={meal.id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={meal.image} alt={meal.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <span className="font-bold text-brand-charcoal block">{meal.name}</span>
                        <span className="text-[10px] text-gray-400">★ {meal.rating.toFixed(1)} ({meal.reviewCount})</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-700">{meal.module}</td>
                  <td className="py-3.5 px-4 text-gray-500">{meal.category}</td>
                  <td className="py-3.5 px-4 font-bold text-brand-charcoal">
                    ₹{meal.price}
                    {meal.originalPrice && (
                      <span className="text-[10px] text-gray-400 line-through ml-1">₹{meal.originalPrice}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-700">{meal.stockQuantity}</td>
                  <td className="py-3.5 px-4">
                    {meal.isAvailable && meal.stockQuantity > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        In Stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        Sold Out
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/seller/edit-meal/${meal.id}`}
                      className="px-3 py-1 bg-cream-100 hover:bg-cream-200 text-brand-charcoal rounded-lg font-bold inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
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
