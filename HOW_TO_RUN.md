# 🍲 MEALMATE – SMART CAMPUS FOOD DELIVERY PLATFORM
## COMPLETE SYSTEM GUIDE & ONE-COMMAND RUN INSTRUCTIONS

MealMate is a campus food delivery platform designed with **three independent portals** (Customer, Seller / Home Cook, and Administrator), powered by a **Node.js/Express REST API**, **MySQL 8.0** database architecture (18 normalized InnoDB tables), and a **React 19 + TypeScript + Vite + Tailwind CSS** frontend.

---

## ⚡ 1. THE SINGLE COMMAND TO RUN THE WHOLE PROJECT

You can run both the **Backend API Server (Port 5000)** and the **Frontend Web App (Port 5173)** simultaneously using **ONE single command**:

### Option 1: Using Bun (Recommended)
Open your terminal in the project directory:
```bash
bun run dev
```
*(or simply `bun start`)*

---

### Option 2: One-Click Windows Script
On Windows, you can double-click **`run.bat`** in the project folder, or run:
```cmd
run
```
> **What `run.bat` does:**
> - Automatically detects your package manager (`bun` or `npm`).
> - Installs missing dependencies if needed.
> - Concurrently launches the Express MySQL REST API server (`port 5000`) and the Vite frontend (`port 5173`).
> - Automatically pops open your web browser to **`http://localhost:5173`**.

---

### Option 3: Using npm / Node.js
```bash
npm run dev
```

---

## 🌐 Access Points & URLs

| Service | Local Address |
| :--- | :--- |
| **Frontend Web Application** | **`http://localhost:5173`** *(automatically opens in browser)* |
| **REST API Server & Health Check** | **`http://localhost:5000/api/health`** |
| **Centralized Food Catalog API** | **`http://localhost:5000/api/foods`** |
| **Surplus Food Deals API** | **`http://localhost:5000/api/surplus`** |

---

## 🗄️ 2. MYSQL DATABASE SETUP & CONFIGURATION

MealMate uses **MySQL 8.0** with the dedicated database **`mealmate_db`**.

