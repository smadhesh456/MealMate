import { Router, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/admin/stats - Campus Analytics Overview
router.get('/stats', authenticateToken, requireRole(['admin']), async (_req: AuthRequest, res: Response) => {
  try {
    let customerCount = 0;
    let sellerCount = 0;
    let orderCount = 0;
    let totalRevenue = 0;
    let totalDelivered = 0;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      const [uRows]: any = await conn.query('SELECT role, COUNT(*) as cnt FROM users GROUP BY role');
      for (const row of uRows) {
        if (row.role === 'customer') customerCount = row.cnt;
        if (row.role === 'seller') sellerCount = row.cnt;
      }

      const [oRows]: any = await conn.query('SELECT COUNT(*) as total, SUM(final_total) as revenue FROM orders');
      orderCount = oRows[0]?.total || 0;
      totalRevenue = Number(oRows[0]?.revenue || 0);

      const [dRows]: any = await conn.query("SELECT COUNT(*) as cnt FROM orders WHERE order_status = 'Delivered'");
      totalDelivered = dRows[0]?.cnt || 0;

      conn.release();
    } else {
      customerCount = memoryStore.users.filter(u => u.role === 'customer').length;
      sellerCount = memoryStore.sellers.length;
      orderCount = memoryStore.orders.length;
      totalDelivered = memoryStore.orders.filter(o => o.order_status === 'Delivered').length;
      totalRevenue = memoryStore.orders.reduce((sum, o) => sum + Number(o.final_total), 0);
    }

    res.json({
      success: true,
      stats: {
        customerCount,
        sellerCount,
        orderCount,
        totalDelivered,
        totalRevenue,
        wasteDivertedKg: Number((totalDelivered * 0.40).toFixed(2))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch admin statistics.' });
  }
});

// GET /api/admin/customers - Manage Customers
router.get('/customers', authenticateToken, requireRole(['admin']), async (_req: AuthRequest, res: Response) => {
  try {
    let customers: any[] = [];
    if (getDbConnected()) {
      const conn = await pool.getConnection();
      const [rows]: any = await conn.query(
        "SELECT id, full_name as name, email, phone, role, account_status, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC"
      );
      customers = rows;
      conn.release();
    } else {
      customers = memoryStore.users.filter(u => u.role === 'customer').map(u => ({
        id: u.id,
        name: u.full_name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        account_status: u.account_status,
        created_at: u.created_at
      }));
    }

    res.json({ success: true, count: customers.length, customers });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve customer accounts.' });
  }
});

// POST /api/admin/customers/:id/toggle-status - Deactivate or reactivate customer
router.post('/customers/:id/toggle-status', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    let newStatus = 'active';

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      const [rows]: any = await conn.query('SELECT account_status FROM users WHERE id = ?', [id]);
      if (rows.length === 0) {
        conn.release();
        return res.status(404).json({ success: false, error: 'User not found.' });
      }
      newStatus = rows[0].account_status === 'active' ? 'deactivated' : 'active';
      await conn.query('UPDATE users SET account_status = ? WHERE id = ?', [newStatus, id]);
      conn.release();
    } else {
      const u = memoryStore.users.find(usr => usr.id === id);
      if (u) {
        u.account_status = u.account_status === 'active' ? 'deactivated' : 'active';
        newStatus = u.account_status;
      }
    }

    res.json({ success: true, message: `Account status updated to ${newStatus}.`, newStatus });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to toggle account status.' });
  }
});

// GET /api/admin/sellers - Manage Sellers
router.get('/sellers', authenticateToken, requireRole(['admin']), async (_req: AuthRequest, res: Response) => {
  try {
    let sellers: any[] = [];
    if (getDbConnected()) {
      const conn = await pool.getConnection();
      const [rows]: any = await conn.query(
        `SELECT s.*, u.full_name as owner_name, u.email, u.phone, u.account_status 
         FROM sellers s
         JOIN users u ON s.user_id = u.id
         ORDER BY s.created_at DESC`
      );
      sellers = rows;
      conn.release();
    } else {
      sellers = memoryStore.sellers.map(s => {
        const u = memoryStore.users.find(usr => usr.id === s.user_id);
        return {
          ...s,
          owner_name: u ? u.full_name : 'Seller Owner',
          email: u ? u.email : 'seller@mealmate.com',
          phone: u ? u.phone : '+91 98765 22222',
          account_status: u ? u.account_status : 'active'
        };
      });
    }

    res.json({ success: true, count: sellers.length, sellers });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve sellers list.' });
  }
});

// POST /api/admin/sellers/:id/verify - Approve / Reject Seller
router.post('/sellers/:id/verify', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be approved or rejected.' });
    }

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      await conn.query('UPDATE sellers SET approval_status = ? WHERE id = ?', [status, id]);
      conn.release();
    } else {
      const s = memoryStore.sellers.find(sel => sel.id === id);
      if (s) s.approval_status = status;
    }

    res.json({ success: true, message: `Seller verification status set to ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not update seller status.' });
  }
});

export default router;

