import type { 
  FoodItem, 
  Order, 
  Address, 
  CustomerSubscription, 
  UserProfile, 
  Review, 
  Complaint,
  OrderStatus,
  PaymentStatus
} from '../types';
import { 
  INITIAL_FOOD_ITEMS, 
  INITIAL_USERS, 
  INITIAL_ADDRESSES, 
  INITIAL_REVIEWS, 
  INITIAL_COMPLAINTS
} from '../data/sampleCatalog';

const STORAGE_KEYS = {
  MEALS: 'mealmate_meals_v1',
  ORDERS: 'mealmate_orders_v1',
  ADDRESSES: 'mealmate_addresses_v1',
  SUBSCRIPTIONS: 'mealmate_subscriptions_v1',
  USERS: 'mealmate_users_v1',
  CURRENT_USER: 'mealmate_current_user_v1',
  REVIEWS: 'mealmate_reviews_v1',
  COMPLAINTS: 'mealmate_complaints_v1',
  SAVED_CART: 'mealmate_cart_v1',
};

// Safe localStorage helpers
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage`, err);
  }
}

export const StorageService = {
  // --- FOOD MEALS ---
  getMeals: (): FoodItem[] => {
    let meals = getStored<FoodItem[]>(STORAGE_KEYS.MEALS, []);
    if (!meals || meals.length === 0) {
      meals = [...INITIAL_FOOD_ITEMS];
      setStored(STORAGE_KEYS.MEALS, meals);
    }
    return meals;
  },

  getMealById: (id: string): FoodItem | undefined => {
    const meals = StorageService.getMeals();
    return meals.find(m => m.id === id);
  },

  saveMeal: (meal: FoodItem): void => {
    const meals = StorageService.getMeals();
    const index = meals.findIndex(m => m.id === meal.id);
    if (index >= 0) {
      meals[index] = { ...meal, updatedAt: new Date().toISOString() };
    } else {
      meals.unshift(meal);
    }
    setStored(STORAGE_KEYS.MEALS, meals);
  },

  deleteMeal: (id: string): void => {
    const meals = StorageService.getMeals().filter(m => m.id !== id);
    setStored(STORAGE_KEYS.MEALS, meals);
  },

  reduceStock: (items: { foodId: string; quantity: number }[]): void => {
    const meals = StorageService.getMeals();
    for (const item of items) {
      const meal = meals.find(m => m.id === item.foodId);
      if (meal) {
        meal.stockQuantity = Math.max(0, meal.stockQuantity - item.quantity);
        if (meal.stockQuantity === 0) {
          meal.isAvailable = false;
        }
      }
    }
    setStored(STORAGE_KEYS.MEALS, meals);
  },

  // --- ORDERS ---
  getOrders: (): Order[] => {
    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, []);
    return orders;
  },

  getOrderById: (id: string): Order | undefined => {
    return StorageService.getOrders().find(o => o.id === id || o.orderNumber === id);
  },

  saveOrder: (order: Order): void => {
    const orders = StorageService.getOrders();
    const index = orders.findIndex(o => o.id === order.id);
    if (index >= 0) {
      orders[index] = { ...order, updatedAt: new Date().toISOString() };
    } else {
      orders.unshift(order);
    }
    setStored(STORAGE_KEYS.ORDERS, orders);
  },

  updateOrderStatus: (
    orderId: string, 
    newStatus: OrderStatus, 
    paymentStatus?: PaymentStatus,
    reason?: string
  ): Order | undefined => {
    const orders = StorageService.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return undefined;

    order.orderStatus = newStatus;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    if (reason) {
      order.cancellationReason = reason;
    }
    order.statusTimestamps = {
      ...(order.statusTimestamps || {}),
      [newStatus]: new Date().toISOString()
    };
    order.updatedAt = new Date().toISOString();

    setStored(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  // --- ADDRESSES ---
  getAddresses: (_userId?: string): Address[] => {
    let addresses = getStored<Address[]>(STORAGE_KEYS.ADDRESSES, []);
    if (!addresses || addresses.length === 0) {
      addresses = [...INITIAL_ADDRESSES];
      setStored(STORAGE_KEYS.ADDRESSES, addresses);
    }
    return addresses;
  },

  saveAddress: (address: Address): void => {
    let addresses = StorageService.getAddresses();
    if (address.isDefault) {
      addresses = addresses.map(a => ({ ...a, isDefault: false }));
    }
    const index = addresses.findIndex(a => a.id === address.id);
    if (index >= 0) {
      addresses[index] = address;
    } else {
      addresses.unshift(address);
    }
    setStored(STORAGE_KEYS.ADDRESSES, addresses);
  },

  deleteAddress: (id: string): void => {
    const addresses = StorageService.getAddresses().filter(a => a.id !== id);
    setStored(STORAGE_KEYS.ADDRESSES, addresses);
  },

  // --- SUBSCRIPTIONS ---
  getSubscriptions: (customerId?: string): CustomerSubscription[] => {
    const subs = getStored<CustomerSubscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    if (customerId) {
      return subs.filter(s => s.customerId === customerId);
    }
    return subs;
  },

  saveSubscription: (subscription: CustomerSubscription): void => {
    const subs = StorageService.getSubscriptions();
    const index = subs.findIndex(s => s.id === subscription.id);
    if (index >= 0) {
      subs[index] = subscription;
    } else {
      subs.unshift(subscription);
    }
    setStored(STORAGE_KEYS.SUBSCRIPTIONS, subs);
  },

  updateSubscriptionStatus: (
    id: string, 
    status: 'Active' | 'Paused' | 'Expired' | 'Cancelled'
  ): void => {
    const subs = StorageService.getSubscriptions();
    const sub = subs.find(s => s.id === id);
    if (sub) {
      sub.status = status;
      setStored(STORAGE_KEYS.SUBSCRIPTIONS, subs);
    }
  },

  // --- USERS & AUTH ---
  getUsers: (): UserProfile[] => {
    let users = getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
    if (!users || users.length === 0) {
      users = [...INITIAL_USERS];
      setStored(STORAGE_KEYS.USERS, users);
    }
    return users;
  },

  getCurrentUser: (): UserProfile | null => {
    return getStored<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser: (user: UserProfile): void => {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
  },

  clearCurrentUser: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  updateUser: (user: UserProfile): void => {
    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    setStored(STORAGE_KEYS.USERS, users);
    const curr = StorageService.getCurrentUser();
    if (curr && curr.id === user.id) {
      StorageService.setCurrentUser(user);
    }
  },

  // --- REVIEWS & COMPLAINTS ---
  getReviews: (foodId?: string): Review[] => {
    let reviews = getStored<Review[]>(STORAGE_KEYS.REVIEWS, []);
    if (!reviews || reviews.length === 0) {
      reviews = [...INITIAL_REVIEWS];
      setStored(STORAGE_KEYS.REVIEWS, reviews);
    }
    if (foodId) {
      return reviews.filter(r => r.foodId === foodId);
    }
    return reviews;
  },

  addReview: (review: Review): void => {
    const reviews = StorageService.getReviews();
    reviews.unshift(review);
    setStored(STORAGE_KEYS.REVIEWS, reviews);
  },

  getComplaints: (): Complaint[] => {
    let complaints = getStored<Complaint[]>(STORAGE_KEYS.COMPLAINTS, []);
    if (!complaints || complaints.length === 0) {
      complaints = [...INITIAL_COMPLAINTS];
      setStored(STORAGE_KEYS.COMPLAINTS, complaints);
    }
    return complaints;
  },

  addComplaint: (complaint: Complaint): void => {
    const complaints = StorageService.getComplaints();
    complaints.unshift(complaint);
    setStored(STORAGE_KEYS.COMPLAINTS, complaints);
  },

  updateComplaintStatus: (id: string, status: 'Pending' | 'Investigating' | 'Resolved', notes?: string): void => {
    const complaints = StorageService.getComplaints();
    const c = complaints.find(comp => comp.id === id);
    if (c) {
      c.status = status;
      if (notes) c.resolutionNotes = notes;
      setStored(STORAGE_KEYS.COMPLAINTS, complaints);
    }
  },

  // Reset to default sample catalog
  resetToDefaults: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MEALS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.ADDRESSES);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
    localStorage.removeItem(STORAGE_KEYS.SAVED_CART);
  }
};
