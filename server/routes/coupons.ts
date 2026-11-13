import { Router, Request, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';

const router = Router();

// GET /api/coupons - List all active campus coupons
router.get('/', async (_req: Request, res: Response) => {
  try {
    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [rows]: any = await conn.query('SELECT * FROM coupons WHERE is_active = 1');
        const coupons = rows.map((c: any) => ({
          id: c.id,
          code: c.coupon_code,
          discountType: c.discount_type,
          discountValue: Number(c.discount_value),
          minOrderAmount: Number(c.minimum_order_amount),
          maxDiscount: c.maximum_discount ? Number(c.maximum_discount) : undefined,
          isActive: Boolean(c.is_active)
        }));
        return res.json({ success: true, coupons });
      } finally {
        conn.release();
      }
    } else {
      const coupons = (memoryStore.coupons || []).filter((c: any) => c.is_active).map((c: any) => ({
        id: c.id,
        code: c.coupon_code,
        discountType: c.discount_type,
        discountValue: Number(c.discount_value),
        minOrderAmount: Number(c.minimum_order_amount || 0),
        maxDiscount: c.maximum_discount ? Number(c.maximum_discount) : undefined,
        isActive: true
      }));
      return res.json({ success: true, coupons });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not fetch coupons.' });
  }
});

// POST /api/coupons/validate - Check code against subtotal
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Coupon code is required.' });
    }

    const cleanCode = code.toString().trim().toUpperCase();

    let coupon: any = null;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [rows]: any = await conn.query('SELECT * FROM coupons WHERE coupon_code = ? AND is_active = 1', [cleanCode]);
        if (rows.length > 0) coupon = rows[0];
      } finally {
        conn.release();
      }
    } else {
      coupon = memoryStore.coupons.find(c => c.coupon_code === cleanCode && c.is_active);
    }

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid or expired coupon code.' });
    }

    const minAmount = Number(coupon.minimum_order_amount || 0);
    if (subtotal < minAmount) {
      return res.status(400).json({
        success: false,
        error: `Minimum order amount for ${cleanCode} is ₹${minAmount}. Current subtotal is ₹${subtotal}.`
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((subtotal * Number(coupon.discount_value)) / 100);
      if (coupon.maximum_discount && discount > Number(coupon.maximum_discount)) {
        discount = Number(coupon.maximum_discount);
      }
    } else {
      discount = Number(coupon.discount_value);
    }

    return res.json({
      success: true,
      coupon: {
        code: coupon.coupon_code,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value),
        calculatedDiscount: discount,
        message: `Applied coupon ${cleanCode}! You saved ₹${discount}.`
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not validate coupon.' });
  }
});

export default router;
