import { Router, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/savings/my-impact - Customer's verified food savings & environmental metrics
router.get('/my-impact', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user?.id;
    let savingsList: any[] = [];
    let completedOrdersCount = 0;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      // Only successfully DELIVERED orders count!
      const [rows]: any = await conn.query(
        `SELECT fs.*, o.order_number, o.order_status, o.created_at as order_created_at
         FROM food_savings fs
         INNER JOIN orders o ON fs.order_id = o.id
         WHERE fs.customer_id = ? AND o.order_status = 'Delivered'
         ORDER BY fs.created_at DESC`,
        [customerId]
      );
      savingsList = rows;

      const [ordRows]: any = await conn.query(
        "SELECT COUNT(*) as count FROM orders WHERE customer_id = ? AND order_status = 'Delivered'",
        [customerId]
      );
      completedOrdersCount = ordRows[0]?.count || 0;

      conn.release();
    } else {
      savingsList = memoryStore.foodSavings.filter(fs => fs.customer_id === customerId);
      completedOrdersCount = memoryStore.orders.filter(o => o.customer_id === customerId && o.order_status === 'Delivered').length;
    }

    const totalItemsPurchased = savingsList.length;
    const totalMealsRescued = savingsList.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0);
    const totalMoneySaved = savingsList.reduce((acc, curr) => acc + Number(curr.money_saved || 0), 0);
    const estimatedWasteDivertedKg = Number((totalMealsRescued * 0.40).toFixed(2)); // ~0.4kg per meal
    const estimatedCo2ReducedKg = Number((totalMealsRescued * 1.05).toFixed(2)); // ~1.05kg CO2 diverted per meal

    res.json({
      success: true,
      impact: {
        totalItemsPurchased,
        totalMealsRescued,
        totalMoneySaved,
        totalCompletedOrders: completedOrdersCount,
        estimatedWasteDivertedKg,
        estimatedCo2ReducedKg,
        savingsHistory: savingsList.map(s => ({
          id: s.id,
          orderId: s.order_id,
          orderNumber: s.order_number || s.order_id,
          foodName: s.food_name,
          sellerName: s.seller_name,
          image: s.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          originalPrice: Number(s.original_price),
          purchasedPrice: Number(s.purchased_price),
          moneySaved: Number(s.money_saved),
          quantity: Number(s.quantity) || 1,
          date: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Recent',
          status: 'Delivered'
        }))
      }
    });
  } catch (err) {
    console.error('Savings impact error:', err);
    res.status(500).json({ success: false, error: 'Could not fetch food savings impact.' });
  }
});

export default router;

