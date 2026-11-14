import { Router, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/subscriptions - Get customer subscriptions
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        let query = `
          SELECT sub.*, s.kitchen_name as seller_name, u.full_name as customer_name
          FROM subscriptions sub
          LEFT JOIN sellers s ON sub.seller_id = s.id
          LEFT JOIN users u ON sub.customer_id = u.id
        `;
        const params: any[] = [];
        if (role !== 'admin') {
          query += ' WHERE sub.customer_id = ?';
          params.push(userId);
        }
        query += ' ORDER BY sub.created_at DESC';

        const [rows]: any = await conn.query(query, params);

        const subscriptions = rows.map((r: any) => ({
          id: r.id,
          customerId: r.customer_id,
          customerName: r.customer_name,
          sellerId: r.seller_id,
          sellerName: r.seller_name || 'Annapoorna Home Kitchen',
          planName: r.plan_name,
          planType: r.subscription_type,
          mealType: r.meal_type,
          startDate: r.start_date,
          endDate: r.end_date,
          deliverySlot: r.delivery_slot,
          status: r.status,
          totalAmount: Number(r.total_amount),
          createdAt: r.created_at
        }));

        return res.json({ success: true, subscriptions, data: subscriptions });
      } finally {
        conn.release();
      }
    } else {
      let subs = (memoryStore.subscriptions || []);
      if (role !== 'admin') {
        subs = subs.filter((s: any) => s.customerId === userId || s.customer_id === userId);
      }
      return res.json({ success: true, subscriptions: subs, data: subs });
    }
  } catch (err: any) {
    console.error('Fetch subscriptions error:', err);
    res.status(500).json({ success: false, error: 'Could not fetch subscriptions.' });
  }
});

// POST /api/subscriptions - Subscribe to a HomePlate meal pass
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user?.id;
    const {
      planName,
      planType = 'weekly', // 'weekly' (7 days) | 'monthly' (30 days)
      mealType = 'Lunch',
      sellerId = 'seller-1',
      deliverySlot = '12:30 PM - 1:30 PM',
      totalAmount = 560
    } = req.body;

    if (!customerId || !planName) {
      return res.status(400).json({ success: false, error: 'Plan name and customer are required.' });
    }

    const subId = `sub-${Date.now()}`;
    const days = planType === 'monthly' ? 30 : 7;
    const startDate = new Date();
    const endDate = new Date(Date.now() + days * 86400000);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      await conn.beginTransaction();
      try {
        await conn.query(
          `INSERT INTO subscriptions (id, customer_id, seller_id, plan_name, subscription_type, meal_type, start_date, end_date, delivery_slot, status, total_amount)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?)`,
          [subId, customerId, sellerId, planName, planType, mealType, startStr, endStr, deliverySlot, totalAmount]
        );

        // Pre-generate scheduled daily meal deliveries
        for (let i = 0; i < days; i++) {
          const dDate = new Date(Date.now() + i * 86400000).toISOString().split('T')[0];
          const subOrdId = `subord-${Date.now()}-${i}`;
          await conn.query(
            `INSERT INTO subscription_orders (id, subscription_id, delivery_date, meal_name, delivery_status)
             VALUES (?, ?, ?, ?, 'Scheduled')`,
            [subOrdId, subId, dDate, `${planName} (${mealType})`]
          );
        }

        await conn.commit();
        conn.release();

        return res.json({ success: true, message: 'Subscribed successfully to HomePlate meal pass!', subscriptionId: subId });
      } catch (e) {
        await conn.rollback();
        conn.release();
        throw e;
      }
    } else {
      if (!memoryStore.subscriptions) memoryStore.subscriptions = [];
      const newSub = {
        id: subId,
        customerId,
        sellerId,
        planName,
        planType,
        mealType,
        startDate: startStr,
        endDate: endStr,
        deliverySlot,
        status: 'Active',
        totalAmount: Number(totalAmount),
        createdAt: new Date().toISOString()
      };
      memoryStore.subscriptions.unshift(newSub);
      return res.json({ success: true, message: 'Subscribed successfully to HomePlate meal pass!', subscriptionId: subId });
    }
  } catch (err: any) {
    console.error('Create subscription error:', err);
    res.status(500).json({ success: false, error: 'Could not create subscription.' });
  }
});

// PATCH /api/subscriptions/:id/status - Update subscription status
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Active' | 'Paused' | 'Cancelled'

    if (!['Active', 'Paused', 'Cancelled', 'Expired', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid subscription status.' });
    }

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        await conn.query('UPDATE subscriptions SET status = ? WHERE id = ?', [status, id]);
        return res.json({ success: true, message: `Subscription status updated to ${status}.` });
      } finally {
        conn.release();
      }
    } else {
      const sub = (memoryStore.subscriptions || []).find((s: any) => s.id === id);
      if (sub) sub.status = status;
      return res.json({ success: true, message: `Subscription status updated to ${status}.` });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not update subscription status.' });
  }
});

// GET /api/subscriptions/:id/orders - Daily delivery schedule
router.get('/:id/orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [rows]: any = await conn.query(
          'SELECT * FROM subscription_orders WHERE subscription_id = ? ORDER BY delivery_date ASC',
          [id]
        );
        return res.json({ success: true, orders: rows });
      } finally {
        conn.release();
      }
    } else {
      return res.json({ success: true, orders: [] });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not fetch daily subscription schedule.' });
  }
});

export default router;

