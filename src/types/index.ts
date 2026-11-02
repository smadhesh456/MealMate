export type ModuleType = 'HomePlate' | 'BudgetBite' | 'SaveMyMeal';

export type FoodCategory = 
  | 'All Foods'
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Rice'
  | 'Snacks'
  | 'Combos'
  | 'Homemade'
  | 'Budget Meals'
  | 'Discounted Meals'
  | 'Vegetarian'
  | 'Non-Vegetarian';

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  image: string;
  category: FoodCategory;
  price: number;
  originalPrice?: number; // For SaveMyMeal
  discountPercentage?: number;
  sellerId: string;
  sellerName: string;
  module: ModuleType;
  rating: number;
  reviewCount: number;
  isVeg: boolean;
  isAvailable: boolean;
  stockQuantity: number;
  prepTimeMinutes: number;
  cutoffTime?: string; // ISO string for SaveMyMeal surplus cutoff
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export type OrderStatus = 
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'COD';
export type PaymentStatus = 'Pending' | 'Paid';

export interface OrderItem {
  foodId: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  lineTotal: number;
  sellerId: string;
  sellerName: string;
  module: ModuleType;
}

export interface BillBreakdown {
  itemTotal: number;
  savingsTotal: number;
  deliveryFee: number;
  platformFee: number;
  couponDiscount: number;
  rewardDiscount?: number;
  rewardPointsUsed?: number;
  finalTotal: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  pincode: string;
  isDefault: boolean;
  type: 'Home' | 'Work' | 'Other';
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: Address;
  items: OrderItem[];
  itemTotal: number;
  savingsTotal: number;
  deliveryFee: number;
  platformFee: number;
  couponDiscount: number;
  couponCode?: string;
  rewardDiscount?: number;
  rewardPointsUsed?: number;
  pointsEarned?: number;
  finalTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusTimestamps: Record<string, string>;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'Weekly' | 'Monthly';
  description: string;
  sellerId: string;
  sellerName: string;
  mealsIncluded: string[];
  daysCount: number;
  price: number;
  savingsPercent: number;
  image: string;
}

export interface CustomerSubscription {
  id: string;
  customerId: string;
  planId: string;
  planName: string;
  sellerName: string;
  startDate: string;
  endDate: string;
  price: number;
  status: 'Active' | 'Paused' | 'Expired' | 'Cancelled';
  deliveryAddress: Address;
  deliveryTimeSlot: 'Breakfast (7:30 - 8:30 AM)' | 'Lunch (12:30 - 1:30 PM)' | 'Dinner (7:30 - 8:30 PM)';
  createdAt: string;
}

export type UserRole = 'customer' | 'seller' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  sellerVerificationStatus?: 'Pending' | 'Verified' | 'Rejected';
  businessName?: string;
  businessAddress?: string;
  isActive: boolean;
  rewardPoints?: number;
  rewardStreakDays?: string[];
  totalLifetimePoints?: number;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  foodId: string;
  foodName: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  status: 'Pending' | 'Investigating' | 'Resolved';
  resolutionNotes?: string;
  createdAt: string;
}