### Database Credentials (`.env`)
Create a `.env` file in the root workspace (already prepared based on `.env.example`):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mealmate_db
PORT=5000
JWT_SECRET=mealmate_super_secret_jwt_token_2026
VITE_API_URL=http://localhost:5000/api
```

### Automatic Table Creation & Seeding
When you run `bun run dev` (or `bun server/index.ts`), the backend automatically:
1. Connects to MySQL on your machine.
2. Creates the `mealmate_db` database if it does not exist (`CREATE DATABASE IF NOT EXISTS mealmate_db`).
3. Automatically creates all **21 normalized tables** with InnoDB engines, foreign keys, and indexes from `database/schema.sql` and `server/schema.sql`.
4. Seeds initial categories, sellers, realistic food items with accurate images, and test credentials.

> **Offline/Bootstrap Graceful Mode:** If MySQL is temporarily offline or password is not configured yet, the backend gracefully activates an in-memory shadow store with identical schemas and seeded records, ensuring zero downtime while allowing testing right away!

### The 21 Normalized MySQL Tables (`mealmate_db`):
1. `users` – ID, full name, email, bcrypt password hash, phone, role (`customer`, `seller`, `admin`), account status.
2. `user_addresses` – Student campus hostel addresses and drop-off points + default flag.
3. `sellers` – Kitchen name, description, address, approval status, active status.
4. `food_categories` – Breakfast, Lunch, Dinner, Combos, Quick Bites.
5. `food_items` – Food ID, seller ID, category, name, description, veg/non-veg type, module, price, original price, image URL, stock.
6. `food_inventory` – Real-time stock levels, reorder thresholds, and restock audit timestamps.
7. `carts` – Customer shopping cart header with applied coupon and loyalty preferences.
8. `cart_items` – Line items with quantities in the active shopping cart.
9. `orders` – Master order header (COD, unique 6-digit OTP, itemized fees, status).
10. `order_items` – Frozen snapshots of dish name, image, price, quantity, line total.
11. `payments` – Cash on Delivery payment transactions (Pending $\to$ Paid upon OTP verification).
12. `subscriptions` – HomePlate 7-day weekly and 30-day monthly meal passes.
13. `subscription_orders` – Pre-scheduled daily meal deliveries generated for active subscriptions.
14. `loyalty_points` – Customer reward point balances and total redeemed points.
15. `loyalty_transactions` – 20 points per unique order day, 100-point redemptions.
16. `coupons` – Campus promotional discount vouchers (`WELCOME50`, `CAMPUS20`, `BITE15`, `SAVER10`).
17. `surplus_food` – SaveMyMeal surplus portions, discounts, and cutoff countdowns.
18. `surplus_orders` – Rescued meal fulfillment & waste audit.
19. `delivery_tracking` – Live delivery buddy assignment, ETA minutes, and OTP confirmation.
20. `reviews` – Customer ratings (1-5 stars) and verified feedback on food items.
21. `notifications` – System alerts and order notifications.

*Supporting operational tables*: `food_savings` (wallet & carbon metrics), `disputes` (complaints), `order_otps` (hashed OTPs), `order_status_history` (audit logs), `inventory_transactions`.

---

## 👥 3. THREE SEPARATE USER PORTALS & TEST CREDENTIALS

MealMate features three independent portals with strict role-based access control and separate navigation bars:

### 3A. Customer Portal (`/`)
- **Login Email:** `madesh@gmail.com`
- **Password:** `madeshpassword123`
- **Navigation:** Home, Food Catalog, HomePlate, BudgetBite, SaveMyMeal, Subscriptions, Impact, Cart, Profile.
- **Exclusive Features:** 
  - 🪙 **5-Day Loyalty Streak Hub**: 20 pts per unique calendar day, 100 pts unlocks 20% OFF subtotal.
  - 🌿 **My Food Savings & Impact**: Money saved, surplus meals rescued, food waste diverted (kg).
  - 🔑 **Delivery OTP Display**: Secret 6-digit code shown to give to rider upon arrival.
  - 🛒 **Swiggy-Style COD Checkout**.

### 3B. Seller / Home Cook Portal (`/seller/dashboard`)
- **Login Email:** `seller1@mealmate.com`
- **Password:** `sellerpassword123`
- **Navigation:** Overview, Kitchen Orders & Delivery OTP Verification, Menu & Stock Inventory, Add New Food, Profile.
- **Strict Role Isolation:** 
  - **No loyalty points or customer reward badges** are shown to sellers.
  - Sellers see **business metrics**: Total Orders, Completed Orders, Recorded Revenue (₹), Active Menu Dishes.
  - **Delivery OTP Verification**: When orders are "Out for Delivery", seller must enter customer's 6-digit OTP to transition order to "Delivered" and collect cash.

### 3C. Administrator Governance Portal (`/admin/dashboard`)
- **Login Email:** `admin@mealmate.com`
- **Password:** `adminpassword123`
- **Navigation:** Campus Analytics, Manage Customers, Manage Sellers & Approvals, All Orders, Food Catalog, Disputes & Complaints.
- **Key Features:** Approve/reject home cook registrations, audit COD collections, review campus food waste diversion.

---

## 🛠️ 4. KEY ENHANCEMENTS & BUG FIXES IMPLEMENTED

### 1. Clean Navigation Bar (Removed Demo Labels)
- Removed "MealMate Demo Mode", "College Project", and "System Cash on Delivery Alone".
- Clean, role-aware top header with MealMate branding, customer cart, profile controls, and clean Cash on Delivery checkout.

### 2. Food Names & Images Matched Throughout
- Fixed the previous image mismatch bugs (no duplicate images, no bean bowls for curd rice, no tomato rice for egg fried rice).
- Every dish has its own unique, realistic high-res image.
- Added automatic image fallback (`onError`) across all components.

### 3. BudgetBite – Fixed Non-Veg Food Visibility & Strict Budgeting
- **Fixed the bug where selecting Non-Vegetarian showed zero items**:
  - Added authentic budget-friendly Non-Veg dishes at all tiers:
    - *Boiled Egg Duo with Pepper* (₹20) — fits ₹50 budget even with ₹30 fees!
    - *Masala Egg Omelette Pav* (₹35) — fits ₹80 budget with fees!
    - *Spiced Chicken Kathi Roll* (₹65) — fits ₹100 budget with fees!
    - *Dhaba Egg Curry with Rice* (₹70) — fits ₹100 budget with fees!
    - *Wok Egg Fried Rice* (₹85) — fits ₹150 budget with fees!
    - *Chicken Dum Biryani Bowl* (₹115) — fits ₹150 budget with fees!
- Strict budget calculation includes:
  - Delivery Fee: ₹25 (FREE for orders above ₹300)
  - Platform Fee: ₹5
  - Guaranteed final payable amount never exceeds chosen budget.
- Automatic affordable meal combination pairs with **"Add Combo to Cart"** button.

### 4. SaveMyMeal – Fixed Availability & Live Cutoff Calculation
- Fixed the bug where items were permanently marked past cutoff.
- Cutoff times are now dynamically calculated for the active day with **live real-time countdown timers** (`HH:MM:SS`).
- Status updates automatically:
  - `ACTIVE`: Current time is before cutoff and portions > 0 (orderable).
  - `EXPIRED`: Cutoff time reached (orders locked).
  - `SOLD OUT`: Portions reach 0 (orders locked).
- Discounts of up to 45% applied.

### 5. My Profile – Food Savings & Impact Dashboard
- New dedicated section in Customer Profile:
  - Total SaveMyMeal food items purchased.
  - Total surplus meals rescued.
  - Total money saved (`originalPrice - purchasedPrice`).
  - Total completed orders.
  - Food waste diverted (`0.40 kg per meal`).
  - CO2 emissions saved (`1.05 kg CO2 per meal`).
  - Searchable, filterable food history list.
  - **Strict rule enforced**: Only successfully delivered orders count towards savings.

### 6. Unique 6-Digit Cryptographic Delivery OTP
- Cryptographically random 6-digit OTP generated for every order.
- Stored hashed in MySQL database (`order_otps`).
- Displayed only to the customer in order details and confirmation.
- Seller must enter OTP in Seller Portal to complete delivery.
- Frontend cannot mark an order "Delivered" without successful OTP verification!

### 7. Fixed Authentication, Registration & Guest Ordering Protection
- **Real User Registration**:
  - Validates full name, email format, 10-digit phone number, and minimum 6-character password.
  - Checks against existing users. If email is taken, displays: `"An account with this email already exists. Please sign in."` with an instant link to Sign In.
  - Hashes passwords securely with `bcrypt` salt rounds before saving to MySQL / storage.
  - Welcomes new users with: `"Account created successfully! Welcome to MealMate."`.
- **Strict User Login**:
  - Validates email and password against registered database accounts.
  - If email does not exist: `"Account not found. Please register first."` with a link to Register.
  - If password is wrong: `"Incorrect password. Please try again."`.
  - Never auto-creates accounts or silently creates logins on the fly.
  - Preserves authenticated user sessions securely across browser refreshes (`localStorage` user session + JWT token).
- **Blocked Guest Ordering**:
  - Visitors cannot add items to cart, order now, checkout, or subscribe without signing in.
  - Clicking any food ordering action intercepts the user with: `"Please sign in or create an account to order food."` and redirects to `/login?redirect=...`.
  - After logging in or registering, the user is automatically redirected back to their intended destination page with their cart intact.
- **Protected Customer Routes**:
  - `/cart`, `/checkout`, `/order-confirmation/:orderId`, `/orders`, `/orders/:orderId`, `/profile`, `/saved-addresses`, `/subscription-manage` are wrapped in `<ProtectedRoute allowedRoles={['customer']}>`.
  - Customers only access their own private orders and details.
- **Strict Role Separation**:
  - Removed demo role-switching buttons (`switchRole`). Users sign in as Customer, Seller, or Admin through their designated portal.

---

## 🛑 How to Stop the Project

In the terminal window running the project, press **`Ctrl + C`**, then type `y` and press `Enter`.
