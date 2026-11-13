import { SEED_DATA } from './db';
import bcrypt from 'bcryptjs';

// In-memory shadow store implementing exact MySQL 18-table state
// when local MySQL service is temporarily offline or disconnected
class MemoryStore {
  users: any[] = [];
  sellers: any[] = [];
  categories: any[] = [];
  foodItems: any[] = [];
  orders: any[] = [];
  orderItems: any[] = [];
  orderOtps: any[] = [];
  orderHistory: any[] = [];
  loyaltyPoints: any[] = [];
  loyaltyTransactions: any[] = [];
  foodSavings: any[] = [];
  coupons: any[] = [];
  subscriptions: any[] = [];
  surplusFood: any[] = [];
  inventoryTransactions: any[] = [];
  notifications: any[] = [];
  disputes: any[] = [];
  addresses: any[] = [];

  constructor() {
    this.seedDefaults();
  }

  seedDefaults() {
    this.users = SEED_DATA.users.map(u => ({
      ...u,
      password_hash: bcrypt.hashSync(u.password, 10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    this.sellers = SEED_DATA.sellers.map(s => ({
      ...s,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    this.categories = SEED_DATA.categories.map(c => ({
      ...c,
      is_active: 1,
      created_at: new Date().toISOString()
    }));

    this.foodItems = SEED_DATA.foodItems.map(f => ({
      ...f,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    this.coupons = SEED_DATA.coupons.map(c => ({
      ...c,
      created_at: new Date().toISOString()
    }));

    // Seed sample address for customer
    this.addresses = [
      {
        id: 'addr-1',
        customer_id: 'usr-cust-1',
        address_title: 'Campus Hostel Block B',
        full_address: 'Room 304, Kaveri Men\'s Hostel, North Campus',
        city: 'Campus Central',
        postal_code: '600001',
        phone: '+91 98765 44444',
        is_default: 1,
        created_at: new Date().toISOString()
      }
    ];

    // Seed customer loyalty points: 20 pts from 1 past day
    this.loyaltyPoints = [
      {
        id: 'lp-1',
        customer_id: 'usr-cust-1',
        total_points: 60,
        redeemed_points: 0,
        updated_at: new Date().toISOString()
      }
    ];

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const dayBefore = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];

    this.loyaltyTransactions = [
      {
        id: 'lt-1',
        customer_id: 'usr-cust-1',
        order_id: 'MM-SAMPLE-01',
        order_date: threeDaysAgo,
        points: 20,
        transaction_type: 'earned',
        description: 'Earned 20 points for Day 1 order',
        created_at: threeDaysAgo
      },
      {
        id: 'lt-2',
        customer_id: 'usr-cust-1',
        order_id: 'MM-SAMPLE-02',
        order_date: dayBefore,
        points: 20,
        transaction_type: 'earned',
        description: 'Earned 20 points for Day 2 order',
        created_at: dayBefore
      },
      {
        id: 'lt-3',
        customer_id: 'usr-cust-1',
        order_id: 'MM-SAMPLE-03',
        order_date: yesterday,
        points: 20,
        transaction_type: 'earned',
        description: 'Earned 20 points for Day 3 order',
        created_at: yesterday
      }
    ];

    // Seed a completed surplus order with verified savings
    this.foodSavings = [
      {
        id: 'fs-1',
        customer_id: 'usr-cust-1',
        order_id: 'MM-SAMPLE-01',
        food_item_id: 'smm-1',
        food_name: 'Surplus Chicken Biryani & Salan',
        seller_name: 'Campus Dhaba & Grills',
        image_url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
        original_price: 135,
        purchased_price: 75,
        money_saved: 60,
        quantity: 1,
        waste_diverted_kg: 0.45,
        created_at: threeDaysAgo
      },
      {
        id: 'fs-2',
        customer_id: 'usr-cust-1',
        order_id: 'MM-SAMPLE-02',
        food_item_id: 'smm-2',
        food_name: 'Surplus Paneer Makhani Rice Bowl',
        seller_name: 'Annapoorna Home Kitchen',
        image_url: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80',
        original_price: 105,
        purchased_price: 60,
        money_saved: 45,
        quantity: 1,
        waste_diverted_kg: 0.40,
        created_at: dayBefore
      }
    ];

    // Seed delivered sample order
    this.orders = [
      {
        id: 'ord-sample-1',
        order_number: 'MM1001',
        customer_id: 'usr-cust-1',
        seller_id: 'seller-1',
        subtotal: 90,
        item_discount: 20,
        coupon_discount: 0,
        loyalty_discount: 0,
        delivery_fee: 25,
        platform_fee: 5,
        final_total: 100,
        payment_method: 'COD',
        payment_status: 'Paid',
        order_status: 'Delivered',
        delivery_address_text: 'Room 304, Kaveri Men\'s Hostel, North Campus',
        cancellation_reason: null,
        created_at: threeDaysAgo,
        updated_at: threeDaysAgo
      }
    ];

    this.orderOtps = [
      {
        id: 'otp-1',
        order_id: 'ord-sample-1',
        plain_otp: '483921',
        otp_hash: bcrypt.hashSync('483921', 10),
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        verified_at: threeDaysAgo,
        failed_attempts: 0,
        created_at: threeDaysAgo
      }
    ];
  }
}

export const memoryStore = new MemoryStore();

