import { Router, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications - List notifications for current user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [rows]: any = await conn.query(
          'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
          [userId]
        );
        const notifications = rows.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          title: r.title,
          message: r.message,
          type: r.notification_type,
          isRead: Boolean(r.is_read),
          createdAt: r.created_at
        }));
        return res.json({ success: true, notifications, data: notifications });
      } finally {
        conn.release();
      }
    } else {
      const notifs = (memoryStore.notifications || [])
        .filter((n: any) => n.user_id === userId)
        .map((n: any) => ({
          id: n.id,
          userId: n.user_id,
          title: n.title,
          message: n.message,
          type: n.notification_type,
          isRead: Boolean(n.is_read),
          createdAt: n.created_at
        }));
      return res.json({ success: true, notifications: notifs, data: notifs });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not fetch notifications.' });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        await conn.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
        return res.json({ success: true, message: 'Notification marked as read.' });
      } finally {
        conn.release();
      }
    } else {
      const notif = (memoryStore.notifications || []).find((n: any) => n.id === id && n.user_id === userId);
      if (notif) notif.is_read = 1;
      return res.json({ success: true, message: 'Notification marked as read.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not update notification.' });
  }
});

export default router;
