import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';

// Common Components
import { DemoModeBanner } from './components/common/DemoModeBanner';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public & Customer Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ExploreMeals } from './pages/ExploreMeals';
import { HomePlate } from './pages/HomePlate';
import { BudgetBite } from './pages/BudgetBite';
import { SaveMyMeal } from './pages/SaveMyMeal';
import { MealDetails } from './pages/MealDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { MyOrders } from './pages/MyOrders';
import { OrderDetails } from './pages/OrderDetails';
import { Profile } from './pages/Profile';
import { SavedAddresses } from './pages/SavedAddresses';
import { SubscriptionPlans } from './pages/SubscriptionPlans';
import { SubscriptionManagement } from './pages/SubscriptionManagement';

// Seller Pages
import { SellerRegister } from './pages/seller/SellerRegister';
import { SellerLogin } from './pages/seller/SellerLogin';
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { AddMeal } from './pages/seller/AddMeal';
import { EditMeal } from './pages/seller/EditMeal';
import { SellerOrders } from './pages/seller/SellerOrders';
import { SellerInventory } from './pages/seller/SellerInventory';
import { SellerProfile } from './pages/seller/SellerProfile';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageCustomers } from './pages/admin/ManageCustomers';
import { ManageSellers } from './pages/admin/ManageSellers';
import { ManageMeals } from './pages/admin/ManageMeals';
import { ManageOrders } from './pages/admin/ManageOrders';
import { ReviewsComplaints } from './pages/admin/ReviewsComplaints';

// Informational & 404 Pages
import { FoodWasteImpact } from './pages/FoodWasteImpact';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';
import { NotFound } from './pages/NotFound';

// Scroll to top helper
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-cream-100 text-brand-charcoal selection:bg-brand-orange selection:text-white">
              
              {/* Persistent Top Bar: Demo Mode Indicator & Role Switcher */}
              <DemoModeBanner />

              {/* Main App Navbar */}
              <Navbar />

              {/* Page Content View */}
              <main className="flex-grow">
                <Routes>
                  {/* 1-4: Core Customer Experience */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/register" element={<Signup />} />
                  <Route path="/explore" element={<ExploreMeals />} />

                  {/* 5-7: Core 3 Modules */}
                  <Route path="/homeplate" element={<HomePlate />} />
                  <Route path="/budgetbite" element={<BudgetBite />} />
                  <Route path="/savemymeal" element={<SaveMyMeal />} />

                  {/* 8-11: Food Ordering & Swiggy Cart Flows */}
                  <Route path="/meal/:id" element={<MealDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />

                  {/* 12-15: Orders, Profile & Saved Addresses */}
                  <Route path="/orders" element={<MyOrders />} />
                  <Route path="/orders/:orderId" element={<OrderDetails />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/saved-addresses" element={<SavedAddresses />} />

                  {/* 16-17: HomePlate Meal Subscriptions */}
                  <Route path="/subscriptions" element={<SubscriptionPlans />} />
                  <Route path="/subscription-manage" element={<SubscriptionManagement />} />

                  {/* 18-19: Seller Auth */}
                  <Route path="/seller/register" element={<SellerRegister />} />
                  <Route path="/seller/login" element={<SellerLogin />} />

                  {/* 20-25: Protected Seller Routes */}
                  <Route
                    path="/seller/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <SellerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/add-meal"
                    element={
                      <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <AddMeal />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/edit-meal/:id"
                    element={
                      <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <EditMeal />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/orders"
                    element={
                      <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <SellerOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/inventory"
                    element={
                      <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <SellerInventory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/profile"
                    element={
                      <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <SellerProfile />
                      </ProtectedRoute>
                    }
                  />

                  {/* 26: Admin Auth */}
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* 27-32: Protected Administrator Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/customers"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ManageCustomers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/sellers"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ManageSellers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/meals"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ManageMeals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ManageOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/complaints"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ReviewsComplaints />
                      </ProtectedRoute>
                    }
                  />

                  {/* 33-35: Impact & Informational Pages */}
                  <Route path="/impact" element={<FoodWasteImpact />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<ContactUs />} />

                  {/* 36: 404 Catch-All */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              {/* Main App Footer */}
              <Footer />

            </div>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
