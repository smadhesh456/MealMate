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
  Gift
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
    showToast('You have been signed out successfully', 'info');
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

  const navLinks = [
    { name: 'HomePlate', path: '/homeplate', tag: 'Homemade', icon: UtensilsCrossed, color: 'text-emerald-700 hover:text-emerald-800' },
    { name: 'BudgetBite', path: '/budgetbite', tag: 'Under ₹100', icon: Sparkles, color: 'text-amber-700 hover:text-amber-800' },
    { name: 'SaveMyMeal', path: '/savemymeal', tag: 'Surplus Deals', icon: Clock, color: 'text-rose-700 hover:text-rose-800' },
    { name: 'Subscriptions', path: '/subscriptions', tag: 'Meal Pass', icon: Layers, color: 'text-purple-700 hover:text-purple-800' },
    { name: 'Impact', path: '/impact', tag: 'Save Food', icon: HeartHandshake, color: 'text-emerald-600 hover:text-emerald-700' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100/80 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-xl">🍲</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-brand-charcoal flex items-center gap-1">
                Meal<span className="text-brand-orange">Mate</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-brand-green">
                Campus Food Tech
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search homemade thali, biryani combo, ₹80 meals..."
                className="w-full pl-10 pr-4 py-2 bg-cream-50/80 border border-amber-200/60 rounded-xl text-xs sm:text-sm text-brand-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-all"
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-cream-200 text-brand-charcoal shadow-sm'
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

          {/* Right Action Icons (Cart + Profile + Mobile Toggle) */}
          <div className="flex items-center gap-2.5">
            
            {/* 5-Day Loyalty Points Badge */}
            {user && (
              <Link
                to="/profile"
                title="5-Day Loyalty Streak & 100 Pts"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-brand-charcoal text-xs font-black transition-all"
              >
                <span>🪙</span>
                <span>{user.rewardPoints || 0} pts</span>
                {(user.rewardPoints || 0) >= 100 && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-600 text-white font-extrabold animate-pulse">
                    20% OFF
                  </span>
                )}
              </Link>
            )}

            {/* Swiggy-Style Live Cart Icon */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 bg-cream-100 hover:bg-cream-200 text-brand-charcoal px-3 py-2 rounded-xl border border-amber-200/60 transition-all hover:shadow-sm"
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
                    <span className="text-[10px] text-brand-green font-semibold capitalize">
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
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase">
                        Role: {role}
                      </span>
                    </div>

                    <div className="py-1 text-xs">
                      <Link to="/profile" className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-cream-100">
                        <div className="flex items-center gap-2.5">
                          <Gift className="w-4 h-4 text-brand-orange" />
                          <span>5-Day Loyalty Hub</span>
                        </div>
                        <span className="font-extrabold text-amber-800 text-xs">🪙 {user.rewardPoints || 0} pts</span>
                      </Link>
                      <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-cream-100">
                        <User className="w-4 h-4 text-gray-400" />
                        My Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-cream-100">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        My Orders & Tracking
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

                    <div className="border-t border-gray-100 py-1 text-xs">
                      {role === 'seller' ? (
                        <Link to="/seller/dashboard" className="flex items-center gap-2.5 px-4 py-2 text-brand-green font-bold hover:bg-emerald-50">
                          <Store className="w-4 h-4 text-brand-green" />
                          Seller Dashboard
                        </Link>
                      ) : (
                        <Link to="/seller/register" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-cream-100">
                          <Store className="w-4 h-4 text-gray-400" />
                          Become a Home Cook / Seller
                        </Link>
                      )}

                      {role === 'admin' ? (
                        <Link to="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2 text-purple-700 font-bold hover:bg-purple-50">
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          Admin Dashboard
                        </Link>
                      ) : (
                        <Link to="/admin/login" className="flex items-center gap-2.5 px-4 py-2 text-gray-500 hover:bg-cream-100">
                          <ShieldCheck className="w-4 h-4 text-gray-400" />
                          Admin Portal Login
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:text-brand-orange hover:bg-cream-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-cream-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search idli, thali, fried rice, deals..."
              className="w-full pl-9 pr-3 py-1.5 bg-cream-50 border border-amber-200/60 rounded-xl text-xs text-brand-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-amber-100 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-gray-100">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-cream-50 hover:bg-cream-100 text-xs font-bold text-brand-charcoal"
                >
                  <Icon className="w-4 h-4 text-brand-orange" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col gap-1 text-xs">
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-cream-100 font-semibold text-gray-700"
            >
              🍽️ Explore All 20 Catalog Meals
            </Link>
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-cream-100 font-semibold text-gray-700"
            >
              📦 My Orders & Tracking
            </Link>
            <Link
              to="/seller/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-cream-100 font-semibold text-brand-green"
            >
              🏪 Seller Hub
            </Link>
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-cream-100 font-semibold text-purple-700"
            >
              🛡️ Administrator Portal
            </Link>

            <div className="pt-2 border-t border-gray-100 mt-2">
              {user ? (
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-cream-50 font-bold text-brand-charcoal"
                  >
                    <span>👤 {user.name}</span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-brand-orange text-white">{user.role}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 font-bold text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 text-center rounded-xl font-bold bg-cream-100 text-brand-charcoal hover:bg-cream-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 text-center rounded-xl font-bold bg-brand-orange text-white hover:bg-brand-orange-hover shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
