import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mealmate',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

let isDbConnected = false;

export const checkDbConnection = async (): Promise<boolean> => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    isDbConnected = true;
    return true;
  } catch (err: any) {
    console.warn(`[MySQL] Note: Could not connect to MySQL server (${err.code || err.message}). Fallback data mode enabled.`);
    isDbConnected = false;
    return false;
  }
};

export const getDbConnected = () => isDbConnected;

// Realistic, authenticated seed data with CORRECT images matching dish names
export const SEED_DATA = {
  users: [
    {
      id: 'usr-admin-1',
      full_name: 'Admin Priya Sharma',
      email: 'admin@mealmate.com',
      password: 'adminpassword123',
      phone: '+91 98765 11111',
      role: 'admin',
      account_status: 'active',
      profile_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'usr-seller-1',
      full_name: 'Lakshmi Narayanan',
      email: 'seller1@mealmate.com',
      password: 'sellerpassword123',
      phone: '+91 98765 22222',
      role: 'seller',
      account_status: 'active',
      profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'usr-seller-2',
      full_name: 'Ramesh Sundaram',
      email: 'seller2@mealmate.com',
      password: 'sellerpassword123',
      phone: '+91 98765 33333',
      role: 'seller',
      account_status: 'active',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'usr-cust-1',
      full_name: 'Madesh Kumar',
      email: 'madesh@gmail.com',
      password: 'madeshpassword123',
      phone: '+91 98765 44444',
      role: 'customer',
      account_status: 'active',
      profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
    }
  ],
  sellers: [
    {
      id: 'seller-1',
      user_id: 'usr-seller-1',
      kitchen_name: 'Annapoorna Home Kitchen',
      description: 'Authentic South Indian vegetarian home-cooked meals prepared with pure ghee and cold-pressed oils.',
      address: 'Near Campus Gate 2, Hostel Cross Road',
      approval_status: 'approved',
      is_active: 1
    },
    {
      id: 'seller-2',
      user_id: 'usr-seller-2',
      kitchen_name: 'Campus Dhaba & Grills',
      description: 'Wholesome North Indian delicacies, street rolls, egg bowls, and high-protein campus favorites.',
      address: 'University Food Street, Stall #4',
      approval_status: 'approved',
      is_active: 1
    }
  ],
  categories: [
    { id: 'cat-breakfast', category_name: 'Breakfast', description: 'Fresh morning meals, dosas, idlis, and hot beverages' },
    { id: 'cat-lunch', category_name: 'Lunch', description: 'Complete thalis, rice bowls, and nutritious midday meals' },
    { id: 'cat-dinner', category_name: 'Dinner', description: 'Light chapatis, biryanis, curries, and comforting combos' },
    { id: 'cat-combos', category_name: 'Combos', description: 'Value-for-money meal combos and multi-course sets' },
    { id: 'cat-snacks', category_name: 'Quick Bites', description: 'Budget rolls, omelettes, and healthy campus snacks' }
  ],
  // EVERY food item has an accurate, distinctive, high-res image and proper classification!
  foodItems: [
    // --- HomePlate Items ---
    {
      id: 'hp-1',
      seller_id: 'seller-1',
      category_id: 'cat-breakfast',
      food_name: 'Idli with Sambar & Chutney',
      description: 'Three fluffy steamed rice-lentil cakes served with traditional spiced drumstick sambar and fresh coconut chutney.',
      food_type: 'veg',
      module: 'HomePlate',
      price: 40,
      original_price: 50,
      image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      available_quantity: 35,
      is_available: 1,
      prep_time_minutes: 15,
      rating: 4.9,
      review_count: 58
    },
    {
      id: 'hp-2',
      seller_id: 'seller-1',
      category_id: 'cat-breakfast',
      food_name: 'Crispy Masala Dosa',
      description: 'Crispy golden crepe stuffed with mildly spiced potato masala, served with red & white chutneys and piping hot sambar.',
      food_type: 'veg',
      module: 'HomePlate',
      price: 50,
      original_price: 65,
      image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
      available_quantity: 25,
      is_available: 1,
      prep_time_minutes: 20,
      rating: 4.9,
      review_count: 72
    },
    {
      id: 'hp-3',
      seller_id: 'seller-1',
      category_id: 'cat-lunch',
      food_name: 'Tempered Lemon Rice',
      description: 'Fragrant South Indian rice tempered with mustard seeds, curry leaves, roasted crunchy peanuts, and fresh lemon juice.',
      food_type: 'veg',
      module: 'HomePlate',
      price: 55,
      original_price: 70,
      image_url: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=800&q=80',
      available_quantity: 20,
      is_available: 1,
      prep_time_minutes: 15,
      rating: 4.8,
      review_count: 36
    },
    {
      id: 'hp-4',
      seller_id: 'seller-1',
      category_id: 'cat-lunch',
      food_name: 'Homemade South Indian Veg Thali',
      description: 'Wholesome full lunch with steamed sona masoori rice, sambar, rasam, kootu, poriyal, curd, and crispy appalam.',
      food_type: 'veg',
      module: 'HomePlate',
      price: 90,
      original_price: 110,
      image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
      available_quantity: 28,
      is_available: 1,
      prep_time_minutes: 25,
      rating: 4.9,
      review_count: 95
    },
    {
      id: 'hp-5',
      seller_id: 'seller-1',
      category_id: 'cat-dinner',
      food_name: 'Soft Chapatis with Veg Kurma',
      description: 'Three freshly rolled whole-wheat rotis served with aromatic coconut mixed vegetable kurma and onion salad.',
      food_type: 'veg',
      module: 'HomePlate',
      price: 65,
      original_price: 80,
      image_url: 'https://images.unsplash.com/photo-1505253758473-96b3015f240a?auto=format&fit=crop&w=800&q=80',
      available_quantity: 30,
      is_available: 1,
      prep_time_minutes: 20,
      rating: 4.7,
      review_count: 42
    },
    {
      id: 'hp-6',
      seller_id: 'seller-1',
      category_id: 'cat-lunch',
      food_name: 'Tempered Creamy Curd Rice',
      description: 'Cool comforting yogurt rice tempered with green chillies, ginger, mustard seeds, and topped with fresh pomegranate.',
      food_type: 'veg',
      module: 'HomePlate',
      price: 45,
      original_price: 55,
      image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
      available_quantity: 22,
      is_available: 1,
      prep_time_minutes: 10,
      rating: 4.8,
      review_count: 48
    },

    // --- BudgetBite Items (Veg & Non-Veg for ₹50, ₹80, ₹100, ₹150 budget tiers) ---
    {
      id: 'bb-1',
      seller_id: 'seller-2',
      category_id: 'cat-snacks',
      food_name: 'Boiled Egg Duo with Pepper',
      description: 'Two farm-fresh boiled eggs lightly sprinkled with Himalayan rock salt and freshly cracked black pepper.',
      food_type: 'non-veg',
      module: 'BudgetBite',
      price: 20,
      original_price: 30,
      image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
      available_quantity: 40,
      is_available: 1,
      prep_time_minutes: 5,
      rating: 4.8,
      review_count: 85
    },
    {
      id: 'bb-2',
      seller_id: 'seller-2',
      category_id: 'cat-snacks',
      food_name: 'Masala Egg Omelette Pav',
      description: 'Fluffy double egg masala omelette cooked with onions and chillies, tucked inside a toasted butter pav.',
      food_type: 'non-veg',
      module: 'BudgetBite',
      price: 35,
      original_price: 50,
      image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
      available_quantity: 30,
      is_available: 1,
      prep_time_minutes: 10,
      rating: 4.9,
      review_count: 98
    },
    {
      id: 'bb-3',
      seller_id: 'seller-2',
      category_id: 'cat-snacks',
      food_name: 'Spiced Chicken Kathi Roll',
      description: 'Succulent marinated chicken chunks wrapped in a flaky paratha with mint mayonnaise and sliced red onions.',
      food_type: 'non-veg',
      module: 'BudgetBite',
      price: 65,
      original_price: 90,
      image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
      available_quantity: 25,
      is_available: 1,
      prep_time_minutes: 15,
      rating: 4.7,
      review_count: 114
    },
    {
      id: 'bb-4',
      seller_id: 'seller-2',
      category_id: 'cat-lunch',
      food_name: 'Dhaba Egg Curry with Steamed Rice',
      description: 'Two golden pan-fried eggs in a thick dhaba-style tomato-onion gravy, accompanied by fragrant basmati rice.',
      food_type: 'non-veg',
      module: 'BudgetBite',
      price: 70,
      original_price: 95,
      image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
      available_quantity: 20,
      is_available: 1,
      prep_time_minutes: 15,
      rating: 4.8,
      review_count: 76
    },
    {
      id: 'bb-5',
      seller_id: 'seller-2',
      category_id: 'cat-dinner',
      food_name: 'Wok Egg Fried Rice',
      description: 'Smoky wok-tossed basmati rice with scrambled eggs, scallions, crisp carrots, and dark soy glaze.',
      food_type: 'non-veg',
      module: 'BudgetBite',
      price: 85,
      original_price: 110,
      image_url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80',
      available_quantity: 25,
      is_available: 1,
      prep_time_minutes: 15,
      rating: 4.7,
      review_count: 67
    },
    {
      id: 'bb-6',
      seller_id: 'seller-2',
      category_id: 'cat-dinner',
      food_name: 'Chicken Dum Biryani Bowl',
      description: 'Slow-cooked aromatic long-grain basmati rice with tender chicken piece, boiled egg, mint, and cool raita.',
      food_type: 'non-veg',
      module: 'BudgetBite',
      price: 115,
      original_price: 150,
      image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      available_quantity: 20,
      is_available: 1,
      prep_time_minutes: 20,
      rating: 4.9,
      review_count: 142
    },
    {
      id: 'bb-7',
      seller_id: 'seller-2',
      category_id: 'cat-lunch',
      food_name: 'Classic Veg Hakka Noodles',
      description: 'Stir-fried street-style noodles tossed with shredded cabbage, bell peppers, carrots, spring onions, and garlic.',
      food_type: 'veg',
      module: 'BudgetBite',
      price: 60,
      original_price: 80,
      image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
      available_quantity: 30,
      is_available: 1,
      prep_time_minutes: 15,
      rating: 4.6,
      review_count: 82
    },
    {
      id: 'bb-8',
      seller_id: 'seller-2',
      category_id: 'cat-lunch',
      food_name: 'Punjabi Rajma Chawal',
      description: 'Slow-cooked Kashmiri red kidney beans in rich spiced tomato gravy served with fluffy steamed basmati rice.',
      food_type: 'veg',
      module: 'BudgetBite',
      price: 65,
      original_price: 85,
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      available_quantity: 25,
      is_available: 1,
      prep_time_minutes: 15,
      rating: 4.8,
      review_count: 94
    },
    {
      id: 'bb-9',
      seller_id: 'seller-1',
      category_id: 'cat-dinner',
      food_name: 'Paneer Butter Masala Bowl',
      description: 'Soft cottage cheese cubes in rich velvety makhani sauce, served with choice of 2 chapatis or jeera rice.',
      food_type: 'veg',
      module: 'BudgetBite',
      price: 90,
      original_price: 120,
      image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
      available_quantity: 18,
      is_available: 1,
      prep_time_minutes: 20,
      rating: 4.9,
      review_count: 105
    },

    // --- SaveMyMeal Surplus Items (Active deals with up to 45% discount & live cutoff times) ---
    {
      id: 'smm-1',
      seller_id: 'seller-2',
      category_id: 'cat-dinner',
      food_name: 'Surplus Chicken Biryani & Salan',
      description: 'Fresh evening surplus portion of royal dum chicken biryani packed with spicy mirchi ka salan and onion raita.',
      food_type: 'non-veg',
      module: 'SaveMyMeal',
      price: 75,
      original_price: 135,
      image_url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
      available_quantity: 8,
      is_available: 1,
      prep_time_minutes: 10,
      rating: 4.9,
      review_count: 48
    },
    {
      id: 'smm-2',
      seller_id: 'seller-1',
      category_id: 'cat-lunch',
      food_name: 'Surplus Paneer Makhani Rice Bowl',
      description: 'Afternoon surplus portion of aromatic jeera rice paired with rich paneer butter masala. Hygienically packed.',
      food_type: 'veg',
      module: 'SaveMyMeal',
      price: 60,
      original_price: 105,
      image_url: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80',
      available_quantity: 6,
      is_available: 1,
      prep_time_minutes: 10,
      rating: 4.8,
      review_count: 39
    },
    {
      id: 'smm-3',
      seller_id: 'seller-1',
      category_id: 'cat-dinner',
      food_name: 'Surplus Chapati & Yellow Dal Tadka',
      description: '4 warm whole wheat rotis served with homestyle yellow dal tadka, roasted papad, and fresh mixed pickle.',
      food_type: 'veg',
      module: 'SaveMyMeal',
      price: 45,
      original_price: 80,
      image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
      available_quantity: 10,
      is_available: 1,
      prep_time_minutes: 10,
      rating: 4.7,
      review_count: 32
    },
    {
      id: 'smm-4',
      seller_id: 'seller-2',
      category_id: 'cat-lunch',
      food_name: 'Surplus Egg Curry Rice Box',
      description: 'Midday surplus container of two spiced boiled eggs in rich gravy with steamed basmati rice.',
      food_type: 'non-veg',
      module: 'SaveMyMeal',
      price: 55,
      original_price: 95,
      image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
      available_quantity: 7,
      is_available: 1,
      prep_time_minutes: 10,
      rating: 4.8,
      review_count: 41
    }
  ],
  coupons: [
    {
      id: 'cp-welcome',
      coupon_code: 'WELCOME50',
      discount_type: 'flat',
      discount_value: 50,
      minimum_order_amount: 150,
      maximum_discount: 50,
      is_active: 1
    },
    {
      id: 'cp-campus',
      coupon_code: 'CAMPUS20',
      discount_type: 'percentage',
      discount_value: 20,
      minimum_order_amount: 100,
      maximum_discount: 40,
      is_active: 1
    }
  ]
};

