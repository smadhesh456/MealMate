import { Router, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/inventory - Get stock inventory list for seller/admin
router.get('/', authenticateToken, requireRole(['seller', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.role === 'seller' ? (req.user as any).sellerId || 'seller-1' : req.query.seller_id;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        let query = `
          SELECT 
            fi.id as inventory_id,
            fi.current_stock,
            fi.minimum_threshold,
            fi.last_restocked_at,
            f.id as food_id,
            f.food_name,
            f.image_url,
            f.price,
            f.is_available,
            f.available_quantity,
            f.module,
            s.kitchen_name as seller_name
          FROM food_items f
          LEFT JOIN food_inventory fi ON f.id = fi.food_item_id
          LEFT JOIN sellers s ON f.seller_id = s.id
        `;
        const params: any[] = [];
        if (sellerId) {
          query += ' WHERE f.seller_id = ?';
          params.push(sellerId);
        }
        query += ' ORDER BY f.available_quantity ASC';

        const [rows]: any = await conn.query(query, params);
        const inventory = rows.map((r: any) => ({
          id: r.inventory_id || `inv-${r.food_id}`,
          foodId: r.food_id,
          foodName: r.food_name,
          image: r.image_url,
          price: Number(r.price),
          stockQuantity: Number(r.available_quantity ?? r.current_stock ?? 0),
          minimumThreshold: Number(r.minimum_threshold || 5),
          isAvailable: Boolean(r.is_available),
          module: r.module,
          sellerName: r.seller_name,
          lastRestockedAt: r.last_restocked_at
        }));

        return res.json({ success: true, inventory, data: inventory });
      } finally {
        conn.release();
      }
    } else {
      let items = memoryStore.foodItems;
      if (sellerId) {
        items = items.filter(f => f.seller_id === sellerId);
      }
      const inventory = items.map(f => ({
        id: `inv-${f.id}`,
        foodId: f.id,
        foodName: f.food_name,
        image: f.image_url,
        price: Number(f.price),
        stockQuantity: Number(f.available_quantity || 0),
        minimumThreshold: 5,
        isAvailable: Boolean(f.is_available),
        module: f.module,
        sellerName: 'Campus Kitchen'
      }));
      return res.json({ success: true, inventory, data: inventory });
    }
  } catch (err: any) {
    console.error('Fetch inventory error:', err);
    res.status(500).json({ success: false, error: 'Could not fetch inventory.' });
  }
});

// PUT /api/inventory/:foodId - Update stock count and threshold
router.put('/:foodId', authenticateToken, requireRole(['seller', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { foodId } = req.params;
    const { stockQuantity, minimumThreshold } = req.body;

    const qty = Number(stockQuantity);
    const isAvail = qty > 0 ? 1 : 0;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      await conn.beginTransaction();
      try {
        await conn.query(
          'UPDATE food_items SET available_quantity = ?, is_available = ? WHERE id = ?',
          [qty, isAvail, foodId]
        );

        // Upsert into food_inventory
        const [existing]: any = await conn.query('SELECT id FROM food_inventory WHERE food_item_id = ?', [foodId]);
        if (existing.length > 0) {
          await conn.query(
            'UPDATE food_inventory SET current_stock = ?, minimum_threshold = COALESCE(?, minimum_threshold), last_restocked_at = CURRENT_TIMESTAMP WHERE food_item_id = ?',
            [qty, minimumThreshold, foodId]
          );
        } else {
          const invId = `inv-${Date.now()}`;
          const [fRows]: any = await conn.query('SELECT seller_id FROM food_items WHERE id = ?', [foodId]);
          const sId = fRows[0]?.seller_id || 'seller-1';
          await conn.query(
            'INSERT INTO food_inventory (id, food_item_id, seller_id, current_stock, minimum_threshold) VALUES (?, ?, ?, ?, ?)',
            [invId, foodId, sId, qty, minimumThreshold || 5]
          );
        }

        // Log transaction
        await conn.query(
          `INSERT INTO inventory_transactions (id, food_item_id, order_id, quantity_changed, transaction_type)
           VALUES (?, ?, NULL, ?, 'seller_restock')`,
          [`invt-${Date.now()}`, foodId, qty]
        );

        await conn.commit();
        conn.release();

        return res.json({ success: true, message: 'Stock updated successfully.' });
      } catch (e) {
        await conn.rollback();
        conn.release();
        throw e;
      }
    } else {
      const item = memoryStore.foodItems.find(f => f.id === foodId);
      if (item) {
        item.available_quantity = qty;
        item.is_available = isAvail;
      }
      return res.json({ success: true, message: 'Stock updated successfully.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not update inventory.' });
  }
});

// GET /api/inventory/logs - Transaction audit logs
router.get('/logs', authenticateToken, requireRole(['seller', 'admin']), async (_req: AuthRequest, res: Response) => {
  try {
    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [rows]: any = await conn.query(
          `SELECT it.*, f.food_name 
           FROM inventory_transactions it
           JOIN food_items f ON it.food_item_id = f.id
           ORDER BY it.created_at DESC LIMIT 50`
        );
        return res.json({ success: true, logs: rows });
      } finally {
        conn.release();
      }
    } else {
      return res.json({ success: true, logs: [] });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not fetch logs.' });
  }
});

export default router;
