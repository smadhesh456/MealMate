import { Router, Request, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/reviews - Get reviews (optional filter by foodId)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { foodId } = req.query;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        let query = `
          SELECT r.*, f.food_name, u.full_name as customer_name
          FROM reviews r
          LEFT JOIN food_items f ON r.food_item_id = f.id
          LEFT JOIN users u ON r.customer_id = u.id
        `;
        const params: any[] = [];
        if (foodId) {
          query += ' WHERE r.food_item_id = ?';
          params.push(foodId);
        }
        query += ' ORDER BY r.created_at DESC';

        const [rows]: any = await conn.query(query, params);
        const reviews = rows.map((r: any) => ({
          id: r.id,
          foodId: r.food_item_id,
          foodName: r.food_name,
          orderId: r.order_id,
          userId: r.customer_id,
          userName: r.customer_name || 'Campus Foodie',
          rating: Number(r.rating),
          comment: r.comment,
          createdAt: r.created_at
        }));

        return res.json({ success: true, reviews, data: reviews });
      } finally {
        conn.release();
      }
    } else {
      let revs = (memoryStore as any).reviews || [];
      if (foodId) {
        revs = revs.filter((r: any) => r.foodId === foodId || r.food_item_id === foodId);
      }
      return res.json({ success: true, reviews: revs, data: revs });
    }
  } catch (err: any) {
    console.error('Fetch reviews error:', err);
    res.status(500).json({ success: false, error: 'Could not fetch reviews.' });
  }
});

// POST /api/reviews - Add customer review
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user?.id;
    const customerName = req.user?.name || req.body.userName || 'Campus Foodie';
    const { foodId, orderId, rating = 5, comment } = req.body;

    if (!customerId || !foodId || !comment) {
      return res.status(400).json({ success: false, error: 'Food item and review comment are required.' });
    }

    const reviewId = `rev-${Date.now()}`;
    const cleanRating = Math.max(1, Math.min(5, Number(rating) || 5));

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      await conn.beginTransaction();
      try {
        await conn.query(
          `INSERT INTO reviews (id, order_id, food_item_id, customer_id, customer_name, rating, comment)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [reviewId, orderId || null, foodId, customerId, customerName, cleanRating, comment]
        );

        // Recalculate average rating & review count for the food item
        const [avgRows]: any = await conn.query(
          'SELECT COUNT(*) as cnt, AVG(rating) as avg_rating FROM reviews WHERE food_item_id = ?',
          [foodId]
        );
        const count = avgRows[0]?.cnt || 1;
        const avg = avgRows[0]?.avg_rating ? Number(avgRows[0].avg_rating).toFixed(1) : 4.8;

        await conn.query(
          'UPDATE food_items SET rating = ?, review_count = ? WHERE id = ?',
          [avg, count, foodId]
        );

        await conn.commit();
        conn.release();

        return res.json({ success: true, message: 'Review submitted successfully!', reviewId });
      } catch (e) {
        await conn.rollback();
        conn.release();
        throw e;
      }
    } else {
      if (!(memoryStore as any).reviews) (memoryStore as any).reviews = [];
      const newRev = {
        id: reviewId,
        foodId,
        orderId: orderId || null,
        userId: customerId,
        userName: customerName,
        rating: cleanRating,
        comment,
        createdAt: new Date().toISOString()
      };
      (memoryStore as any).reviews.unshift(newRev);

      const food = memoryStore.foodItems.find(f => f.id === foodId);
      if (food) {
        food.review_count = (food.review_count || 0) + 1;
      }

      return res.json({ success: true, message: 'Review submitted successfully!', reviewId });
    }
  } catch (err: any) {
    console.error('Submit review error:', err);
    res.status(500).json({ success: false, error: 'Could not submit review.' });
  }
});

// GET /api/reviews/food/:foodId - Food-specific reviews
router.get('/food/:foodId', async (req: Request, res: Response) => {
  try {
    const { foodId } = req.params;
    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [rows]: any = await conn.query(
          'SELECT * FROM reviews WHERE food_item_id = ? ORDER BY created_at DESC',
          [foodId]
        );
        const reviews = rows.map((r: any) => ({
          id: r.id,
          foodId: r.food_item_id,
          orderId: r.order_id,
          userId: r.customer_id,
          userName: r.customer_name,
          rating: Number(r.rating),
          comment: r.comment,
          createdAt: r.created_at
        }));
        return res.json({ success: true, reviews });
      } finally {
        conn.release();
      }
    } else {
      const revs = ((memoryStore as any).reviews || []).filter((r: any) => r.foodId === foodId || r.food_item_id === foodId);
      return res.json({ success: true, reviews: revs });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not fetch food reviews.' });
  }
});

export default router;
