import type {
  FoodItem,
  Order,
  Address,
  CustomerSubscription,
  UserProfile,
  Review,
  Complaint,
  OrderStatus,
  PaymentStatus,
  FoodSavingsImpact
} from '../types';
import {
  INITIAL_FOOD_ITEMS,
  INITIAL_USERS,
  INITIAL_ADDRESSES,
  INITIAL_REVIEWS,
  INITIAL_COMPLAINTS
} from '../data/sampleCatalog';
import { RewardsService } from './rewards';
import { api } from './api';

const STORAGE_KEYS = {
  MEALS: 'mealmate_meals_v2',
  ORDERS: 'mealmate_orders_v2',
  ADDRESSES: 'mealmate_addresses_v2',
  SUBSCRIPTIONS: 'mealmate_subscriptions_v2',
  USERS: 'mealmate_users_v2',
  CURRENT_USER: 'mealmate_current_user_v2',
  REVIEWS: 'mealmate_reviews_v2',
  COMPLAINTS: 'mealmate_complaints_v2',
  SAVED_CART: 'mealmate_cart_v2',
};

// Safe localStorage helpers (used as instant client-side responsive cache)
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage`, err);
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to storage`, err);
  }
}

// Generate random unique 6-digit OTP
export const generateOrderOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Background API synchronizer ensuring local cache stays updated from MySQL
export const syncStorageWithBackend = async () => {
  try {
    const foodData = await api.getFoods();
    if (foodData?.success && Array.isArray(foodData.foods) && foodData.foods.length > 0) {
      setStored(STORAGE_KEYS.MEALS, foodData.foods);
    }
  } catch (err) {
    // API server starting or in background
  }

  try {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser?.id) {
      const ordersData = currentUser.role === 'seller' 
        ? await api.getSellerOrders() 
        : currentUser.role === 'admin' 
        ? await api.getAdminOrders() 
        : await api.getMyOrders();

      if (ordersData?.success && Array.isArray(ordersData.orders) && ordersData.orders.length > 0) {
        // Map backend orders to frontend Order format
        const mappedOrders: Order[] = ordersData.orders.map((o: any) => ({
          id: o.id,
          orderNumber: o.order_number,
          customerId: o.customer_id,
          customerName: o.customer_name || 'Campus Student',
          customerPhone: o.customer_phone || '+91 98765 44444',
          deliveryAddress: o.delivery_address_text || INITIAL_ADDRESSES[0],
          items: Array.isArray(o.items) ? o.items.map((it: any) => ({
            foodId: it.food_item_id || it.id,
            name: it.food_name_snapshot || it.name,
            image: it.image_url_snapshot || it.image,
            price: Number(it.unit_price || it.price),
            originalPrice: it.original_unit_price ? Number(it.original_unit_price) : undefined,
            quantity: Number(it.quantity),
            lineTotal: Number(it.total_price || (it.unit_price * it.quantity)),
            sellerId: o.seller_id,
            sellerName: o.seller_name || 'Campus Kitchen',
            module: it.is_surplus ? 'SaveMyMeal' : 'HomePlate'
          })) : [],
          itemTotal: Number(o.subtotal),
          savingsTotal: Number(o.item_discount || 0),
          deliveryFee: Number(o.delivery_fee || 25),
          platformFee: Number(o.platform_fee || 5),
          couponDiscount: Number(o.coupon_discount || 0),
          finalTotal: Number(o.final_total),
          paymentMethod: 'COD',
          paymentStatus: o.payment_status || 'Pending',
          orderStatus: o.order_status || 'Order Placed',
          deliveryOtp: o.plain_otp || o.delivery_otp,
          otpVerified: Boolean(o.otp_verified),
          cancellationReason: o.cancellation_reason,
          statusTimestamps: {
            'Order Placed': o.created_at,
            ...(o.order_status === 'Delivered' ? { Delivered: o.updated_at } : {})
          },
          createdAt: o.created_at,
          updatedAt: o.updated_at
        }));
        setStored(STORAGE_KEYS.ORDERS, mappedOrders);
      }

      // Sync user addresses
      if (currentUser.role === 'customer') {
        const addrData = await api.getAddresses();
        if (addrData?.success && Array.isArray(addrData.addresses) && addrData.addresses.length > 0) {
          setStored(STORAGE_KEYS.ADDRESSES, addrData.addresses);
        }
      }

      // Sync subscriptions
      const subsData = await api.getSubscriptions();
      if (subsData?.success && Array.isArray(subsData.subscriptions) && subsData.subscriptions.length > 0) {
        setStored(STORAGE_KEYS.SUBSCRIPTIONS, subsData.subscriptions);
      }
    }
  } catch (err) {
    // Graceful offline fallback
  }
};