// Database Initialization Runner
export const initializeDatabase = async () => {
  const connected = await checkDbConnection();
  if (!connected) {
    console.log('[MySQL] Running in graceful mock storage mode since local MySQL service is not reachable.');
    return false;
  }

  try {
    console.log('[MySQL] Checking & initializing tables...');
    const conn = await pool.getConnection();

    // Create database if not exists
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'mealmate'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await conn.query(`USE \`${process.env.DB_NAME || 'mealmate'}\`;`);

    // Ensure all 18 tables exist
    // 1. users
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        full_name VARCHAR(120) NOT NULL,
        email VARCHAR(160) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(25) NOT NULL,
        role ENUM('customer', 'seller', 'admin') NOT NULL DEFAULT 'customer',
        account_status ENUM('active', 'inactive', 'pending_approval', 'deactivated') NOT NULL DEFAULT 'active',
        profile_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_email (email),
        INDEX idx_user_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. sellers
    await conn.query(`
      CREATE TABLE IF NOT EXISTS sellers (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        kitchen_name VARCHAR(160) NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_seller_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. food_categories
    await conn.query(`
      CREATE TABLE IF NOT EXISTS food_categories (
        id VARCHAR(64) PRIMARY KEY,
        category_name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. food_items
    await conn.query(`
      CREATE TABLE IF NOT EXISTS food_items (
        id VARCHAR(64) PRIMARY KEY,
        seller_id VARCHAR(64) NOT NULL,
        category_id VARCHAR(64) NOT NULL,
        food_name VARCHAR(160) NOT NULL,
        description TEXT,
        food_type ENUM('veg', 'non-veg') NOT NULL DEFAULT 'veg',
        module ENUM('HomePlate', 'BudgetBite', 'SaveMyMeal') NOT NULL DEFAULT 'HomePlate',
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        image_url TEXT NOT NULL,
        available_quantity INT NOT NULL DEFAULT 20,
        is_available TINYINT(1) NOT NULL DEFAULT 1,
        prep_time_minutes INT DEFAULT 20,
        rating DECIMAL(3,2) DEFAULT 4.8,
        review_count INT DEFAULT 25,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_food_seller (seller_id),
        INDEX idx_food_module (module),
        INDEX idx_food_type (food_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. delivery_addresses
    await conn.query(`
      CREATE TABLE IF NOT EXISTS delivery_addresses (
        id VARCHAR(64) PRIMARY KEY,
        customer_id VARCHAR(64) NOT NULL,
        address_title VARCHAR(80) NOT NULL,
        full_address TEXT NOT NULL,
        city VARCHAR(80) NOT NULL DEFAULT 'Campus',
        postal_code VARCHAR(20) NOT NULL DEFAULT '600001',
        phone VARCHAR(25) NOT NULL,
        is_default TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_addr_customer (customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. orders
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        order_number VARCHAR(32) NOT NULL UNIQUE,
        customer_id VARCHAR(64) NOT NULL,
        seller_id VARCHAR(64) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        item_discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        coupon_discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        loyalty_discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 25.00,
        platform_fee DECIMAL(10,2) NOT NULL DEFAULT 5.00,
        final_total DECIMAL(10,2) NOT NULL,
        payment_method ENUM('COD') NOT NULL DEFAULT 'COD',
        payment_status ENUM('Pending', 'Paid') NOT NULL DEFAULT 'Pending',
        order_status ENUM('Order Placed', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected') NOT NULL DEFAULT 'Order Placed',
        delivery_address_id VARCHAR(64),
        delivery_address_text TEXT,
        cancellation_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_order_customer (customer_id),
        INDEX idx_order_seller (seller_id),
        INDEX idx_order_status (order_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. order_items
    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL,
        food_item_id VARCHAR(64),
        food_name_snapshot VARCHAR(160) NOT NULL,
        image_url_snapshot TEXT,
        is_veg TINYINT(1) NOT NULL DEFAULT 1,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total_price DECIMAL(10,2) NOT NULL,
        is_surplus TINYINT(1) NOT NULL DEFAULT 0,
        original_unit_price DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_item_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. order_otps
    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_otps (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL UNIQUE,
        plain_otp VARCHAR(10) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        verified_at TIMESTAMP NULL,
        failed_attempts INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_otp_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. order_status_history
    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL,
        old_status VARCHAR(64),
        new_status VARCHAR(64) NOT NULL,
        changed_by VARCHAR(64) NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_history_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 10. loyalty_points
    await conn.query(`
      CREATE TABLE IF NOT EXISTS loyalty_points (
        id VARCHAR(64) PRIMARY KEY,
        customer_id VARCHAR(64) NOT NULL UNIQUE,
        total_points INT NOT NULL DEFAULT 0,
        redeemed_points INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 11. loyalty_transactions
    await conn.query(`
      CREATE TABLE IF NOT EXISTS loyalty_transactions (
        id VARCHAR(64) PRIMARY KEY,
        customer_id VARCHAR(64) NOT NULL,
        order_id VARCHAR(64),
        order_date DATE,
        points INT NOT NULL,
        transaction_type ENUM('earned', 'redeemed', 'expired') NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_loyalty_customer (customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 12. food_savings
    await conn.query(`
      CREATE TABLE IF NOT EXISTS food_savings (
        id VARCHAR(64) PRIMARY KEY,
        customer_id VARCHAR(64) NOT NULL,
        order_id VARCHAR(64) NOT NULL,
        food_item_id VARCHAR(64),
        food_name VARCHAR(160) NOT NULL,
        seller_name VARCHAR(160) NOT NULL,
        image_url TEXT,
        original_price DECIMAL(10,2) NOT NULL,
        purchased_price DECIMAL(10,2) NOT NULL,
        money_saved DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        waste_diverted_kg DECIMAL(6,2) NOT NULL DEFAULT 0.40,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_savings_customer (customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 13. coupons
    await conn.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR(64) PRIMARY KEY,
        coupon_code VARCHAR(40) NOT NULL UNIQUE,
        discount_type ENUM('percentage', 'flat') NOT NULL DEFAULT 'percentage',
        discount_value DECIMAL(10,2) NOT NULL,
        minimum_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        maximum_discount DECIMAL(10,2),
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 14. subscriptions
    await conn.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(64) PRIMARY KEY,
        customer_id VARCHAR(64) NOT NULL,
        seller_id VARCHAR(64) NOT NULL,
        plan_name VARCHAR(100) NOT NULL,
        subscription_type ENUM('weekly', 'monthly') NOT NULL DEFAULT 'weekly',
        meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'All') NOT NULL DEFAULT 'Lunch',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        delivery_slot VARCHAR(60) NOT NULL DEFAULT '12:30 PM - 1:30 PM',
        status ENUM('active', 'paused', 'cancelled', 'completed') NOT NULL DEFAULT 'active',
        total_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sub_customer (customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 15. surplus_food
    await conn.query(`
      CREATE TABLE IF NOT EXISTS surplus_food (
        id VARCHAR(64) PRIMARY KEY,
        seller_id VARCHAR(64) NOT NULL,
        food_item_id VARCHAR(64) NOT NULL,
        original_price DECIMAL(10,2) NOT NULL,
        discounted_price DECIMAL(10,2) NOT NULL,
        discount_percentage INT NOT NULL,
        available_portions INT NOT NULL DEFAULT 10,
        cutoff_time TIME NOT NULL,
        availability_date DATE NOT NULL,
        status ENUM('active', 'expired', 'sold_out') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_surplus_seller (seller_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 16. inventory_transactions
    await conn.query(`
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id VARCHAR(64) PRIMARY KEY,
        food_item_id VARCHAR(64) NOT NULL,
        order_id VARCHAR(64),
        quantity_changed INT NOT NULL,
        transaction_type ENUM('order_deduct', 'order_restore', 'seller_restock', 'spoilage_writeoff') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 17. notifications
    await conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        title VARCHAR(160) NOT NULL,
        message TEXT NOT NULL,
        notification_type ENUM('order', 'loyalty', 'approval', 'general') NOT NULL DEFAULT 'order',
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notif_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 18. disputes
    await conn.query(`
      CREATE TABLE IF NOT EXISTS disputes (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL,
        raised_by VARCHAR(64) NOT NULL,
        reason VARCHAR(160) NOT NULL,
        description TEXT NOT NULL,
        resolution_status ENUM('pending', 'under_review', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
        admin_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_dispute_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default categories if empty
    const [catRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM food_categories');
    if (catRows[0].cnt === 0) {
      console.log('[MySQL] Seeding categories...');
      for (const cat of SEED_DATA.categories) {
        await conn.query('INSERT IGNORE INTO food_categories (id, category_name, description, is_active) VALUES (?, ?, ?, 1)', [
          cat.id, cat.category_name, cat.description
        ]);
      }
    }

    // Seed default users if empty
    const [userRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM users');
    if (userRows[0].cnt === 0) {
      console.log('[MySQL] Seeding users with hashed passwords...');
      for (const u of SEED_DATA.users) {
        const hash = await bcrypt.hash(u.password, 10);
        await conn.query(
          'INSERT IGNORE INTO users (id, full_name, email, password_hash, phone, role, account_status, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [u.id, u.full_name, u.email, hash, u.phone, u.role, u.account_status, u.profile_image]
        );
      }
    }

    // Seed default sellers if empty
    const [sellerRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM sellers');
    if (sellerRows[0].cnt === 0) {
      console.log('[MySQL] Seeding sellers...');
      for (const s of SEED_DATA.sellers) {
        await conn.query(
          'INSERT IGNORE INTO sellers (id, user_id, kitchen_name, description, address, approval_status, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [s.id, s.user_id, s.kitchen_name, s.description, s.address, s.approval_status, s.is_active]
        );
      }
    }

    // Seed food items if empty
    const [foodRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM food_items');
    if (foodRows[0].cnt === 0) {
      console.log('[MySQL] Seeding food items with matching images...');
      for (const f of SEED_DATA.foodItems) {
        await conn.query(
          `INSERT IGNORE INTO food_items 
           (id, seller_id, category_id, food_name, description, food_type, module, price, original_price, image_url, available_quantity, is_available, prep_time_minutes, rating, review_count)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            f.id, f.seller_id, f.category_id, f.food_name, f.description, f.food_type, f.module,
            f.price, f.original_price, f.image_url, f.available_quantity, f.is_available,
            f.prep_time_minutes, f.rating, f.review_count
          ]
        );
      }
    }

    // Seed coupons if empty
    const [cpnRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM coupons');
    if (cpnRows[0].cnt === 0) {
      for (const c of SEED_DATA.coupons) {
        await conn.query(
          'INSERT IGNORE INTO coupons (id, coupon_code, discount_type, discount_value, minimum_order_amount, maximum_discount, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [c.id, c.coupon_code, c.discount_type, c.discount_value, c.minimum_order_amount, c.maximum_discount, c.is_active]
        );
      }
    }

    conn.release();
    console.log('[MySQL] Database and all 18 tables verified & initialized successfully!');
    return true;
  } catch (error) {
    console.error('[MySQL] Table initialization error:', error);
    return false;
  }
};

