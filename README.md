# 🍲 MealMate — Smart Campus Food Delivery Platform

MealMate is a modern, responsive, multi-role food delivery web platform built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**.

Designed specifically for college campus dining, MealMate bridges the gap between students, local neighborhood home cooks, and campus eateries with transparent budgeting and food waste reduction.

---

## 🌟 Core Modules

### 1. 🏠 HomePlate — Authentic Homemade Food
- Connects students with verified local neighborhood home cooks.
- Homestyle comfort dishes prepared fresh with traditional recipes.
- Supports weekly (7-Day) and monthly (30-Day) subscription passes with pre-scheduled delivery time slots.

### 2. 💰 BudgetBite — Pocket-Friendly Dining Without Checkout Surprises
- Interactive budget selector (**₹50, ₹80, ₹100, ₹150**, and custom inputs).
- **Strict Final-Total Calculation**: Considers delivery fee (₹25) and platform fee (₹5) up front so students are never surprised by hidden charges at checkout.
- Automated affordable combo meal suggestions.

### 3. ⏰ SaveMyMeal — Surplus Food Rescue
- Discounted restaurant and bakery surplus food offered at up to 45% discount.
- Live countdown timers dynamically counting down until daily order cutoff times.
- Automated ordering lock when cutoff time expires or portions sell out.
- Food waste diversion and carbon offset tracker.

---

## 🎁 5-Day Loyalty Streak & 100 Reward Points
- **20 Points per Order Day**: Every order placed on a unique calendar day awards +20 reward points (orders do not need to be on consecutive days).
- **100 Points Milestone**: Finish orders across 5 different days to reach 100 points ($5 \times 20 = 100\text{ pts}$).
- **6th Order 20% Discount**: On the 6th order (or whenever 100 points are available), redeem 100 points for a flat **20% discount (offer)** on the food items subtotal!
- Built-in Evaluator Fast Demo tools in the Cart and Profile pages to simulate milestones instantly.

---

## 🚀 Key Features

- **Swiggy-Style Transparent Itemized Bill**: Live bill breakdown displaying item totals, discounts, base delivery fee (waived to FREE on orders over ₹300), platform fee, and coupon deductions.
- **Strict Cash on Delivery (COD)**: Payment is strictly locked to cash on delivery. Receipts clearly reflect pending and cash-paid statuses.
- **Manual Order Progress Tracking**: Step-by-step order lifecycle: *Order Placed → Confirmed → Preparing → Out for Delivery → Delivered*.
- **Role-Protected Portals**:
  - **Customer Portal**: Explore 20+ catalog meals, order tracking, address book, subscription management, loyalty rewards hub.
  - **Seller / Home Cook Hub**: Real-time kitchen dashboard, order status transitions, live inventory control, and dish publishing.
  - **Administrator Portal**: Campus analytics, customer & seller moderation, order audits, and dispute resolution.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS with custom warm cream/orange/green design tokens
- **Build Tool**: Vite
- **Routing**: React Router 7 (`react-router-dom`)
- **Icons**: Lucide React
- **Celebration FX**: Canvas-Confetti
- **Storage Layer**: LocalStorage persistence with full Supabase PostgreSQL schema readiness

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18+) or Bun (v1.3+)

### Installation
```bash
# Clone the repository
git clone https://github.com/smadhesh456/MealMate.git
cd MealMate

# Install dependencies (using Bun or npm)
bun install
# or
npm install
```

### Running Locally
```bash
# Start development server
bun run dev
# or
npm run dev
```

Open your browser at **http://localhost:5173/**.

### Production Build
```bash
bun run build
# or
npm run build
```

---

## 👨‍💻 Author & Credits
- **Project**: MealMate — Smart Food Delivery Platform
- **Repository**: [smadhesh456/MealMate](https://github.com/smadhesh456/MealMate)
- Built with ❤️ for college capstone presentation and portfolio.

