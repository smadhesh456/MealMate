import { Router, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/complaints - List complaints
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        let query = `
          SELECT d.*, u.full_name as user_name, u.email as user_email, o.order_number
          FROM disputes d
          LEFT JOIN users u ON d.raised_by = u.id
          LEFT JOIN orders o ON d.order_id = o.id
        `;
        const params: any[] = [];
        if (role !== 'admin') {
          query += ' WHERE d.raised_by = ?';
          params.push(userId);
        }
        query += ' ORDER BY d.created_at DESC';

        const [rows]: any = await conn.query(query, params);
        const complaints = rows.map((r: any) => ({
          id: r.id,
          orderId: r.order_id,
          orderNumber: r.order_number || 'N/A',
          userId: r.raised_by,
          userName: r.user_name || 'Customer',
          userEmail: r.user_email || '',
          reason: r.reason,
          description: r.description,
          status: r.resolution_status === 'resolved' ? 'Resolved' : r.resolution_status === 'under_review' ? 'Investigating' : 'Pending',
          resolutionNotes: r.admin_response,
          createdAt: r.created_at
        }));

        return res.json({ success: true, complaints, data: complaints });
      } finally {
        conn.release();
      }
    } else {
      let comps = memoryStore.disputes || [];
      if (role !== 'admin') {
        comps = comps.filter((c: any) => c.raised_by === userId || c.userId === userId);
      }
      return res.json({ success: true, complaints: comps, data: comps });
    }
  } catch (err: any) {
    console.error('Fetch complaints error:', err);
    res.status(500).json({ success: false, error: 'Could not fetch complaints.' });
  }
});

// POST /api/complaints - Raise complaint
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { orderId, reason, description } = req.body;

    if (!userId || !reason || !description) {
      return res.status(400).json({ success: false, error: 'Reason and description are required.' });
    }

    const disputeId = `disp-${Date.now()}`;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        await conn.query(
          `INSERT INTO disputes (id, order_id, raised_by, reason, description, resolution_status)
           VALUES (?, ?, ?, ?, ?, 'pending')`,
          [disputeId, orderId || null, userId, reason, description]
        );
        return res.json({ success: true, message: 'Complaint registered. Our campus team will review it shortly.', complaintId: disputeId });
      } finally {
        conn.release();
      }
    } else {
      if (!memoryStore.disputes) memoryStore.disputes = [];
      const newDisp = {
        id: disputeId,
        orderId: orderId || 'N/A',
        userId,
        userName: req.user?.name || 'Customer',
        reason,
        description,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      memoryStore.disputes.unshift(newDisp);
      return res.json({ success: true, message: 'Complaint registered.', complaintId: disputeId });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not register complaint.' });
  }
});

// PATCH /api/complaints/:id/status - Update resolution status (Admin)
router.patch('/:id/status', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const dbStatus = status === 'Resolved' ? 'resolved' : status === 'Investigating' ? 'under_review' : 'pending';

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        await conn.query(
          'UPDATE disputes SET resolution_status = ?, admin_response = ? WHERE id = ?',
          [dbStatus, notes || null, id]
        );
        return res.json({ success: true, message: 'Complaint resolution updated.' });
      } finally {
        conn.release();
      }
    } else {
      const comp = (memoryStore.disputes || []).find((c: any) => c.id === id);
      if (comp) {
        comp.status = status;
        if (notes) comp.resolutionNotes = notes;
      }
      return res.json({ success: true, message: 'Complaint resolution updated.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not update complaint resolution.' });
  }
});

export default router;

