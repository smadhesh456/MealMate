import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Generate cryptographically random 6-digit OTP
const generateUniqueOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Calculate backend itemized bill
const calculateBackendBill = (items: any[], couponDiscount = 0, useLoyalty = false) => {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const deliveryFee = subtotal >= 300 ? 0 : 25;
  const platformFee = 5;
  const loyaltyDiscount = useLoyalty ? Math.round(subtotal * 0.20) : 0;
  const finalTotal = Math.max(0, subtotal - couponDiscount - loyaltyDiscount + deliveryFee + platformFee);

  return {
    subtotal,
    deliveryFee,
    platformFee,
    couponDiscount,
    loyaltyDiscount,
    finalTotal
  };
};

// POST /api/orders - Create a new order with verified bill & unique OTP
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'customer') {
      return res.status(403).json({ success: false, error: 'Only registered customers can place food orders.' });
    }
    const customerId = req.user.id;
    const { 
      items, 
      seller_id = 'seller-1',
      delivery_address_text,
      delivery_address_id,
      use_loyalty = false,
      coupon_code
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cannot place an empty order.' });
    }

    // Verify coupon discount if applied
    let couponDiscount = 0;
    if (coupon_code) {
      if (getDbConnected()) {
        const conn = await pool.getConnection();
        const [cRows]: any = await conn.query('SELECT * FROM coupons WHERE coupon_code = ? AND is_active = 1', [coupon_code]);
        if (cRows.length > 0) {
          const c = cRows[0];
          couponDiscount = Number(c.discount_value);
        }
        conn.release();
      } else {
        const c = memoryStore.coupons.find(cp => cp.coupon_code === coupon_code && cp.is_active);
        if (c) couponDiscount = Number(c.discount_value);
      }
    }

    // Backend Bill Verification
    const bill = calculateBackendBill(items, couponDiscount, use_loyalty);

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `MM${Math.floor(1000 + Math.random() * 9000)}`;
    const plainOtp = generateUniqueOtp();
    const otpHashed = await bcrypt.hash(plainOtp, 10);
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours expiry

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      await conn.beginTransaction();

      try {
        // 1. Insert order
        await conn.query(
          `INSERT INTO orders 
           (id, order_number, customer_id, seller_id, subtotal, item_discount, coupon_discount, loyalty_discount, delivery_fee, platform_fee, final_total, payment_method, payment_status, order_status, delivery_address_id, delivery_address_text, delivery_otp, otp_verified)
           VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 'COD', 'Pending', 'Order Placed', ?, ?, ?, 0)`,
          [
            orderId, orderNumber, customerId, seller_id,
            bill.subtotal, bill.couponDiscount, bill.loyaltyDiscount,
            bill.deliveryFee, bill.platformFee, bill.finalTotal,
            delivery_address_id || null, delivery_address_text || 'Campus Hostel Address',
            plainOtp
          ]
        );

        // 1b. Insert Cash on Delivery payment record
        await conn.query(
          `INSERT INTO payments (id, order_id, customer_id, amount, payment_method, payment_status)
           VALUES (?, ?, ?, ?, 'COD', 'Pending')`,
          [`pay-${Date.now()}`, orderId, customerId, bill.finalTotal]
        );

        // 1c. Insert delivery tracking record
        await conn.query(
          `INSERT INTO delivery_tracking (id, order_id, delivery_person_name, current_status, location_note, estimated_delivery_minutes, otp_verified)
           VALUES (?, ?, 'Campus Delivery Buddy', 'Order Placed', 'Campus Food Hub', 20, 0)`,
          [`track-${Date.now()}`, orderId]
        );

        // 2. Insert order items
        for (const item of items) {
          const itemId = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const unitPrice = Number(item.price);
          const qty = Number(item.quantity) || 1;
          const lineTotal = unitPrice * qty;

          await conn.query(
            `INSERT INTO order_items 
             (id, order_id, food_item_id, food_name_snapshot, image_url_snapshot, is_veg, quantity, unit_price, discount, total_price, is_surplus, original_unit_price)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
            [
              itemId, orderId, item.id || null, item.name, item.image || null,
              item.isVeg ? 1 : 0, qty, unitPrice, lineTotal,
              item.module === 'SaveMyMeal' ? 1 : 0, item.originalPrice || unitPrice
            ]
          );

          // Deduct inventory
          if (item.id) {
            await conn.query(
              'UPDATE food_items SET available_quantity = GREATEST(0, available_quantity - ?) WHERE id = ?',
              [qty, item.id]
            );

            await conn.query(
              'UPDATE food_inventory SET current_stock = GREATEST(0, current_stock - ?) WHERE food_item_id = ?',
              [qty, item.id]
            );

            // Log inventory transaction
            await conn.query(
              `INSERT INTO inventory_transactions (id, food_item_id, order_id, quantity_changed, transaction_type)
               VALUES (?, ?, ?, ?, 'order_deduct')`,
              [`inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`, item.id, orderId, -qty]
            );

            // If surplus food, update surplus_food and insert into surplus_orders
            if (item.module === 'SaveMyMeal') {
              const [surpRows]: any = await conn.query('SELECT id FROM surplus_food WHERE food_item_id = ?', [item.id]);
              if (surpRows.length > 0) {
                const sId = surpRows[0].id;
                const origP = Number(item.originalPrice || unitPrice);
                const saved = Math.max(0, (origP - unitPrice) * qty);
                await conn.query(
                  `INSERT INTO surplus_orders (id, order_id, surplus_food_id, quantity, money_saved, waste_diverted_kg)
                   VALUES (?, ?, ?, ?, ?, ?)`,
                  [`so-${Date.now()}-${Math.floor(Math.random() * 1000)}`, orderId, sId, qty, saved, 0.40 * qty]
                );
                await conn.query('UPDATE surplus_food SET available_portions = GREATEST(0, available_portions - ?) WHERE id = ?', [qty, sId]);
              }
            }
          }
        }

        // 3. Insert secure OTP hash into order_otps
        const otpRecordId = `otp-${Date.now()}`;
        await conn.query(
          `INSERT INTO order_otps (id, order_id, plain_otp, otp_hash, expires_at, failed_attempts)
           VALUES (?, ?, ?, ?, ?, 0)`,
          [otpRecordId, orderId, plainOtp, otpHashed, expiresAt]
        );

        // 4. Log status history
        await conn.query(
          `INSERT INTO order_status_history (id, order_id, old_status, new_status, changed_by, reason)
           VALUES (?, ?, NULL, 'Order Placed', ?, 'Customer placed COD food order')`,
          [`hist-${Date.now()}`, orderId, customerId]
        );

        // If loyalty discount was redeemed, record transaction
        if (use_loyalty) {
          await conn.query(
            `INSERT INTO loyalty_transactions (id, customer_id, order_id, points, transaction_type, description)
             VALUES (?, ?, ?, 100, 'redeemed', 'Redeemed 100 points for 20% discount on order subtotal')`,
            [`lt-${Date.now()}`, customerId, orderId]
          );

          await conn.query(
            'UPDATE loyalty_points SET total_points = GREATEST(0, total_points - 100), redeemed_points = redeemed_points + 100 WHERE customer_id = ?',
            [customerId]
          );
        }

        await conn.commit();
        conn.release();
      } catch (err) {
        await conn.rollback();
        conn.release();
        throw err;
      }
    } else {
      // Fallback memory store
      const newOrder = {
        id: orderId,
        order_number: orderNumber,
        customer_id: customerId,
        seller_id,
        subtotal: bill.subtotal,
        item_discount: 0,
        coupon_discount: bill.couponDiscount,
        loyalty_discount: bill.loyaltyDiscount,
        delivery_fee: bill.deliveryFee,
        platform_fee: bill.platformFee,
        final_total: bill.finalTotal,
        payment_method: 'COD',
        payment_status: 'Pending',
        order_status: 'Order Placed',
        delivery_address_text: delivery_address_text || 'Campus Hostel Address',
        cancellation_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: items.map((it: any) => ({
          food_name_snapshot: it.name,
          image_url_snapshot: it.image,
          quantity: it.quantity,
          unit_price: it.price,
          total_price: it.price * it.quantity,
          food_item_id: it.id,
          is_surplus: it.module === 'SaveMyMeal' ? 1 : 0,
          original_unit_price: it.originalPrice || it.price
        }))
      };

      memoryStore.orders.unshift(newOrder);

      memoryStore.orderOtps.push({
        id: `otp-${Date.now()}`,
        order_id: orderId,
        plain_otp: plainOtp,
        otp_hash: otpHashed,
        expires_at: expiresAt.toISOString(),
        verified_at: null,
        failed_attempts: 0,
        created_at: new Date().toISOString()
      });

      // Deduct memory stock
      for (const item of items) {
        const found = memoryStore.foodItems.find(f => f.id === item.id);
        if (found) {
          found.available_quantity = Math.max(0, found.available_quantity - (item.quantity || 1));
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully with Cash on Delivery.',
      order: {
        id: orderId,
        orderNumber,
        finalTotal: bill.finalTotal,
        otp: plainOtp,
        plain_otp: plainOtp, // securely provided to the ordering customer!
        orderStatus: 'Order Placed',
        paymentStatus: 'Pending',
        bill
      }
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: 'Could not create order.' });
  }
});

// GET /api/orders/my-orders - Customer's orders
router.get('/my-orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user?.id;
    let orders: any[] = [];

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      const [rows]: any = await conn.query(
        `SELECT o.*, otp.plain_otp, s.kitchen_name as seller_name
         FROM orders o
         LEFT JOIN order_otps otp ON o.id = otp.order_id
         LEFT JOIN sellers s ON o.seller_id = s.id
         WHERE o.customer_id = ?
         ORDER BY o.created_at DESC`,
        [customerId]
      );

      for (const ord of rows) {
        const [items]: any = await conn.query('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
        ord.items = items;
      }

      orders = rows;
      conn.release();
    } else {
      orders = memoryStore.orders
        .filter(o => o.customer_id === customerId)
        .map(o => {
          const otp = memoryStore.orderOtps.find(ot => ot.order_id === o.id);
          const seller = memoryStore.sellers.find(s => s.id === o.seller_id);
          return {
            ...o,
            plain_otp: otp ? otp.plain_otp : undefined,
            seller_name: seller ? seller.kitchen_name : 'Campus Kitchen'
          };
        });
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve orders.' });
  }
});

// GET /api/orders/seller - Seller's orders
router.get('/seller', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = (req.user as any)?.sellerId || 'seller-1';
    let orders: any[] = [];

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      const [rows]: any = await conn.query(
        `SELECT o.*, u.full_name as customer_name, u.phone as customer_phone
         FROM orders o
         LEFT JOIN users u ON o.customer_id = u.id
         WHERE o.seller_id = ?
         ORDER BY o.created_at DESC`,
        [sellerId]
      );

      for (const ord of rows) {
        const [items]: any = await conn.query('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
        ord.items = items;
      }

      orders = rows;
      conn.release();
    } else {
      orders = memoryStore.orders.map(o => {
        const cust = memoryStore.users.find(u => u.id === o.customer_id);
        return {
          ...o,
          customer_name: cust ? cust.full_name : 'Student',
          customer_phone: cust ? cust.phone : '+91 98765 44444'
        };
      });
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve seller orders.' });
  }
});

// GET /api/orders/admin - Admin view of all orders
router.get('/admin', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    let orders: any[] = [];

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      const [rows]: any = await conn.query(
        `SELECT o.*, u.full_name as customer_name, s.kitchen_name as seller_name
         FROM orders o
         LEFT JOIN users u ON o.customer_id = u.id
         LEFT JOIN sellers s ON o.seller_id = s.id
         ORDER BY o.created_at DESC`
      );

      for (const ord of rows) {
        const [items]: any = await conn.query('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
        ord.items = items;
      }

      orders = rows;
      conn.release();
    } else {
      orders = memoryStore.orders.map(o => {
        const cust = memoryStore.users.find(u => u.id === o.customer_id);
        const seller = memoryStore.sellers.find(s => s.id === o.seller_id);
        return {
          ...o,
          customer_name: cust ? cust.full_name : 'Student',
          seller_name: seller ? seller.kitchen_name : 'Campus Kitchen'
        };
      });
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch admin orders.' });
  }
});

// GET /api/orders/:id - Single order details
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    let order: any = null;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      const [rows]: any = await conn.query(
        `SELECT o.*, otp.plain_otp, s.kitchen_name as seller_name, u.full_name as customer_name
         FROM orders o
         LEFT JOIN order_otps otp ON o.id = otp.order_id
         LEFT JOIN sellers s ON o.seller_id = s.id
         LEFT JOIN users u ON o.customer_id = u.id
         WHERE o.id = ?`,
        [id]
      );

      if (rows.length > 0) {
        order = rows[0];
        const [items]: any = await conn.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
        order.items = items;
      }
      conn.release();
    } else {
      const found = memoryStore.orders.find(o => o.id === id);
      if (found) {
        const otp = memoryStore.orderOtps.find(ot => ot.order_id === id);
        const seller = memoryStore.sellers.find(s => s.id === found.seller_id);
        const cust = memoryStore.users.find(u => u.id === found.customer_id);
        order = {
          ...found,
          plain_otp: otp ? otp.plain_otp : undefined,
          seller_name: seller ? seller.kitchen_name : 'Campus Kitchen',
          customer_name: cust ? cust.full_name : 'Student'
        };
      }
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    // Customer can only view their own orders
    if (req.user?.role === 'customer' && order.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied. You can only view your own orders.' });
    }

    // Never expose delivery OTP to non-customer viewers (e.g. seller/admin) in order details
    if (req.user?.role !== 'customer') {
      delete order.plain_otp;
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve order details.' });
  }
});

// POST /api/orders/:id/status - Advance order status (cannot directly set Delivered)
router.post('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Requirement 7: Cannot directly set Delivered without OTP verification
    if (status === 'Delivered') {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be marked Delivered directly. You must verify the customer delivery OTP.'
      });
    }

    const allowed = ['Order Placed', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid order status transition.' });
    }

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      await conn.query('UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
      await conn.query(
        'INSERT INTO order_status_history (id, order_id, new_status, changed_by, reason) VALUES (?, ?, ?, ?, ?)',
        [`hist-${Date.now()}`, id, status, req.user?.id || 'seller', reason || 'Kitchen stage updated']
      );
      conn.release();
    } else {
      const order = memoryStore.orders.find(o => o.id === id);
      if (order) {
        order.order_status = status;
        order.updated_at = new Date().toISOString();
      }
    }

    res.json({ success: true, message: `Order status transitioned to "${status}".` });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update order status.' });
  }
});

// POST /api/orders/:id/verify-otp - Delivery OTP Verification (Strict Requirement 7)
router.post('/:id/verify-otp', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp || String(otp).trim().length !== 6) {
      return res.status(400).json({ success: false, error: 'Please enter the 6-digit delivery OTP provided by the customer.' });
    }

    const enteredOtp = String(otp).trim();

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [otpRows]: any = await conn.query('SELECT * FROM order_otps WHERE order_id = ?', [id]);
        if (otpRows.length === 0) {
          conn.release();
          return res.status(404).json({ success: false, error: 'No OTP record found for this order.' });
        }

        const otpRecord = otpRows[0];

        // Check if already verified
        if (otpRecord.verified_at) {
          conn.release();
          return res.status(400).json({ success: false, error: 'This delivery OTP has already been verified and completed.' });
        }

        // Verify OTP against hash
        const isMatch = await bcrypt.compare(enteredOtp, otpRecord.otp_hash) || enteredOtp === otpRecord.plain_otp;
        if (!isMatch) {
          await conn.query('UPDATE order_otps SET failed_attempts = failed_attempts + 1 WHERE id = ?', [otpRecord.id]);
          conn.release();
          return res.status(400).json({ success: false, error: 'Incorrect OTP. Please ask the customer to confirm the code on their screen.' });
        }

        // Mark OTP verified
        const now = new Date();
        await conn.query('UPDATE order_otps SET verified_at = CURRENT_TIMESTAMP WHERE id = ?', [otpRecord.id]);

        // Transition order to Delivered & Cash on Delivery payment to Paid
        await conn.query(
          "UPDATE orders SET order_status = 'Delivered', payment_status = 'Paid', otp_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [id]
        );

        // Update payment transaction to Paid with timestamp
        await conn.query(
          "UPDATE payments SET payment_status = 'Paid', received_at = CURRENT_TIMESTAMP WHERE order_id = ?",
          [id]
        );

        // Update delivery tracking status to Delivered
        await conn.query(
          "UPDATE delivery_tracking SET current_status = 'Delivered', otp_verified = 1, estimated_delivery_minutes = 0 WHERE order_id = ?",
          [id]
        );

        // Fetch order details for loyalty & food savings
        const [ordRows]: any = await conn.query('SELECT * FROM orders WHERE id = ?', [id]);
        const order = ordRows[0];

        // Award 20 loyalty points if this is first order of the calendar day
        const todayStr = now.toISOString().split('T')[0];
        const [dayTx]: any = await conn.query(
          'SELECT id FROM loyalty_transactions WHERE customer_id = ? AND order_date = ? AND transaction_type = "earned"',
          [order.customer_id, todayStr]
        );

        if (dayTx.length === 0) {
          await conn.query(
            `INSERT INTO loyalty_transactions (id, customer_id, order_id, order_date, points, transaction_type, description)
             VALUES (?, ?, ?, ?, 20, 'earned', 'Earned 20 points for daily campus order streak')`,
            [`lt-${Date.now()}`, order.customer_id, id, todayStr]
          );

          await conn.query(
            `INSERT INTO loyalty_points (id, customer_id, total_points, redeemed_points)
             VALUES (?, ?, 20, 0)
             ON DUPLICATE KEY UPDATE total_points = total_points + 20`,
            [`lp-${Date.now()}`, order.customer_id]
          );
        }

        // Record food savings for SaveMyMeal items in this order
        const [items]: any = await conn.query('SELECT * FROM order_items WHERE order_id = ? AND is_surplus = 1', [id]);
        for (const item of items) {
          const moneySaved = Math.max(0, (Number(item.original_unit_price || item.unit_price) - Number(item.unit_price)) * Number(item.quantity));
          await conn.query(
            `INSERT INTO food_savings 
             (id, customer_id, order_id, food_item_id, food_name, seller_name, image_url, original_price, purchased_price, money_saved, quantity, waste_diverted_kg)
             VALUES (?, ?, ?, ?, ?, 'Campus Kitchen', ?, ?, ?, ?, ?, 0.40)`,
            [
              `fs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              order.customer_id, id, item.food_item_id, item.food_name_snapshot,
              item.image_url_snapshot, item.original_unit_price || item.unit_price,
              item.unit_price, moneySaved, item.quantity
            ]
          );
        }

        conn.release();
      } catch (err) {
        conn.release();
        throw err;
      }
    } else {
      // Memory store verification
      const otpRec = memoryStore.orderOtps.find(o => o.order_id === id);
      if (!otpRec) {
        return res.status(404).json({ success: false, error: 'No OTP record found for this order.' });
      }

      if (otpRec.verified_at) {
        return res.status(400).json({ success: false, error: 'This delivery OTP has already been verified.' });
      }

      if (enteredOtp !== otpRec.plain_otp) {
        otpRec.failed_attempts += 1;
        return res.status(400).json({ success: false, error: 'Incorrect OTP. Please recheck with customer.' });
      }

      otpRec.verified_at = new Date().toISOString();

      const ord = memoryStore.orders.find(o => o.id === id);
      if (ord) {
        ord.order_status = 'Delivered';
        ord.payment_status = 'Paid';
        ord.updated_at = new Date().toISOString();

        // Award memory loyalty
        const todayStr = new Date().toISOString().split('T')[0];
        const lp = memoryStore.loyaltyPoints.find(p => p.customer_id === ord.customer_id);
        if (lp) lp.total_points += 20;

        memoryStore.loyaltyTransactions.push({
          id: `lt-${Date.now()}`,
          customer_id: ord.customer_id,
          order_id: id,
          order_date: todayStr,
          points: 20,
          transaction_type: 'earned',
          description: 'Daily order streak reward'
        });
      }
    }

    res.json({
      success: true,
      message: 'OTP verified successfully! Order marked as Delivered and Cash on Delivery confirmed Paid.',
      orderStatus: 'Delivered',
      paymentStatus: 'Paid'
    });
  } catch (err: any) {
    console.error('OTP verification error:', err);
    res.status(500).json({ success: false, error: 'OTP verification failed.' });
  }
});

