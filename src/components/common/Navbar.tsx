import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  User, 
  UtensilsCrossed, 
  Sparkles, 
  ShieldCheck, 
  Store, 
  Clock, 
  LogOut,
  Layers,
  HeartHandshake,
  Gift,
  PlusCircle,
  TrendingUp,
  Users,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { totalItemsCount, bill } = useCart();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    setProfileDropdownOpen(false);
    showToast('Signed out successfully.', 'info');
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  // Role-specific navigation links (Requirement 8)
  const customerLinks = [
    { name: 'HomePlate', path: '/homeplate', icon: UtensilsCrossed },
    { name: 'BudgetBite', path: '/budgetbite', icon: Sparkles },
    { name: 'SaveMyMeal', path: '/savemymeal', icon: Clock },
    { name: 'Subscriptions', path: '/subscriptions', icon: Layers },
    { name: 'Impact', path: '/impact', icon: HeartHandshake },
  ];

  const sellerLinks = [
    { name: 'Overview', path: '/seller/dashboard', icon: Store },
    { name: 'Incoming Orders & OTP', path: '/seller/orders', icon: ShoppingBag },
    { name: 'Menu & Stock', path: '/seller/inventory', icon: UtensilsCrossed },
    { name: 'Add New Food', path: '/seller/add-meal', icon: PlusCircle },
  ];

  const adminLinks = [
    { name: 'Overview', path: '/admin/dashboard', icon: ShieldCheck },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Sellers', path: '/admin/sellers', icon: Store },
    { name: 'All Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Food Catalog', path: '/admin/meals', icon: UtensilsCrossed },
    { name: 'Disputes', path: '/admin/complaints', icon: FileText },
  ];

  const activeLinks = role === 'admin' ? adminLinks : role === 'seller' ? sellerLinks : customerLinks;

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-amber-100 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Role Portal Badge */}
          <Link 
            to={role === 'admin' ? '/admin/dashboard' : role === 'seller' ? '/seller/dashboard' : '/'} 
            className="flex items-center gap-2.5 flex-shrink-0 group"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${
              role === 'admin' 
                ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white' 
                : role === 'seller' 
                  ? 'bg-gradient-to-tr from-brand-green to-emerald-600 text-white' 
                  : 'bg-gradient-to-tr from-brand-orange to-amber-500 text-white'
            }`}>
              <span className="text-xl">
                {role === 'admin' ? '🛡️' : role === 'seller' ? '🍳' : '🍲'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-brand-charcoal flex items-center gap-1">
                Meal<span className={role === 'admin' ? 'text-purple-600' : role === 'seller' ? 'text-brand-green' : 'text-brand-orange'}>Mate</span>
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                {role === 'admin' ? 'Admin Portal' : role === 'seller' ? 'Seller Kitchen Portal' : 'Campus Food Tech'}
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar (Customer Portal Only) */}
          {role === 'customer' && (
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search homemade meals, biryani, ₹50-₹80 meals..."
                  className="w-full pl-10 pr-4 py-2 bg-cream-50/90 border border-amber-200/80 rounded-xl text-xs sm:text-sm text-brand-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-all"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-brand-orange text-white text-xs font-semibold rounded-lg hover:bg-brand-orange-hover"
                  >
                    Find
                  </button>
                )}
              </form>
            </div>
          )}

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {activeLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? role === 'admin'
                          ? 'bg-purple-100 text-purple-900 shadow-sm'
                          : role === 'seller'
                            ? 'bg-emerald-100 text-emerald-900 shadow-sm'
                            : 'bg-amber-100 text-brand-charcoal shadow-sm'
                        : 'text-gray-600 hover:text-brand-charcoal hover:bg-cream-100'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Icons (Cart + Loyalty + Profile + Mobile Toggle) */}
          <div className="flex items-center gap-2.5">
            
            {/* 5-Day Loyalty Points Badge - SHOWN ONLY TO CUSTOMERS (Requirement 8A & 8B) */}
            {role === 'customer' && user && (
              <Link
                to="/profile"
                title="5-Day Loyalty Streak & 100 Pts"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-brand-charcoal text-xs font-black transition-all"
              >
                <span>🪙</span>
                <span>{user.rewardPoints || 0} pts</span>
                {(user.rewardPoints || 0) >= 100 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-600 text-white font-extrabold animate-pulse">
                    20% OFF
                  </span>
                )}
              </Link>
            )}

            {/* Cart Icon - Customer Portal Only */}
            {role === 'customer' && (
              <Link
                to="/cart"
                className="relative flex items-center gap-2 bg-cream-100 hover:bg-cream-200 text-brand-charcoal px-3 py-2 rounded-xl border border-amber-200 transition-all hover:shadow-sm"
                aria-label="View Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-brand-orange" />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                      {totalItemsCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] text-gray-500 font-medium uppercase leading-none">Cart</span>
                  <span className="text-xs font-extrabold text-brand-charcoal leading-tight">
                    ₹{bill.finalTotal}
                  </span>
                </div>
              </Link>
            )}

            {/* Profile Dropdown / Auth Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-gray-50 hover:bg-cream-100 border border-gray-200 text-brand-charcoal text-xs font-medium transition-all"
                  aria-expanded={profileDropdownOpen}
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-bold text-xs leading-none truncate max-w-[90px]">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className={`text-[10px] font-bold capitalize ${
                      role === 'admin' ? 'text-purple-600' : role === 'seller' ? 'text-brand-green' : 'text-brand-orange'
                    }`}>
                      {role}
                    </span>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-card border border-amber-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-gray-100 bg-cream-50/60 rounded-t-xl">
                      <p className="text-xs font-bold text-brand-charcoal truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        role === 'admin' ? 'bg-purple-100 text-purple-800' : role === 'seller' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Role: {role}
                      </span>
                    </div>

                    {/* Customer Options */}
                    {role === 'customer' && (
                      <div className="py-1 text-xs">
                        <Link to="/profile" className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-cream-100">
                          <div className="flex items-center gap-2.5">
                            <Gift className="w-4 h-4 text-brand-orange" />
                            <span>5-Day Loyalty Hub</span>
                          </div>
                          <span className="font-black text-amber-800 text-xs">🪙 {user.rewardPoints || 0} pts</span>
                        </Link>
                        <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-cream-100">
                          <User className="w-4 h-4 text-gray-400" />
                          My Profile & Food Savings
                        </Link>
                        <Link to="/orders" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-cream-100">
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
                          My Orders & OTP Tracking
                        </Link>
                        <Link to="/saved-addresses" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-cream-100">
                          <Store className="w-4 h-4 text-gray-400" />
                          Delivery Addresses
                        </Link>
                        <Link to="/subscription-manage" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-cream-100">
                          <Layers className="w-4 h-4 text-gray-400" />
                          My Meal Subscriptions
                        </Link>
                      </div>
                    )}

                    {/* Seller Options */}
                    {role === 'seller' && (
                      <div className="py-1 text-xs">
                        <Link to="/seller/dashboard" className="flex items-center gap-2.5 px-4 py-2 text-brand-green font-bold hover:bg-emerald-50">
                          <Store className="w-4 h-4" />
                          Kitchen Dashboard
                        </Link>
                        <Link to="/seller/orders" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-cream-100">
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
                          Orders & OTP Verification
                        </Link>
                        <Link to="/seller/inventory" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-cream-100">
                          <UtensilsCrossed className="w-4 h-4 text-gray-400" />
                          Menu & Inventory
                        </Link>
                        <Link to="/seller/profile" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-cream-100">
                          <User className="w-4 h-4 text-gray-400" />
                          Kitchen Profile
                        </Link>
                      </div>
                    )}

                    {/* Admin Options */}
                    {role === 'admin' && (
                      <div className="py-1 text-xs">
                        <Link to="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2 text-purple-700 font-bold hover:bg-purple-50">
                          <ShieldCheck className="w-4 h-4" />
                          Admin Console
                        </Link>
                        <Link to="/admin/customers" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-cream-100">
                          <Users className="w-4 h-4 text-gray-400" />
                          Manage Customers
                        </Link>
                        <Link to="/admin/sellers" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-cream-100">
                          <Store className="w-4 h-4 text-gray-400" />
                          Manage Sellers
                        </Link>
                        <Link to="/admin/orders" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-cream-100">
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
                          All Orders
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-1 text-xs">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 text-left transition-colors font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-brand-charcoal hover:text-brand-orange transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-extrabold rounded-xl shadow-sm transition-all"
                >
                  Join MealMate
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-brand-charcoal hover:bg-cream-100 rounded-xl transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-100 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
          {role === 'customer' && (
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search meals, combos, thalis..."
                className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal placeholder-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            {activeLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-3 bg-cream-50/80 rounded-xl border border-amber-100 text-brand-charcoal hover:bg-amber-100 transition-colors"
                >
                  <Icon className="w-4 h-4 text-brand-orange" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {user ? (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs">
                <p className="font-bold text-brand-charcoal">{user.name}</p>
                <p className="text-[10px] text-gray-500 capitalize">{role} Account</p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-100 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-bold bg-cream-100 text-brand-charcoal rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-bold bg-brand-orange text-white rounded-xl shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