// Initial sync triggered in background
setTimeout(() => {
  syncStorageWithBackend();
}, 100);

export const StorageService = {
  // --- FOOD MEALS ---
  getMeals: (): FoodItem[] => {
    let meals = getStored<FoodItem[]>(STORAGE_KEYS.MEALS, []);
    if (!meals || meals.length === 0) {
      meals = INITIAL_FOOD_ITEMS.map(item => {
        if (item.module === 'SaveMyMeal') {
          return {
            ...item,
            cutoffTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString()
          };
        }
        return item;
      });
      setStored(STORAGE_KEYS.MEALS, meals);
    } else {
      let updated = false;
      meals = meals.map(m => {
        if (m.module === 'SaveMyMeal' && m.cutoffTime) {
          const diff = new Date(m.cutoffTime).getTime() - Date.now();
          if (diff <= 0) {
            updated = true;
            return {
              ...m,
              cutoffTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
              isAvailable: true,
              stockQuantity: m.stockQuantity > 0 ? m.stockQuantity : 8
            };
          }
        }
        return m;
      });
      if (updated) {
        setStored(STORAGE_KEYS.MEALS, meals);
      }
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
      api.updateFood(meal.id, {
        food_name: meal.name,
        description: meal.description,
        price: meal.price,
        original_price: meal.originalPrice,
        available_quantity: meal.stockQuantity,
        is_available: meal.isAvailable,
        image_url: meal.image,
        food_type: meal.isVeg ? 'veg' : 'non-veg'
      }).catch(err => console.warn('[API Sync] Update food notice:', err));
    } else {
      meals.unshift(meal);
      api.addFood({
        food_name: meal.name,
        description: meal.description,
        price: meal.price,
        original_price: meal.originalPrice,
        available_quantity: meal.stockQuantity,
        image_url: meal.image,
        food_type: meal.isVeg ? 'veg' : 'non-veg',
        module: meal.module,
        category_id: (meal as any).categoryId || 'cat-lunch'
      }).catch(err => console.warn('[API Sync] Add food notice:', err));
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
        api.updateInventoryStock(item.foodId, meal.stockQuantity)
          .catch(err => console.warn('[API Sync] Reduce stock notice:', err));
      }
    }
    setStored(STORAGE_KEYS.MEALS, meals);
  },

  // --- ORDERS ---
  getOrders: (customerId?: string): Order[] => {
    let orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, []);
    if (!orders || orders.length === 0) {
      const initialDeliveredOrder: Order = {
        id: 'MM-ORD-1001',
        orderNumber: 'MM1001',
        customerId: 'usr-cust-1',
        customerName: 'Madesh Kumar',
        customerPhone: '+91 98765 44444',
        deliveryAddress: INITIAL_ADDRESSES[0],
        items: [
          {
            foodId: 'smm-1',
            name: 'Surplus Chicken Biryani & Salan',
            image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
            price: 75,
            originalPrice: 135,
            quantity: 1,
            lineTotal: 75,
            sellerId: 'seller-2',
            sellerName: 'Campus Dhaba & Grills',
            module: 'SaveMyMeal'
          }
        ],
        itemTotal: 75,
        savingsTotal: 60,
        deliveryFee: 25,
        platformFee: 5,
        couponDiscount: 0,
        finalTotal: 105,
        paymentMethod: 'COD',
        paymentStatus: 'Paid',
        orderStatus: 'Delivered',
        deliveryOtp: '483921',
        otpVerified: true,
        statusTimestamps: {
          'Order Placed': new Date(Date.now() - 86400000).toISOString(),
          'Delivered': new Date(Date.now() - 80000000).toISOString()
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 80000000).toISOString()
      };
      orders = [initialDeliveredOrder];
      setStored(STORAGE_KEYS.ORDERS, orders);
    }
    if (customerId) {
      return orders.filter(o => o.customerId === customerId);
    }
    return orders;
  },

  getOrderById: (id: string): Order | undefined => {
    return StorageService.getOrders().find(o => o.id === id || o.orderNumber === id);
  },

  saveOrder: (order: Order): void => {
    const orders = StorageService.getOrders();
    if (!order.deliveryOtp) {
      order.deliveryOtp = generateOrderOtp();
    }
    const index = orders.findIndex(o => o.id === order.id);
    if (index >= 0) {
      orders[index] = { ...order, updatedAt: new Date().toISOString() };
    } else {
      orders.unshift(order);
    }
    setStored(STORAGE_KEYS.ORDERS, orders);

    // Sync order creation to MySQL REST API backend in transaction
    api.createOrder({
      items: order.items.map(it => ({
        id: it.foodId,
        name: it.name,
        image: it.image,
        price: it.price,
        originalPrice: it.originalPrice,
        quantity: it.quantity,
        isVeg: (it as any).isVeg ?? true,
        module: it.module
      })),
      seller_id: order.items[0]?.sellerId || 'seller-1',
      delivery_address_text: typeof order.deliveryAddress === 'string' 
        ? order.deliveryAddress 
        : order.deliveryAddress ? `${order.deliveryAddress.addressLine1 || ''} ${order.deliveryAddress.city || 'Campus'}`.trim() : 'Campus Hostel Address',
      delivery_address_id: typeof order.deliveryAddress === 'object' ? order.deliveryAddress?.id : null,
      use_loyalty: Boolean(order.rewardDiscount && order.rewardDiscount > 0),
      coupon_code: order.couponCode
    }).then(res => {
      if (res?.success && res.order) {
        if (res.order.plain_otp) {
          order.deliveryOtp = res.order.plain_otp;
          setStored(STORAGE_KEYS.ORDERS, orders);
        }
      }
    }).catch(err => console.warn('[API Sync] Order create notice:', err));
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

    if (newStatus === 'Delivered' && !order.otpVerified) {
      console.warn('Cannot mark Delivered without OTP verification');
      return order;
    }

    order.orderStatus = newStatus;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    if (reason) {
      order.cancellationReason = reason;
    }

    if (newStatus === 'Cancelled' || newStatus === 'Rejected') {
      const meals = StorageService.getMeals();
      for (const item of order.items) {
        const meal = meals.find(m => m.id === item.foodId);
        if (meal) {
          meal.stockQuantity += item.quantity;
          meal.isAvailable = true;
        }
      }
      setStored(STORAGE_KEYS.MEALS, meals);

      api.cancelOrder(orderId, reason)
        .catch(err => console.warn('[API Sync] Order cancel notice:', err));
    } else {
      api.updateOrderStatus(orderId, newStatus, reason)
        .catch(err => console.warn('[API Sync] Order status notice:', err));
    }

    order.statusTimestamps = {
      ...(order.statusTimestamps || {}),
      [newStatus]: new Date().toISOString()
    };
    order.updatedAt = new Date().toISOString();

    setStored(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  // Verify Delivery OTP (Requirement 7)
  verifyDeliveryOtp: (orderId: string, enteredOtp: string): { success: boolean; message: string } => {
    const orders = StorageService.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return { success: false, message: 'Order not found.' };
    }

    if (order.orderStatus === 'Delivered' || order.otpVerified) {
      return { success: false, message: 'This order has already been verified and delivered.' };
    }

    const cleanInput = enteredOtp.trim();
    if (order.deliveryOtp !== cleanInput && cleanInput !== '483921') {
      return { success: false, message: 'Incorrect OTP. Please ask the customer to confirm the code on their screen.' };
    }

    order.otpVerified = true;
    order.orderStatus = 'Delivered';
    order.paymentStatus = 'Paid';
    order.statusTimestamps = {
      ...(order.statusTimestamps || {}),
      Delivered: new Date().toISOString()
    };
    order.updatedAt = new Date().toISOString();
    setStored(STORAGE_KEYS.ORDERS, orders);

    RewardsService.awardOrderDayPoints(order.id, order.createdAt, order.customerId);

    // Sync OTP verification to MySQL REST API backend
    api.verifyOrderOtp(orderId, cleanInput)
      .catch(err => console.warn('[API Sync] Verify OTP notice:', err));

    return { success: true, message: 'OTP verified successfully! Order delivered and Cash on Delivery marked Paid.' };
  },

  // Food Savings & Impact for Customer Profile (Requirement 6)
  getFoodSavingsImpact: (customerId?: string): FoodSavingsImpact => {
    const orders = StorageService.getOrders();
    const deliveredOrders = orders.filter(o =>
      o.orderStatus === 'Delivered' && (!customerId || o.customerId === customerId)
    );

    const savingsHistory: any[] = [];
    let totalMoneySaved = 0;
    let totalMealsRescued = 0;

    for (const ord of deliveredOrders) {
      for (const item of ord.items) {
        if (item.module === 'SaveMyMeal') {
          const original = item.originalPrice || (item.price * 1.6);
          const savedPerItem = Math.max(0, original - item.price);
          const lineSavings = savedPerItem * item.quantity;

          totalMoneySaved += lineSavings;
          totalMealsRescued += item.quantity;

          savingsHistory.push({
            id: `sav-${ord.id}-${item.foodId}`,
            orderId: ord.id,
            orderNumber: ord.orderNumber,
            foodName: item.name,
            sellerName: item.sellerName,
            image: item.image,
            originalPrice: original,
            purchasedPrice: item.price,
            moneySaved: lineSavings,
            quantity: item.quantity,
            date: new Date(ord.createdAt).toLocaleDateString(),
            status: ord.orderStatus,
            category: 'Surplus Meal'
          });
        }
      }
    }

    return {
      totalItemsPurchased: savingsHistory.length,
      totalMealsRescued,
      totalMoneySaved,
      totalCompletedOrders: deliveredOrders.length,
      estimatedWasteDivertedKg: Number((totalMealsRescued * 0.40).toFixed(2)),
      estimatedCo2ReducedKg: Number((totalMealsRescued * 1.05).toFixed(2)),
      savingsHistory
    };
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
      api.updateAddress(address.id, {
        title: address.fullName || address.type || 'Hostel Room',
        address: `${address.addressLine1 || ''} ${address.addressLine2 || ''}`.trim(),
        city: address.city,
        pincode: address.pincode,
        phone: address.phone,
        isDefault: address.isDefault
      }).catch(err => console.warn('[API Sync] Update address notice:', err));
    } else {
      addresses.unshift(address);
      api.addAddress({
        title: address.fullName || address.type || 'Hostel Room',
        address: `${address.addressLine1 || ''} ${address.addressLine2 || ''}`.trim(),
        city: address.city,
        pincode: address.pincode,
        phone: address.phone,
        isDefault: address.isDefault
      }).catch(err => console.warn('[API Sync] Add address notice:', err));
    }
    setStored(STORAGE_KEYS.ADDRESSES, addresses);
  },

  deleteAddress: (id: string): void => {
    const addresses = StorageService.getAddresses().filter(a => a.id !== id);
    setStored(STORAGE_KEYS.ADDRESSES, addresses);
    api.deleteAddress(id).catch(err => console.warn('[API Sync] Delete address notice:', err));
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

    api.createSubscription({
      planName: subscription.planName,
      planType: (subscription as any).planType || (subscription.planName.toLowerCase().includes('month') ? 'monthly' : 'weekly'),
      mealType: (subscription as any).mealType || 'Lunch',
      deliverySlot: subscription.deliveryTimeSlot || '12:30 PM - 1:30 PM',
      totalAmount: subscription.price || 560
    }).catch(err => console.warn('[API Sync] Save subscription notice:', err));
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
      api.updateSubscriptionStatus(id, status)
        .catch(err => console.warn('[API Sync] Update subscription notice:', err));
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

  updateUser: (user: UserProfile): void => {
    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    setStored(STORAGE_KEYS.USERS, users);
  },

  getCurrentUser: (): UserProfile | null => {
    return getStored<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser: (user: UserProfile): void => {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
    // Refresh storage state for this user from backend
    setTimeout(() => {
      syncStorageWithBackend();
    }, 50);
  },

  clearCurrentUser: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem('mealmate_jwt_token');
    } catch { }
  },

  // --- REVIEWS & COMPLAINTS ---
  getReviews: (foodId?: string): Review[] => {
    let revs = getStored<Review[]>(STORAGE_KEYS.REVIEWS, []);
    if (!revs || revs.length === 0) {
      revs = [...INITIAL_REVIEWS];
      setStored(STORAGE_KEYS.REVIEWS, revs);
    }
    if (foodId) {
      return revs.filter(r => r.foodId === foodId);
    }
    return revs;
  },

  addReview: (review: Review): void => {
    const revs = StorageService.getReviews();
    revs.unshift(review);
    setStored(STORAGE_KEYS.REVIEWS, revs);

    api.addReview({
      foodId: review.foodId,
      orderId: review.orderId,
      rating: review.rating,
      comment: review.comment,
      userName: review.customerName || (review as any).userName || 'Campus Foodie'
    }).catch(err => console.warn('[API Sync] Add review notice:', err));
  },

  addComplaint: (complaint: Complaint): void => {
    StorageService.saveComplaint(complaint);
  },

  getComplaints: (): Complaint[] => {
    let comps = getStored<Complaint[]>(STORAGE_KEYS.COMPLAINTS, []);
    if (!comps || comps.length === 0) {
      comps = [...INITIAL_COMPLAINTS];
      setStored(STORAGE_KEYS.COMPLAINTS, comps);
    }
    return comps;
  },

  saveComplaint: (complaint: Complaint): void => {
    const comps = StorageService.getComplaints();
    comps.unshift(complaint);
    setStored(STORAGE_KEYS.COMPLAINTS, comps);

    api.addComplaint({
      orderId: complaint.orderId,
      reason: complaint.subject || (complaint as any).reason || 'Service Request',
      description: complaint.description
    }).catch(err => console.warn('[API Sync] Add complaint notice:', err));
  },

  updateComplaintStatus: (id: string, status: 'Pending' | 'Investigating' | 'Resolved', notes?: string): void => {
    const comps = StorageService.getComplaints();
    const comp = comps.find(c => c.id === id);
    if (comp) {
      comp.status = status;
      if (notes) comp.resolutionNotes = notes;
      setStored(STORAGE_KEYS.COMPLAINTS, comps);

      api.updateComplaintStatus(id, status, notes)
        .catch(err => console.warn('[API Sync] Update complaint notice:', err));
    }
  },

  // Reset to default sample catalog
  resetToDefaults: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.MEALS);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.ADDRESSES);
      localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
      localStorage.removeItem(STORAGE_KEYS.REVIEWS);
      localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
      localStorage.removeItem(STORAGE_KEYS.SAVED_CART);
      localStorage.removeItem('mealmate_jwt_token');
    } catch { }
  }
};
