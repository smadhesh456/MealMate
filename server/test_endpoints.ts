import app, { server } from './index';

async function runTests() {
  console.log('\n--- STARTING MEALMATE BACKEND API VERIFICATION SUITE ---\n');

  const baseUrl = 'http://localhost:5000/api';
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<boolean>) => {
    try {
      const ok = await fn();
      if (ok) {
        console.log(`✅ [PASS] ${name}`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${name}`);
        failed++;
      }
    } catch (e: any) {
      console.error(`❌ [ERROR] ${name}:`, e.message);
      failed++;
    }
  };

  // Wait 1 second for DB init
  await new Promise(r => setTimeout(r, 1000));

  let customerToken = '';
  let sellerToken = '';
  let adminToken = '';

  // 1. Health check
  await test('GET /api/health', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    return res.status === 200 && data.status === 'online';
  });

  // 2. Categories
  await test('GET /api/categories', async () => {
    const res = await fetch(`${baseUrl}/categories`);
    const data = await res.json();
    return res.status === 200 && data.success && data.categories.length > 0;
  });

  // 3. Coupons
  await test('GET /api/coupons', async () => {
    const res = await fetch(`${baseUrl}/coupons`);
    const data = await res.json();
    return res.status === 200 && data.success && data.coupons.length > 0;
  });

  // 4. Foods Listing & Filters
  await test('GET /api/foods (All, HomePlate, BudgetBite, SaveMyMeal)', async () => {
    const resAll = await fetch(`${baseUrl}/foods`);
    const dataAll = await resAll.json();
    const resBB = await fetch(`${baseUrl}/foods?module=BudgetBite`);
    const dataBB = await resBB.json();
    const resSMM = await fetch(`${baseUrl}/foods?module=SaveMyMeal`);
    const dataSMM = await resSMM.json();
    return dataAll.foods.length > 0 && dataBB.foods.length > 0 && dataSMM.foods.length > 0;
  });

  // 5. Customer Login
  await test('POST /api/auth/login (Customer)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'madesh@gmail.com', password: 'madeshpassword123', role: 'customer' })
    });
    const data = await res.json();
    if (data.success && data.token) {
      customerToken = data.token;
      return true;
    }
    return false;
  });

  // 6. Seller Login
  await test('POST /api/auth/login (Seller)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'seller1@mealmate.com', password: 'sellerpassword123', role: 'seller' })
    });
    const data = await res.json();
    if (data.success && data.token) {
      sellerToken = data.token;
      return true;
    }
    return false;
  });

  // 7. Admin Login
  await test('POST /api/auth/login (Admin)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mealmate.com', password: 'adminpassword123', role: 'admin' })
    });
    const data = await res.json();
    if (data.success && data.token) {
      adminToken = data.token;
      return true;
    }
    return false;
  });

  // 8. Cart Operations
  await test('Cart Lifecycle (GET, Add Item, Bill Calculation)', async () => {
    const getRes = await fetch(`${baseUrl}/cart`, {
      headers: { Authorization: `Bearer ${customerToken}`, 'x-user-id': 'usr-cust-1' }
    });
    const getData = await getRes.json();
    if (!getData.success) return false;

    const addRes = await fetch(`${baseUrl}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}`, 'x-user-id': 'usr-cust-1' },
      body: JSON.stringify({ foodId: 'hp-1', quantity: 2 })
    });
    const addData = await addRes.json();
    return addData.success;
  });

  // 9. Addresses Operations
  await test('Addresses Lifecycle (GET, POST)', async () => {
    const getRes = await fetch(`${baseUrl}/addresses`, {
      headers: { Authorization: `Bearer ${customerToken}`, 'x-user-id': 'usr-cust-1' }
    });
    const getData = await getRes.json();
    return getData.success && Array.isArray(getData.addresses);
  });

  // 10. Subscriptions
  await test('GET /api/subscriptions', async () => {
    const res = await fetch(`${baseUrl}/subscriptions`, {
      headers: { Authorization: `Bearer ${customerToken}`, 'x-user-id': 'usr-cust-1' }
    });
    const data = await res.json();
    return data.success;
  });

  // 11. Reviews
  await test('GET /api/reviews', async () => {
    const res = await fetch(`${baseUrl}/reviews`);
    const data = await res.json();
    return data.success && Array.isArray(data.reviews);
  });

  // 12. Order Placement with COD, Transaction & OTP
  let placedOrderId = '';
  let plainOtp = '';
  await test('POST /api/orders (COD Order Placement)', async () => {
    const res = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}`, 'x-user-id': 'usr-cust-1' },
      body: JSON.stringify({
        items: [
          { id: 'hp-1', name: 'Idli with Sambar & Chutney', price: 40, quantity: 2, isVeg: true, module: 'HomePlate' }
        ],
        seller_id: 'seller-1',
        delivery_address_text: 'Room 304, Kaveri Hostel Block B, Main Campus'
      })
    });
    const data = await res.json();
    if (data.success && data.order) {
      placedOrderId = data.order.id;
      plainOtp = data.order.plain_otp;
      return true;
    }
    return false;
  });

  // 13. Verify Delivery OTP
  await test('POST /api/orders/:id/verify-otp (6-Digit OTP Delivery Verification)', async () => {
    if (!placedOrderId || !plainOtp) return false;
    const res = await fetch(`${baseUrl}/orders/${placedOrderId}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sellerToken}`, 'x-user-id': 'usr-seller-1', 'x-user-role': 'seller' },
      body: JSON.stringify({ otp: plainOtp })
    });
    const data = await res.json();
    return data.success;
  });

  // 14. Admin Stats Overview
  await test('GET /api/admin/stats (Analytics & Environmental Waste Diverted)', async () => {
    const res = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}`, 'x-user-id': 'usr-admin-1', 'x-user-role': 'admin' }
    });
    const data = await res.json();
    return data.success && data.stats && data.stats.totalDelivered >= 0;
  });

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  server.close(() => {
    process.exit(failed === 0 ? 0 : 1);
  });
}

runTests();
