-- ====================================================================
-- MEALMATE – SMART CAMPUS FOOD DELIVERY PLATFORM
-- PRODUCTION MYSQL DATABASE SCHEMA (21 NORMALIZED TABLES)
-- DATABASE NAME: mealmate_db
-- ====================================================================

CREATE DATABASE IF NOT EXISTS mealmate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mealmate_db;

-- Disable foreign key checks during table setup
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------------------
-- 1. users: Central user authentication and profile store
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
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

-- --------------------------------------------------------------------
-- 2. user_addresses: Customer campus delivery locations
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS user_addresses;
CREATE TABLE user_addresses (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    address_title VARCHAR(80) NOT NULL,
    full_address TEXT NOT NULL,
    city VARCHAR(80) NOT NULL DEFAULT 'Campus',
    postal_code VARCHAR(20) NOT NULL DEFAULT '600001',
    phone VARCHAR(25) NOT NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_addr_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Compatible delivery_addresses view
DROP VIEW IF EXISTS delivery_addresses;
CREATE VIEW delivery_addresses AS 
SELECT id, user_id AS customer_id, address_title, full_address, city, postal_code, phone, is_default, created_at 
FROM user_addresses;

-- --------------------------------------------------------------------
-- 3. sellers: Verified campus kitchens and food providers
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS sellers;
CREATE TABLE sellers (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    kitchen_name VARCHAR(160) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_seller_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 4. food_categories: Breakfast, Lunch, Dinner, Combos, Quick Bites
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS food_categories;
CREATE TABLE food_categories (
    id VARCHAR(64) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 5. food_items: Master food menu catalogue (HomePlate, BudgetBite, SaveMyMeal)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS food_items;
CREATE TABLE food_items (
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
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES food_categories(id) ON DELETE RESTRICT,
    INDEX idx_food_seller (seller_id),
    INDEX idx_food_module (module),
    INDEX idx_food_type (food_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 6. food_inventory: Real-time stock levels, replenishment & thresholds
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS food_inventory;
CREATE TABLE food_inventory (
    id VARCHAR(64) PRIMARY KEY,
    food_item_id VARCHAR(64) NOT NULL UNIQUE,
    seller_id VARCHAR(64) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    minimum_threshold INT NOT NULL DEFAULT 5,
    last_restocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    INDEX idx_inventory_seller (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 7. carts: Customer shopping cart header
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS carts;
CREATE TABLE carts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    coupon_code VARCHAR(40) NULL,
    use_reward_points TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_cart_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 8. cart_items: Items inside customer shopping cart
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS cart_items;
CREATE TABLE cart_items (
    id VARCHAR(64) PRIMARY KEY,
    cart_id VARCHAR(64) NOT NULL,
    food_item_id VARCHAR(64) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
    UNIQUE KEY uk_cart_food (cart_id, food_item_id),
    INDEX idx_cart_items_cart (cart_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 9. orders: Master order header (COD, OTP delivery, fees & status)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
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
    delivery_otp VARCHAR(10) NOT NULL,
    otp_verified TINYINT(1) NOT NULL DEFAULT 0,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    INDEX idx_order_customer (customer_id),
    INDEX idx_order_seller (seller_id),
    INDEX idx_order_status (order_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 10. order_items: Line items in food orders with price snapshots
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
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
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_item_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 11. payments: Cash on Delivery payment transactions & confirmation
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS payments;
CREATE TABLE payments (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL UNIQUE,
    customer_id VARCHAR(64) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('COD') NOT NULL DEFAULT 'COD',
    payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
    received_at TIMESTAMP NULL,
    transaction_reference VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payment_order (order_id),
    INDEX idx_payment_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 12. subscriptions: HomePlate weekly & monthly meal plans
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS subscriptions;
CREATE TABLE subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL,
    seller_id VARCHAR(64) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    subscription_type ENUM('weekly', 'monthly') NOT NULL DEFAULT 'weekly',
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'All') NOT NULL DEFAULT 'Lunch',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    delivery_slot VARCHAR(60) NOT NULL DEFAULT '12:30 PM - 1:30 PM',
    status ENUM('Active', 'Paused', 'Cancelled', 'Expired', 'Completed') NOT NULL DEFAULT 'Active',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    INDEX idx_sub_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 13. subscription_orders: Daily scheduled meal deliveries
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS subscription_orders;
CREATE TABLE subscription_orders (
    id VARCHAR(64) PRIMARY KEY,
    subscription_id VARCHAR(64) NOT NULL,
    delivery_date DATE NOT NULL,
    meal_name VARCHAR(160) NOT NULL,
    delivery_status ENUM('Scheduled', 'Preparing', 'Out for Delivery', 'Delivered', 'Skipped') NOT NULL DEFAULT 'Scheduled',
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    INDEX idx_subord_sub (subscription_id),
    INDEX idx_subord_date (delivery_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 14. loyalty_points: Customer reward wallet balances
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS loyalty_points;
CREATE TABLE loyalty_points (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL UNIQUE,
    total_points INT NOT NULL DEFAULT 0,
    redeemed_points INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 15. loyalty_transactions: Points accrual and redemption audit trail
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS loyalty_transactions;
CREATE TABLE loyalty_transactions (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL,
    order_id VARCHAR(64),
    order_date DATE,
    points INT NOT NULL,
    transaction_type ENUM('earned', 'redeemed', 'expired') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_loyalty_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 16. coupons: Promotional campus discount vouchers
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS coupons;
CREATE TABLE coupons (
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

-- --------------------------------------------------------------------
-- 17. surplus_food: SaveMyMeal surplus flash sales & cutoff countdowns
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS surplus_food;
CREATE TABLE surplus_food (
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
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
    INDEX idx_surplus_seller (seller_id),
    INDEX idx_surplus_date (availability_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 18. surplus_orders: Rescued meal fulfillment & waste audit
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS surplus_orders;
CREATE TABLE surplus_orders (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    surplus_food_id VARCHAR(64) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    money_saved DECIMAL(10,2) NOT NULL,
    waste_diverted_kg DECIMAL(6,2) NOT NULL DEFAULT 0.40,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (surplus_food_id) REFERENCES surplus_food(id) ON DELETE CASCADE,
    INDEX idx_surpord_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 19. delivery_tracking: Real-time order progress & verification
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS delivery_tracking;
CREATE TABLE delivery_tracking (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL UNIQUE,
    delivery_person_name VARCHAR(100) DEFAULT 'Campus Delivery Buddy',
    delivery_person_phone VARCHAR(25) DEFAULT '+91 98765 00000',
    current_status VARCHAR(64) NOT NULL,
    location_note VARCHAR(255) DEFAULT 'Campus Food Hub',
    estimated_delivery_minutes INT DEFAULT 20,
    otp_verified TINYINT(1) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_track_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 20. reviews: Food item ratings, taste reviews and verified feedback
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS reviews;
CREATE TABLE reviews (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NULL,
    food_item_id VARCHAR(64) NOT NULL,
    customer_id VARCHAR(64) NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    rating INT NOT NULL DEFAULT 5,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_review_food (food_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 21. notifications: Campus platform system and order status alerts
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('order', 'loyalty', 'approval', 'general') NOT NULL DEFAULT 'order',
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- Supporting Tables: Food Savings, Disputes, OTPs & Status History
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS food_savings;
CREATE TABLE food_savings (
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
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_savings_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS disputes;
CREATE TABLE disputes (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    raised_by VARCHAR(64) NOT NULL,
    reason VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    resolution_status ENUM('pending', 'under_review', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (raised_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_dispute_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS order_otps;
CREATE TABLE order_otps (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL UNIQUE,
    plain_otp VARCHAR(10) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP NULL,
    failed_attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_otp_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS order_status_history;
CREATE TABLE order_status_history (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    old_status VARCHAR(64),
    new_status VARCHAR(64) NOT NULL,
    changed_by VARCHAR(64) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_history_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS inventory_transactions;
CREATE TABLE inventory_transactions (
    id VARCHAR(64) PRIMARY KEY,
    food_item_id VARCHAR(64) NOT NULL,
    order_id VARCHAR(64),
    quantity_changed INT NOT NULL,
    transaction_type ENUM('order_deduct', 'order_restore', 'seller_restock', 'spoilage_writeoff') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
