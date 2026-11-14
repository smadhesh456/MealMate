-- ====================================================================
-- MEALMATE – SMART CAMPUS FOOD DELIVERY PLATFORM
-- PRODUCTION DATABASE SEED SCRIPT
-- DATABASE: mealmate_db
-- ====================================================================

USE mealmate_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. SEED USERS (bcrypt hash for passwords, e.g. madeshpassword123, sellerpassword123, adminpassword123)
INSERT INTO users (id, full_name, email, password_hash, phone, role, account_status, profile_image) VALUES
('usr-admin-1', 'Admin Priya Sharma', 'admin@mealmate.com', '$2b$10$vB.oB2SXZ8beQxbQWxa5beNbQwW3zGhm0gq/JuWILi4WHJAL3unpC', '+91 98765 11111', 'admin', 'active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'),
('usr-seller-1', 'Lakshmi Narayanan', 'seller1@mealmate.com', '$2b$10$QvbjKj2RBNf2Fy1aytbi4uU3BJMQbrQNgP0keCEUYu4xaXJDxwfm6', '+91 98765 22222', 'seller', 'active', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'),
('usr-seller-2', 'Ramesh Sundaram', 'seller2@mealmate.com', '$2b$10$QvbjKj2RBNf2Fy1aytbi4uU3BJMQbrQNgP0keCEUYu4xaXJDxwfm6', '+91 98765 33333', 'seller', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'),
('usr-cust-1', 'Madesh Kumar', 'madesh@gmail.com', '$2b$10$7omlXi9Z8ByUhzlNMaHxBOIPBwdxeF6kTd45fbCdebzNR3Ri8w2Vq', '+91 98765 44444', 'customer', 'active', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), password_hash=VALUES(password_hash);

-- 2. SEED USER ADDRESSES
INSERT INTO user_addresses (id, user_id, address_title, full_address, city, postal_code, phone, is_default) VALUES
('addr-1', 'usr-cust-1', 'Hostel Room', 'Room 304, Kaveri Hostel Block B, Main Campus', 'Campus', '600001', '+91 98765 44444', 1),
('addr-2', 'usr-cust-1', 'Department Lab', 'Lab 201, Computer Science Building, 2nd Floor', 'Campus', '600001', '+91 98765 44444', 0)
ON DUPLICATE KEY UPDATE full_address=VALUES(full_address);

-- 3. SEED SELLERS
INSERT INTO sellers (id, user_id, kitchen_name, description, address, approval_status, is_active) VALUES
('seller-1', 'usr-seller-1', 'Annapoorna Home Kitchen', 'Authentic South Indian vegetarian home-cooked meals prepared with pure ghee and cold-pressed oils.', 'Near Campus Gate 2, Hostel Cross Road', 'approved', 1),
('seller-2', 'usr-seller-2', 'Campus Dhaba & Grills', 'Wholesome North Indian delicacies, street rolls, egg bowls, and high-protein campus favorites.', 'University Food Street, Stall #4', 'approved', 1)
ON DUPLICATE KEY UPDATE kitchen_name=VALUES(kitchen_name);

-- 4. SEED FOOD CATEGORIES
INSERT INTO food_categories (id, category_name, description, is_active) VALUES
('cat-breakfast', 'Breakfast', 'Fresh morning meals, dosas, idlis, and hot beverages', 1),
('cat-lunch', 'Lunch', 'Complete thalis, rice bowls, and nutritious midday meals', 1),
('cat-dinner', 'Dinner', 'Light chapatis, biryanis, curries, and comforting combos', 1),
('cat-combos', 'Combos', 'Value-for-money meal combos and multi-course sets', 1),
('cat-snacks', 'Quick Bites', 'Budget rolls, omelettes, and healthy campus snacks', 1)
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);

-- 5. SEED FOOD ITEMS
INSERT INTO food_items (id, seller_id, category_id, food_name, description, food_type, module, price, original_price, image_url, available_quantity, is_available, prep_time_minutes, rating, review_count) VALUES
-- HomePlate Items
('hp-1', 'seller-1', 'cat-breakfast', 'Idli with Sambar & Chutney', 'Three fluffy steamed rice-lentil cakes served with traditional spiced drumstick sambar and fresh coconut chutney.', 'veg', 'HomePlate', 40.00, 50.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', 35, 1, 15, 4.90, 58),
('hp-2', 'seller-1', 'cat-breakfast', 'Crispy Masala Dosa', 'Crispy golden crepe stuffed with mildly spiced potato masala, served with red & white chutneys and piping hot sambar.', 'veg', 'HomePlate', 50.00, 65.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80', 25, 1, 20, 4.90, 72),
('hp-3', 'seller-1', 'cat-lunch', 'Tempered Lemon Rice', 'Fragrant South Indian rice tempered with mustard seeds, curry leaves, roasted crunchy peanuts, and fresh lemon juice.', 'veg', 'HomePlate', 50.00, 60.00, 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=800&q=80', 20, 1, 15, 4.80, 41),
('hp-4', 'seller-1', 'cat-lunch', 'Traditional South Indian Thali', 'Full midday meal with steamed ponni rice, sambar, rasam, kootu, poriyal, curd, appalam, and homemade pickle.', 'veg', 'HomePlate', 90.00, 120.00, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80', 30, 1, 25, 4.95, 94),
('hp-5', 'seller-1', 'cat-dinner', 'Phulka Chapati & Dal Tadka', 'Three soft whole wheat phulkas served with yellow dal tempered in pure ghee with cumin, garlic, and fresh coriander.', 'veg', 'HomePlate', 65.00, 80.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', 30, 1, 20, 4.85, 52),
('hp-6', 'seller-2', 'cat-lunch', 'Paneer Butter Masala Combo', 'Rich cottage cheese cubes simmered in creamy tomato-cashew gravy, served with 2 butter naans or jeera rice.', 'veg', 'HomePlate', 110.00, 140.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', 18, 1, 25, 4.90, 67),
('hp-7', 'seller-2', 'cat-dinner', 'Ambur Chicken Dum Biryani', 'Aromatic seeraga samba rice cooked with tender marinated chicken pieces, whole spices, mint, and boiled egg.', 'non-veg', 'HomePlate', 130.00, 160.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', 25, 1, 25, 4.92, 115),

-- BudgetBite Items (strictly capped ₹50 - ₹150)
('bb-1', 'seller-1', 'cat-breakfast', 'Ghee Podi Idli (4 pcs)', 'Mini steamed idlis tossed in gun-powder spice blend and aromatic country ghee, served with coconut chutney.', 'veg', 'BudgetBite', 45.00, 55.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', 25, 1, 15, 4.85, 38),
('bb-2', 'seller-2', 'cat-snacks', 'Double Egg Roll', 'Flaky whole wheat paratha wrapped around two fluffy spiced eggs, sliced crunchy onions, and zesty green mint sauce.', 'non-veg', 'BudgetBite', 50.00, 65.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80', 40, 1, 15, 4.90, 89),
('bb-3', 'seller-1', 'cat-lunch', 'Curd Rice with Pomegranate', 'Creamy seasoned curd rice tempered with mustard, green chillies, ginger, and garnished with sweet ruby pomegranate.', 'veg', 'BudgetBite', 45.00, 55.00, 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=800&q=80', 20, 1, 10, 4.80, 29),
('bb-4', 'seller-2', 'cat-snacks', 'Paneer Kathi Roll', 'Grilled spiced paneer cubes rolled inside a flaky paratha with bell peppers, tangy masala onions, and mint dip.', 'veg', 'BudgetBite', 65.00, 80.00, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80', 30, 1, 15, 4.88, 64),
('bb-5', 'seller-2', 'cat-dinner', 'Egg Fried Rice Bowl', 'Wok-tossed basmati rice with scrambled farm eggs, spring onions, shredded carrots, and dark soy garlic seasoning.', 'non-veg', 'BudgetBite', 80.00, 95.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', 25, 1, 20, 4.86, 47),
('bb-6', 'seller-2', 'cat-lunch', 'Chicken Fried Rice & Sauce', 'Classic wok tossed chicken fried rice with tender diced chicken, vegetables, scrambled eggs, and spicy schezwan sauce.', 'non-veg', 'BudgetBite', 95.00, 120.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', 22, 1, 20, 4.90, 78),

-- SaveMyMeal Surplus Items (Discounted surplus fresh meals)
('smm-1', 'seller-2', 'cat-lunch', 'Surplus Chicken Biryani & Salan', 'Fresh afternoon batch of authentic chicken biryani rescued before evening rush. Served with spiced brinjal salan and onion raita.', 'non-veg', 'SaveMyMeal', 75.00, 135.00, 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80', 8, 1, 10, 4.95, 84),
('smm-2', 'seller-1', 'cat-dinner', 'Evening Chapati Curry Surplus Set', 'Four fresh whole wheat tawa chapatis with mixed vegetable kurma and dal fry, freshly prepared today.', 'veg', 'SaveMyMeal', 45.00, 80.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', 12, 1, 10, 4.88, 36),
('smm-3', 'seller-2', 'cat-lunch', 'Surplus Paneer Butter Masala Bowl', 'Creamy butter masala with 2 flaky parathas and steamed jeera rice portion at maximum discount.', 'veg', 'SaveMyMeal', 65.00, 115.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', 6, 1, 10, 4.90, 45)
ON DUPLICATE KEY UPDATE food_name=VALUES(food_name);

-- 6. SEED FOOD INVENTORY
INSERT INTO food_inventory (id, food_item_id, seller_id, current_stock, minimum_threshold) VALUES
('inv-hp-1', 'hp-1', 'seller-1', 35, 5),
('inv-hp-2', 'hp-2', 'seller-1', 25, 5),
('inv-hp-3', 'hp-3', 'seller-1', 20, 5),
('inv-hp-4', 'hp-4', 'seller-1', 30, 5),
('inv-hp-5', 'hp-5', 'seller-1', 30, 5),
('inv-hp-6', 'hp-6', 'seller-2', 18, 4),
('inv-hp-7', 'hp-7', 'seller-2', 25, 5),
('inv-bb-1', 'bb-1', 'seller-1', 25, 5),
('inv-bb-2', 'bb-2', 'seller-2', 40, 6),
('inv-bb-3', 'bb-3', 'seller-1', 20, 4),
('inv-bb-4', 'bb-4', 'seller-2', 30, 5),
('inv-bb-5', 'bb-5', 'seller-2', 25, 5),
('inv-bb-6', 'bb-6', 'seller-2', 22, 5),
('inv-smm-1', 'smm-1', 'seller-2', 8, 2),
('inv-smm-2', 'smm-2', 'seller-1', 12, 2),
('inv-smm-3', 'smm-3', 'seller-2', 6, 2)
ON DUPLICATE KEY UPDATE current_stock=VALUES(current_stock);

-- 7. SEED COUPONS
INSERT INTO coupons (id, coupon_code, discount_type, discount_value, minimum_order_amount, maximum_discount, is_active) VALUES
('cpn-1', 'WELCOME50', 'flat', 50.00, 150.00, 50.00, 1),
('cpn-2', 'CAMPUS20', 'percentage', 20.00, 100.00, 40.00, 1),
('cpn-3', 'BITE15', 'percentage', 15.00, 80.00, 30.00, 1),
('cpn-4', 'SAVER10', 'flat', 10.00, 50.00, 10.00, 1)
ON DUPLICATE KEY UPDATE discount_value=VALUES(discount_value);

-- 8. SEED SURPLUS FOOD FLASH LISTINGS
INSERT INTO surplus_food (id, seller_id, food_item_id, original_price, discounted_price, discount_percentage, available_portions, cutoff_time, availability_date, status) VALUES
('surp-1', 'seller-2', 'smm-1', 135.00, 75.00, 44, 8, '22:00:00', CURDATE(), 'active'),
('surp-2', 'seller-1', 'smm-2', 80.00, 45.00, 44, 12, '21:30:00', CURDATE(), 'active'),
('surp-3', 'seller-2', 'smm-3', 115.00, 65.00, 43, 6, '22:00:00', CURDATE(), 'active')
ON DUPLICATE KEY UPDATE discounted_price=VALUES(discounted_price);

-- 9. SEED LOYALTY POINTS
INSERT INTO loyalty_points (id, customer_id, total_points, redeemed_points) VALUES
('lp-1', 'usr-cust-1', 120, 100)
ON DUPLICATE KEY UPDATE total_points=VALUES(total_points);

-- 10. SEED SAMPLE DELIVERED ORDER
INSERT INTO orders (id, order_number, customer_id, seller_id, subtotal, item_discount, coupon_discount, loyalty_discount, delivery_fee, platform_fee, final_total, payment_method, payment_status, order_status, delivery_address_id, delivery_address_text, delivery_otp, otp_verified) VALUES
('MM-ORD-1001', 'MM1001', 'usr-cust-1', 'seller-2', 75.00, 60.00, 0.00, 0.00, 25.00, 5.00, 105.00, 'COD', 'Paid', 'Delivered', 'addr-1', 'Room 304, Kaveri Hostel Block B, Main Campus', '483921', 1)
ON DUPLICATE KEY UPDATE order_status=VALUES(order_status);

INSERT INTO order_items (id, order_id, food_item_id, food_name_snapshot, image_url_snapshot, is_veg, quantity, unit_price, discount, total_price, is_surplus, original_unit_price) VALUES
('item-1001-1', 'MM-ORD-1001', 'smm-1', 'Surplus Chicken Biryani & Salan', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80', 0, 1, 75.00, 60.00, 75.00, 1, 135.00)
ON DUPLICATE KEY UPDATE total_price=VALUES(total_price);

INSERT INTO payments (id, order_id, customer_id, amount, payment_method, payment_status, received_at, transaction_reference) VALUES
('pay-1001', 'MM-ORD-1001', 'usr-cust-1', 105.00, 'COD', 'Paid', CURRENT_TIMESTAMP, 'COD-CASH-REC-1001')
ON DUPLICATE KEY UPDATE payment_status=VALUES(payment_status);

INSERT INTO delivery_tracking (id, order_id, delivery_person_name, delivery_person_phone, current_status, location_note, estimated_delivery_minutes, otp_verified) VALUES
('track-1001', 'MM-ORD-1001', 'Raju (Campus Runner)', '+91 98765 01234', 'Delivered', 'Kaveri Hostel Gate', 0, 1)
ON DUPLICATE KEY UPDATE current_status=VALUES(current_status);

INSERT INTO food_savings (id, customer_id, order_id, food_item_id, food_name, seller_name, image_url, original_price, purchased_price, money_saved, quantity, waste_diverted_kg) VALUES
('sav-1001-1', 'usr-cust-1', 'MM-ORD-1001', 'smm-1', 'Surplus Chicken Biryani & Salan', 'Campus Dhaba & Grills', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80', 135.00, 75.00, 60.00, 1, 0.40)
ON DUPLICATE KEY UPDATE money_saved=VALUES(money_saved);

INSERT INTO surplus_orders (id, order_id, surplus_food_id, quantity, money_saved, waste_diverted_kg) VALUES
('so-1001-1', 'MM-ORD-1001', 'surp-1', 1, 60.00, 0.40)
ON DUPLICATE KEY UPDATE money_saved=VALUES(money_saved);

INSERT INTO loyalty_transactions (id, customer_id, order_id, order_date, points, transaction_type, description) VALUES
('lt-1', 'usr-cust-1', 'MM-ORD-1001', CURDATE(), 20, 'earned', 'Earned 20 points for daily campus order completion')
ON DUPLICATE KEY UPDATE points=VALUES(points);

-- 11. SEED SAMPLE REVIEWS
INSERT INTO reviews (id, order_id, food_item_id, customer_id, customer_name, rating, comment) VALUES
('rev-1', 'MM-ORD-1001', 'smm-1', 'usr-cust-1', 'Madesh Kumar', 5, 'Super flavorful biryani, warm and fresh portions delivered quickly at Kaveri Hostel! Rescuing food at 45% off is amazing.'),
('rev-2', NULL, 'hp-1', 'usr-cust-1', 'Priya S.', 5, 'Soft idlis and aromatic ghee sambar just like home cooking! Best breakfast on campus.')
ON DUPLICATE KEY UPDATE rating=VALUES(rating);

-- 12. SEED SAMPLE SUBSCRIPTION
INSERT INTO subscriptions (id, customer_id, seller_id, plan_name, subscription_type, meal_type, start_date, end_date, delivery_slot, status, total_amount) VALUES
('sub-101', 'usr-cust-1', 'seller-1', 'Weekly South Indian Lunch Pass', 'weekly', 'Lunch', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), '12:30 PM - 1:30 PM', 'Active', 560.00)
ON DUPLICATE KEY UPDATE plan_name=VALUES(plan_name);

-- 13. SEED SUBSCRIPTION DAILY SCHEDULE
INSERT INTO subscription_orders (id, subscription_id, delivery_date, meal_name, delivery_status) VALUES
('subord-1', 'sub-101', CURDATE(), 'Traditional South Indian Thali', 'Delivered'),
('subord-2', 'sub-101', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Traditional South Indian Thali', 'Scheduled'),
('subord-3', 'sub-101', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Tempered Lemon Rice & Kootu', 'Scheduled'),
('subord-4', 'sub-101', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Traditional South Indian Thali', 'Scheduled'),
('subord-5', 'sub-101', DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'Traditional South Indian Thali', 'Scheduled'),
('subord-6', 'sub-101', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Traditional South Indian Thali', 'Scheduled'),
('subord-7', 'sub-101', DATE_ADD(CURDATE(), INTERVAL 6 DAY), 'Traditional South Indian Thali', 'Scheduled')
ON DUPLICATE KEY UPDATE delivery_status=VALUES(delivery_status);

-- 14. SEED NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, notification_type, is_read) VALUES
('notif-1', 'usr-cust-1', 'Welcome to MealMate!', 'Your campus food delivery account is active. Order fresh home meals, save surplus food, and earn loyalty streak rewards.', 'general', 1),
('notif-2', 'usr-cust-1', 'Order Delivered!', 'Your order MM1001 was delivered successfully. 20 loyalty points awarded!', 'order', 0)
ON DUPLICATE KEY UPDATE title=VALUES(title);

SET FOREIGN_KEY_CHECKS = 1;

