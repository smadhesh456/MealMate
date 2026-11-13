import { Router, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/loyalty/status - Customer 5-Day Loyalty Hub
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user?.id;
    let totalPoints = 0;
    let redeemedPoints = 0;
    let transactions: any[] = [];

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      const [ptRows]: any = await conn.query('SELECT * FROM loyalty_points WHERE customer_id = ?', [customerId]);
      if (ptRows.length > 0) {
        totalPoints = Number(ptRows[0].total_points);
        redeemedPoints = Number(ptRows[0].redeemed_points);
      }

      const [txRows]: any = await conn.query(
        'SELECT * FROM loyalty_transactions WHERE customer_id = ? ORDER BY created_at DESC',
        [customerId]
      );
      transactions = txRows;
      conn.release();
    } else {
      const p = memoryStore.loyaltyPoints.find(lp => lp.customer_id === customerId);
      if (p) {
        totalPoints = p.total_points;
        redeemedPoints = p.redeemed_points;
      }
      transactions = memoryStore.loyaltyTransactions.filter(tx => tx.customer_id === customerId);
    }

    // Calculate unique order days
    const uniqueOrderDates = Array.from(new Set(
      transactions
        .filter(t => t.transaction_type === 'earned' && t.order_date)
        .map(t => t.order_date)
    ));

    const daysCount = Math.min(5, uniqueOrderDates.length);
    const daysRemaining = Math.max(0, 5 - daysCount);
    const canRedeem = totalPoints >= 100;

    let statusText = '';
    if (canRedeem) {
      statusText = '🎉 Congratulations! You have reached 100 loyalty points. A flat 20% discount is ready for your next meal subtotal!';
    } else if (daysCount === 0) {
      statusText = 'Place an order on 5 unique days to earn 100 points and unlock 20% off your food subtotal!';
    } else {
      statusText = `Awesome streak! Order on ${daysRemaining} more unique day${daysRemaining > 1 ? 's' : ''} to reach 100 points and unlock 20% OFF!`;
    }

    res.json({
      success: true,
      loyalty: {
        totalPoints,
        redeemedPoints,
        daysCount,
        daysRemaining,
        canRedeem,
        statusText,
        uniqueOrderDates,
        transactions
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch loyalty status.' });
  }
});

export default router;

