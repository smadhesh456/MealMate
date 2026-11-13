import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StorageService } from '../services/storage';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ShoppingBag, 
  Layers, 
  Save, 
  ArrowRight,
  Store,
  Gift,
  Sparkles,
  TrendingDown,
  Leaf,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { RewardsService } from '../services/rewards';

export const Profile: React.FC = () => {
  const { user, role, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [rewardStatus, setRewardStatus] = useState(() => RewardsService.getRewardStatus(user?.id));

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);

  // Search & filter state for Food Savings History (Requirement 6)
  const [savingsSearch, setSavingsSearch] = useState('');
  const [savingsCategoryFilter, setSavingsCategoryFilter] = useState('All');

  // Load verified Food Savings Impact (only successfully DELIVERED orders count!)
  const savingsImpact = useMemo(() => {
    return StorageService.getFoodSavingsImpact(user?.id);
  }, [user?.id]);

  const filteredSavingsHistory = useMemo(() => {
    return savingsImpact.savingsHistory.filter(item => {
      if (savingsSearch.trim()) {
        const q = savingsSearch.toLowerCase();
        const matchesName = item.foodName.toLowerCase().includes(q);
        const matchesSeller = item.sellerName.toLowerCase().includes(q);
        const matchesOrder = item.orderNumber.toLowerCase().includes(q);
        if (!matchesName && !matchesSeller && !matchesOrder) return false;
      }
      if (savingsCategoryFilter !== 'All' && item.category !== savingsCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [savingsImpact.savingsHistory, savingsSearch, savingsCategoryFilter]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      showToast('Please provide name, email, and phone number.', 'warning');
      return;
    }

    updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });

    setIsEditing(false);
    showToast('Profile information updated successfully!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-400 text-white flex items-center justify-center text-2xl font-black shadow-md overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-brand-charcoal">
                {user?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 capitalize">
                {role}
              </span>
            </div>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-500">{user?.phone}</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-brand-charcoal text-xs font-bold rounded-xl border border-amber-200 transition-colors"
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-amber-200 shadow-soft space-y-4 animate-in fade-in">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal">
            Update Personal Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs font-medium text-brand-charcoal"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs font-medium text-brand-charcoal"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs font-medium text-brand-charcoal"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-orange text-white text-xs font-bold rounded-xl shadow-sm hover:bg-brand-orange-hover flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </form>
      )}

      {/* ======================================================== */}
      {/* SECTION 6: MY FOOD SAVINGS & IMPACT (Requirement 6) */}
      {/* ======================================================== */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-600 text-white flex items-center justify-center font-bold shadow-md">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-brand-charcoal flex items-center gap-2">
                <span>My Food Savings & Impact</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  Verified Delivered Orders Only
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Track how much food, money, and campus kitchen waste you have rescued through MealMate.
              </p>
            </div>
          </div>

          <Link
            to="/savemymeal"
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-extrabold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Rescue More Meals</span>
          </Link>
        </div>

        {/* Impact Summary Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Money Saved</span>
            <span className="text-xl font-black text-rose-700 mt-1 block">
              ₹{savingsImpact.totalMoneySaved}
            </span>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Meals Rescued</span>
            <span className="text-xl font-black text-amber-700 mt-1 block">
              {savingsImpact.totalMealsRescued}
            </span>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Waste Diverted</span>
            <span className="text-xl font-black text-emerald-700 mt-1 block">
              {savingsImpact.estimatedWasteDivertedKg} kg
            </span>
          </div>

          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">CO2 Saved</span>
            <span className="text-xl font-black text-blue-700 mt-1 block">
              {savingsImpact.estimatedCo2ReducedKg} kg
            </span>
          </div>

          <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Surplus Items</span>
            <span className="text-xl font-black text-purple-700 mt-1 block">
              {savingsImpact.totalItemsPurchased}
            </span>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Orders Completed</span>
            <span className="text-xl font-black text-brand-charcoal mt-1 block">
              {savingsImpact.totalCompletedOrders}
            </span>
          </div>
        </div>

        {/* Food History List & Controls (Requirement 6) */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal">
              Rescued Food History ({filteredSavingsHistory.length})
            </h3>

            {/* Search Food History */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={savingsSearch}
                onChange={(e) => setSavingsSearch(e.target.value)}
                placeholder="Search dish or kitchen..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-cream-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-orange"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {filteredSavingsHistory.length > 0 ? (
            <div className="space-y-3">
              {filteredSavingsHistory.map(item => (
                <div
                  key={item.id}
                  className="p-4 bg-cream-50/50 rounded-2xl border border-amber-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-cream-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.foodName}
                      className="w-14 h-14 rounded-xl object-cover border border-amber-200/60 flex-shrink-0"
                    />
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-extrabold text-brand-charcoal">{item.foodName}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Store className="w-3 h-3 text-gray-400" />
                        <span>{item.sellerName}</span>
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.date}
                        </span>
                        <span>•</span>
                        <span>Order ID: #{item.orderNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="text-right">
                      <div className="text-xs text-gray-400 line-through">
                        Original: ₹{item.originalPrice * item.quantity}
                      </div>
                      <div className="text-sm font-extrabold text-brand-charcoal">
                        Purchased: ₹{item.purchasedPrice * item.quantity}
                      </div>
                      <div className="text-xs font-black text-emerald-600">
                        Money Saved: ₹{item.moneySaved}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Delivered
                      </span>
                      <Link
                        to={`/orders/${item.orderId}`}
                        className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-0.5"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs font-bold text-gray-500">
                {savingsSearch ? 'No rescued meals match your search.' : 'You haven\'t purchased any SaveMyMeal surplus food yet.'}
              </p>
              <Link
                to="/savemymeal"
                className="inline-block mt-2 text-xs font-bold text-brand-orange hover:underline"
              >
                Browse active SaveMyMeal offers now →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 5-Day Loyalty Streak & 100 Reward Points Hub */}
      <div className="bg-gradient-to-br from-amber-500/10 via-purple-50 to-orange-50 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-brand-orange text-white flex items-center justify-center font-black shadow-md text-xl">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-brand-charcoal">
                  5-Day Loyalty Streak & 100 Points Hub
                </h2>
                {rewardStatus.canRedeem && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-600 text-white animate-pulse">
                    20% OFF READY
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Earn 20 points per order day. Reach 100 points across 5 days to unlock 20% OFF on your next food subtotal!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="p-3 bg-white rounded-2xl border border-amber-200 text-right shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Points</span>
              <span className="text-xl font-black text-brand-orange">🪙 {rewardStatus.points} Pts</span>
            </div>
          </div>
        </div>

        {/* 5-Day Milestone Step Tracker */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-brand-charcoal">
              Milestone Progress: {rewardStatus.daysCount} of 5 Unique Order Days
            </span>
            <span className={rewardStatus.canRedeem ? 'text-purple-700 font-extrabold' : 'text-gray-500'}>
              {rewardStatus.canRedeem ? '🎉 100 Points Milestone Reached!' : `${rewardStatus.daysRemaining} more day${rewardStatus.daysRemaining > 1 ? 's' : ''} needed`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
            {[1, 2, 3, 4, 5].map((d) => {
              const isCompleted = d <= rewardStatus.daysCount;
              const dateStr = rewardStatus.orderDates[d - 1];
              return (
                <div
                  key={d}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isCompleted
                      ? 'bg-amber-400 border-amber-500 text-white shadow-sm'
                      : 'bg-white/80 border-gray-200 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-black">
                    <span>Day {d}</span>
                    <span>{isCompleted ? '✓' : ''}</span>
                  </div>
                  <span className="block text-sm font-black mt-1">
                    {isCompleted ? '+20 Pts' : '20 Pts'}
                  </span>
                  <span className="block text-[9px] mt-0.5 truncate opacity-90">
                    {dateStr ? dateStr : `Order Day ${d}`}
                  </span>
                </div>
              );
            })}

            {/* 20% Offer Card */}
            <div
              className={`p-3 rounded-2xl border text-center transition-all ${
                rewardStatus.canRedeem
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-700 text-white shadow-md'
                  : 'bg-white/80 border-gray-200 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-black">
                <span>Reward</span>
                <span>🎁</span>
              </div>
              <span className="block text-sm font-black mt-1">
                20% OFF
              </span>
              <span className="block text-[9px] mt-0.5 truncate opacity-90">
                {rewardStatus.canRedeem ? 'Ready in Cart!' : 'Uses 100 Pts'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Callout & Quick Link */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <p className="font-bold text-brand-charcoal">
              {rewardStatus.statusText}
            </p>
            <p className="text-[11px] text-gray-500">
              Orders placed on unique calendar days count toward advancing the 5-day streak.
            </p>
          </div>

          <Link
            to="/cart"
            className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-extrabold rounded-xl shadow-sm text-xs flex items-center gap-1.5 flex-shrink-0 transition-all"
          >
            <span>Go to Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
};