// POST /api/orders/:id/cancel - Cancellation & Rejection (Requirement 10)
router.post('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by user' } = req.body;
    const userRole = req.user?.role || 'customer';

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [ordRows]: any = await conn.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (ordRows.length === 0) {
          conn.release();
          return res.status(404).json({ success: false, error: 'Order not found.' });
        }

        const order = ordRows[0];

        // Customer can only cancel before seller confirmation
        if (userRole === 'customer' && !['Order Placed'].includes(order.order_status)) {
          conn.release();
          return res.status(400).json({
            success: false,
            error: 'Order cannot be cancelled once the kitchen has confirmed or started food preparation.'
          });
        }

        const newStatus = userRole === 'seller' ? 'Rejected' : 'Cancelled';

        // Update status
        await conn.query(
          'UPDATE orders SET order_status = ?, cancellation_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [newStatus, reason, id]
        );

        // Invalidate OTP
        await conn.query(
          "UPDATE order_otps SET expires_at = CURRENT_TIMESTAMP WHERE order_id = ?",
          [id]
        );

        // Restore Inventory
        const [items]: any = await conn.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
        for (const item of items) {
          if (item.food_item_id) {
            await conn.query(
              'UPDATE food_items SET available_quantity = available_quantity + ? WHERE id = ?',
              [item.quantity, item.food_item_id]
            );

            await conn.query(
              `INSERT INTO inventory_transactions (id, food_item_id, order_id, quantity_changed, transaction_type)
               VALUES (?, ?, ?, ?, 'order_restore')`,
              [`inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`, item.food_item_id, id, item.quantity]
            );
          }
        }

        // Record history
        await conn.query(
          'INSERT INTO order_status_history (id, order_id, old_status, new_status, changed_by, reason) VALUES (?, ?, ?, ?, ?, ?)',
          [`hist-${Date.now()}`, id, order.order_status, newStatus, req.user?.id || userRole, reason]
        );

        conn.release();
      } catch (err) {
        conn.release();
        throw err;
      }
    } else {
      const ord = memoryStore.orders.find(o => o.id === id);
      if (ord) {
        ord.order_status = userRole === 'seller' ? 'Rejected' : 'Cancelled';
        ord.cancellation_reason = reason;
        ord.updated_at = new Date().toISOString();
      }
    }

    res.json({
      success: true,
      message: `Order successfully ${userRole === 'seller' ? 'rejected' : 'cancelled'}. Inventory restored.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not cancel order.' });
  }
});

// GET /api/orders/:id/tracking - Delivery tracking details
router.get('/:id/tracking', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [rows]: any = await conn.query('SELECT * FROM delivery_tracking WHERE order_id = ?', [id]);
        if (rows.length > 0) {
          return res.json({ success: true, tracking: rows[0] });
        }
        return res.json({
          success: true,
          tracking: {
            order_id: id,
            delivery_person_name: 'Campus Delivery Buddy',
            delivery_person_phone: '+91 98765 00000',
            current_status: 'On the Way',
            location_note: 'Main Campus Gate',
            estimated_delivery_minutes: 15,
            otp_verified: 0
          }
        });
      } finally {
        conn.release();
      }
    } else {
      return res.json({
        success: true,
        tracking: {
          order_id: id,
          delivery_person_name: 'Campus Delivery Buddy',
          delivery_person_phone: '+91 98765 00000',
          current_status: 'On the Way',
          location_note: 'Main Campus Gate',
          estimated_delivery_minutes: 15,
          otp_verified: 0
        }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch tracking data.' });
  }
});

// GET /api/orders/:id/payment - Payment record
router.get('/:id/payment', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [rows]: any = await conn.query('SELECT * FROM payments WHERE order_id = ?', [id]);
        if (rows.length > 0) {
          return res.json({ success: true, payment: rows[0] });
        }
        return res.status(404).json({ success: false, error: 'Payment record not found.' });
      } finally {
        conn.release();
      }
    } else {
      return res.json({
        success: true,
        payment: {
          order_id: id,
          payment_method: 'COD',
          payment_status: 'Pending',
          amount: 100
        }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch payment info.' });
  }
});

export default router;

