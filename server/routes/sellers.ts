import { Router, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/sellers/dashboard - Seller Business Metrics (Sales, Earnings, Orders)
router.get('/dashboard', authenticateToken, requireRole(['seller', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = (req.user as any)?.sellerId || 'seller-1';
    let sellerProfile: any = null;
    let orders: any[] = [];
    let foodItems: any[] = [];

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      const [sRows]: any = await conn.query('SELECT * FROM sellers WHERE id = ?', [sellerId]);
      if (sRows.length > 0) sellerProfile = sRows[0];

      const [fRows]: any = await conn.query('SELECT * FROM food_items WHERE seller_id = ?', [sellerId]);
      foodItems = fRows;

      const [oRows]: any = await conn.query('SELECT * FROM orders WHERE seller_id = ?', [sellerId]);
      orders = oRows;

      conn.release();
    } else {
      sellerProfile = memoryStore.sellers.find(s => s.id === sellerId) || memoryStore.sellers[0];
      foodItems = memoryStore.foodItems.filter(f => f.seller_id === sellerId);
      orders = memoryStore.orders.filter(o => o.seller_id === sellerId);
    }

    const deliveredOrders = orders.filter(o => o.order_status === 'Delivered');
    const pendingOrders = orders.filter(o => o.order_status !== 'Delivered' && o.order_status !== 'Cancelled' && o.order_status !== 'Rejected');
    const cancelledOrders = orders.filter(o => o.order_status === 'Cancelled' || o.order_status === 'Rejected');

    const totalEarnings = deliveredOrders.reduce((sum, o) => sum + Number(o.subtotal || o.final_total), 0);

    res.json({
      success: true,
      metrics: {
        kitchenName: sellerProfile?.kitchen_name || 'My Campus Kitchen',
        address: sellerProfile?.address || 'Campus Kitchen',
        approvalStatus: sellerProfile?.approval_status || 'approved',
        totalOrdersCount: orders.length,
        deliveredCount: deliveredOrders.length,
        pendingCount: pendingOrders.length,
        cancelledCount: cancelledOrders.length,
        totalEarnings,
        activeListingsCount: foodItems.filter(f => f.is_available).length,
        foodItems: foodItems.map(f => ({
          id: f.id,
          name: f.food_name,
          price: Number(f.price),
          stockQuantity: f.available_quantity,
          isAvailable: Boolean(f.is_available),
          image: f.image_url,
          isVeg: f.food_type === 'veg',
          module: f.module
        }))
      }
    });
  } catch (err) {
    console.error('Seller dashboard error:', err);
    res.status(500).json({ success: false, error: 'Could not fetch seller dashboard data.' });
  }
});

// PUT /api/sellers/kitchen - Update Kitchen Details
router.put('/kitchen', authenticateToken, requireRole(['seller', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = (req.user as any)?.sellerId || 'seller-1';
    const { kitchen_name, description, address } = req.body;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      await conn.query(
        'UPDATE sellers SET kitchen_name = COALESCE(?, kitchen_name), description = COALESCE(?, description), address = COALESCE(?, address) WHERE id = ?',
        [kitchen_name, description, address, sellerId]
      );
      conn.release();
    } else {
      const s = memoryStore.sellers.find(sel => sel.id === sellerId);
      if (s) {
        if (kitchen_name) s.kitchen_name = kitchen_name;
        if (description) s.description = description;
        if (address) s.address = address;
      }
    }

    res.json({ success: true, message: 'Kitchen details updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update kitchen details.' });
  }
});

export default router;

