import { Router, Request, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';

const router = Router();

// GET /api/surplus - SaveMyMeal surplus foods with live countdowns & dynamic cutoff logic
router.get('/', async (_req: Request, res: Response) => {
  try {
    let items: any[] = [];

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      const [rows]: any = await conn.query(
        `SELECT f.*, s.kitchen_name as seller_name
         FROM food_items f
         LEFT JOIN sellers s ON f.seller_id = s.id
         WHERE f.module = 'SaveMyMeal'
         ORDER BY f.price ASC`
      );
      items = rows;
      conn.release();
    } else {
      items = memoryStore.foodItems.filter(f => f.module === 'SaveMyMeal').map(f => {
        const s = memoryStore.sellers.find(sel => sel.id === f.seller_id);
        return { ...f, seller_name: s ? s.kitchen_name : 'Campus Partner Restaurant' };
      });
    }

    const now = new Date();
    // Default cutoff to 4 hours from current time today
    const defaultCutoff = new Date(now.getTime() + 4 * 3600 * 1000);

    const formatted = items.map(item => {
      const originalPrice = Number(item.original_price || item.price * 1.6);
      const price = Number(item.price);
      const discountPercentage = Math.min(45, Math.round(((originalPrice - price) / originalPrice) * 100));
      const portions = Number(item.available_quantity);

      const cutoffTime = defaultCutoff.toISOString();
      const isPastCutoff = now.getTime() >= defaultCutoff.getTime();
      const isSoldOut = portions <= 0;

      let status = 'ACTIVE';
      if (isSoldOut) {
        status = 'SOLD OUT';
      } else if (isPastCutoff) {
        status = 'EXPIRED';
      }

      const isOrderable = status === 'ACTIVE';
      const timeLeftSeconds = Math.max(0, Math.floor((defaultCutoff.getTime() - now.getTime()) / 1000));

      return {
        id: item.id,
        name: item.food_name,
        description: item.description,
        sellerName: item.seller_name || 'Campus Partner Restaurant',
        sellerId: item.seller_id,
        price,
        originalPrice,
        discountPercentage,
        portions,
        isVeg: item.food_type === 'veg',
        image: item.image_url,
        cutoffTime,
        status,
        isOrderable,
        timeLeftSeconds,
        category: 'SaveMyMeal Surplus'
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      surplusMeals: formatted,
      data: formatted
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch surplus meals.' });
  }
});

export default router;

