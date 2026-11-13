// Centralized API Client connecting to MySQL REST API backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const FALLBACK_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

// Helper for auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('mealmate_jwt_token');
  const storedUser = localStorage.getItem('mealmate_current_user_v2') || localStorage.getItem('mealmate_current_user');
  let user: any = null;
  if (storedUser) {
    try { user = JSON.parse(storedUser); } catch {}
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (user?.id) {
    headers['x-user-id'] = user.id;
    headers['x-user-role'] = user.role;
  }

  return headers;
};

export const api = {
  // Auth
  async login(email: string, password?: string, role?: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    return res.json();
  },

  async register(data: { name: string; email: string; phone: string; password: string; role: string; businessName?: string; businessAddress?: string }) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Foods
  async getFoods(params?: { module?: string; category?: string; food_type?: string; budget?: number; include_fees?: boolean; search?: string; seller_id?: string }) {
    const query = new URLSearchParams();
    if (params?.module) query.append('module', params.module);
    if (params?.category) query.append('category', params.category);
    if (params?.food_type) query.append('food_type', params.food_type);
    if (params?.budget) query.append('budget', params.budget.toString());
    if (params?.include_fees !== undefined) query.append('include_fees', params.include_fees.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.seller_id) query.append('seller_id', params.seller_id);

    const res = await fetch(`${API_BASE_URL}/foods?${query.toString()}`);
    return res.json();
  },

  async getFoodById(id: string) {
    const res = await fetch(`${API_BASE_URL}/foods/${id}`);
    return res.json();
  },

  async addFood(foodData: any) {
    const res = await fetch(`${API_BASE_URL}/foods`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(foodData),
    });
    return res.json();
  },

  async updateFood(id: string, foodData: any) {
    const res = await fetch(`${API_BASE_URL}/foods/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(foodData),
    });
    return res.json();
  },

  // Orders
  async createOrder(orderData: any) {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    return res.json();
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getSellerOrders() {
    const res = await fetch(`${API_BASE_URL}/orders/seller`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAdminOrders() {
    const res = await fetch(`${API_BASE_URL}/orders/admin`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getOrderById(id: string) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: string, reason?: string) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, reason }),
    });
    return res.json();
  },

  // OTP Verification (Strict Requirement 7)
  async verifyOrderOtp(orderId: string, otp: string) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/verify-otp`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ otp }),
    });
    return res.json();
  },

  // Cancel Order (Requirement 10)
  async cancelOrder(orderId: string, reason?: string) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  // Surplus (Requirement 5)
  async getSurplusMeals() {
    const res = await fetch(`${API_BASE_URL}/surplus`);
    return res.json();
  },

  // Loyalty (Requirement 8A)
  async getLoyaltyStatus() {
    const res = await fetch(`${API_BASE_URL}/loyalty/status`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Food Savings & Impact (Requirement 6)
  async getFoodSavingsImpact() {
    const res = await fetch(`${API_BASE_URL}/savings/my-impact`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Seller Dashboard
  async getSellerDashboard() {
    const res = await fetch(`${API_BASE_URL}/sellers/dashboard`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAdminCustomers() {
    const res = await fetch(`${API_BASE_URL}/admin/customers`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async toggleCustomerStatus(id: string) {
    const res = await fetch(`${API_BASE_URL}/admin/customers/${id}/toggle-status`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAdminSellers() {
    const res = await fetch(`${API_BASE_URL}/admin/sellers`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async verifySeller(id: string, status: 'approved' | 'rejected') {
    const res = await fetch(`${API_BASE_URL}/admin/sellers/${id}/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },
};

