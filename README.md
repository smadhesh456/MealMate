# 🍲 MealMate — Smart Campus Food Delivery Platform

MealMate is a full-stack, enterprise-grade campus food delivery platform built with **React 19**, **TypeScript**, **Tailwind CSS**, **Vite**, **Express.js**, and a permanent **MySQL Database (`mealmate_db`)**.

Designed specifically for university campus dining, MealMate bridges the gap between students, local neighborhood home cooks, and campus eateries with transparent budgeting, food waste rescue, daily loyalty streak rewards, Cash on Delivery (COD) payment flow, and 6-digit cryptographic delivery OTP verification.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT 19 FRONTEND                        │
│   (Vite + TypeScript + Tailwind CSS + React Router 7)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API Calls (HTTP / JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXPRESS.JS REST API BACKEND                │
│         (Node.js / Bun + Router Controllers + JWT)          │
└──────────────────────────────┬──────────────────────────────┘
                               │ mysql2 / Connection Pool
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 PERMANENT MYSQL DATABASE                    │
│            Database: mealmate_db (21 Tables)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ MySQL Database Schema (`mealmate_db`)

The application features a fully normalized relational schema consisting of **21 specialized tables**:

| # | Table Name | Purpose & Responsibilities |
|---|---|---|
| 1 | `users` | Customer, seller, and administrator accounts with bcrypt password hashes. |
| 2 | `user_addresses` | Saved campus delivery locations (hostel room, lab, department). |
| 3 | `sellers` | Approved campus kitchens, ratings, and operating credentials. |
| 4 | `food_categories` | Menu taxonomy (Breakfast, Lunch, Dinner, Combos, Quick Bites). |
| 5 | `food_items` | Food catalog items for HomePlate, BudgetBite, and SaveMyMeal. |
| 6 | `food_inventory` | Real-time stock counts, reorder thresholds, and restock timestamps. |
| 7 | `carts` | User shopping cart header with applied coupon and loyalty flags. |
| 8 | `cart_items` | Individual line items with quantities inside the customer cart. |
| 9 | `orders` | Master orders table (COD, unique 6-digit OTP, itemized fees, status). |
| 10 | `order_items` | Immutable line-item snapshots preserving price and meal metadata. |
| 11 | `payments` | Cash on Delivery payment transactions (Pending / Paid on OTP). |
| 12 | `subscriptions` | HomePlate 7-day weekly and 30-day monthly meal passes. |
| 13 | `subscription_orders` | Pre-scheduled daily meal deliveries generated for active subscriptions. |
| 14 | `loyalty_points` | Customer reward wallet balances and total redeemed points. |
| 15 | `loyalty_transactions` | Audit trail of daily +20 pt streak awards and 100 pt redemptions. |
| 16 | `coupons` | Campus discount vouchers (`WELCOME50`, `CAMPUS20`, `BITE15`, `SAVER10`). |
| 17 | `surplus_food` | SaveMyMeal surplus flash sales with real-time countdown cutoffs. |
| 18 | `surplus_orders` | Audit of rescued meals, money saved, and food waste diverted. |
| 19 | `delivery_tracking` | Live delivery buddy assignment, ETA minutes, and OTP confirmation. |
| 20 | `reviews` | Customer ratings (1-5 stars) and verified feedback on food items. |
| 21 | `notifications` | Campus platform announcements and order delivery notifications. |

*Supporting operational tables*: `food_savings` (wallet & carbon metrics), `disputes` (complaints), `order_otps` (hashed OTPs), `order_status_history` (audit logs), `inventory_transactions`.

---

## 🌟 Core Modules & Business Logic

### 1. 🏠 HomePlate — Homestyle Campus Meal Passes
- Homestyle comfort dishes prepared fresh with traditional recipes by verified local cooks.
- Weekly (7-day) and monthly (30-day) passes with daily scheduled delivery slots.

### 2. 💰 BudgetBite — Pocket-Friendly Dining Without Surprises
- Strict budget selection (**₹50, ₹80, ₹100, ₹150**).
- **Strict Final-Total Calculation**: Includes delivery fee (₹25, waived to FREE over ₹300) and platform fee (₹5) up front so students are never surprised at checkout.

### 3. ⏰ SaveMyMeal — Surplus Food Rescue
- Discounted fresh restaurant batches up to 45% discount.
- Live countdown timers dynamically counting down until daily order cutoff times.
- Automated ordering lock when cutoff time expires or portions sell out.
- Real-time environmental tracker: **0.40 kg waste diverted & 1.05 kg CO₂ avoided per rescued meal**.

### 4. 🎁 5-Day Loyalty Streak & 100 Reward Points
- **20 Points per Order Day**: Every order placed on a unique calendar day awards +20 reward points.
- **100 Points Milestone**: Finish orders across 5 days to reach 100 points ($5 \times 20 = 100\text{ pts}$).
- **20% Discount Redemption**: On the 6th order (or whenever 100 points are available), redeem 100 points for a flat **20% discount** on the food items subtotal!

### 5. 🔒 Cash on Delivery (COD) & 6-Digit Delivery OTP
- Payment is strictly Cash on Delivery.
- Orders generate a unique 6-digit cryptographic OTP displayed on the customer's order screen.
- The seller/delivery runner cannot complete delivery without entering this OTP. Verifying the OTP automatically marks the order **Delivered** and payment **Paid**.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, React Router 7, Lucide React, Canvas Confetti
- **Backend**: Node.js / Bun, Express.js 5, CORS, JSON Web Tokens (JWT), Bcrypt.js
- **Database**: MySQL 8.0, `mysql2` promise-based driver
- **Configuration**: Dotenv (`.env`)

---

## ⚙️ Environment Configuration (`.env`)

Create or update your `.env` file in the project root:

```ini
# MySQL Database Settings
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=mealmate_db

# Express.js REST API Server
PORT=5000

# Authentication Secret
JWT_SECRET=mealmate_super_secret_jwt_token_2026

# Frontend API URL
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Setup & Execution Guide

### 1. Database Setup in MySQL

Open MySQL Workbench or MySQL Command Line Client:

```bash
mysql -u root -p
```

Execute the provided schema and seed scripts:

```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

*(Alternatively, the Express backend automatically runs `CREATE DATABASE IF NOT EXISTS mealmate_db` and verifies all 21 tables upon startup!)*

### 2. Install Dependencies

```bash
# Using Bun (Recommended)
bun install

# Or using npm
npm install
```

### 3. Run Both Backend & Frontend Simultaneously

```bash
# Using Bun
bun run dev

# Or using npm
npm run dev
```

The terminal will launch:
- **Backend REST API**: `http://localhost:5000`
- **Frontend Application**: `http://localhost:5173`

### 4. Run Automated Backend API Verification Suite

To verify all REST API endpoints and data workflows:

```bash
bun test:api
```

### 5. Production Build

```bash
bun run build
# or
npm run build
```

---

## 🔑 Default Seed Test Accounts

| Role | Email | Password | Access / Capabilities |
|---|---|---|---|
| **Customer** | `madesh@gmail.com` | `madeshpassword123` | Ordering, Cart, COD, OTP tracking, Saved Addresses, Subscriptions, Loyalty |
| **Seller 1** | `seller1@mealmate.com` | `sellerpassword123` | Annapoorna Home Kitchen, Menu Management, Status advance, OTP verification |
| **Seller 2** | `seller2@mealmate.com` | `sellerpassword123` | Campus Dhaba & Grills, Surplus SaveMyMeal listings, Inventory replenishment |
| **Administrator** | `admin@mealmate.com` | `adminpassword123` | Campus Analytics, Customer moderation, Seller approval, Dispute resolution |

---

## 👨‍💻 Project Information
- **Project**: MealMate – Smart Campus Food Delivery Platform
- **Repository**: [smadhesh456/MealMate](https://github.com/smadhesh456/MealMate)
