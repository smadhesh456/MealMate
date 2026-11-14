import { Router, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/addresses - Fetch all saved addresses for current user
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
          'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
          [userId]
        );
        const addresses = rows.map((r: any) => ({
          id: r.id,
          title: r.address_title,
          address: r.full_address,
          city: r.city,
          pincode: r.postal_code,
          phone: r.phone,
          isDefault: Boolean(r.is_default)
        }));
        return res.json({ success: true, addresses, data: addresses });
      } finally {
        conn.release();
      }
    } else {
      const addresses = (memoryStore.addresses || [])
        .filter((a: any) => a.customer_id === userId || a.user_id === userId)
        .map((a: any) => ({
          id: a.id,
          title: a.address_title,
          address: a.full_address,
          city: a.city,
          pincode: a.postal_code,
          phone: a.phone,
          isDefault: Boolean(a.is_default)
        }));
      return res.json({ success: true, addresses, data: addresses });
    }
  } catch (err: any) {
    console.error('Fetch addresses error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch addresses.' });
  }
});

// POST /api/addresses - Add new address
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, address, city = 'Campus', pincode = '600001', phone = '+91 98765 44444', isDefault = false } = req.body;

    if (!userId || !title || !address) {
      return res.status(400).json({ success: false, error: 'Title and full address are required.' });
    }

    const addrId = `addr-${Date.now()}`;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        if (isDefault) {
          await conn.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [userId]);
        }
        await conn.query(
          `INSERT INTO user_addresses (id, user_id, address_title, full_address, city, postal_code, phone, is_default)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [addrId, userId, title, address, city, pincode, phone, isDefault ? 1 : 0]
        );
        return res.json({ success: true, message: 'Address added successfully.', addressId: addrId });
      } finally {
        conn.release();
      }
    } else {
      if (!memoryStore.addresses) memoryStore.addresses = [];
      if (isDefault) {
        memoryStore.addresses.forEach((a: any) => {
          if (a.customer_id === userId || a.user_id === userId) a.is_default = 0;
        });
      }
      memoryStore.addresses.unshift({
        id: addrId,
        customer_id: userId,
        user_id: userId,
        address_title: title,
        full_address: address,
        city,
        postal_code: pincode,
        phone,
        is_default: isDefault ? 1 : 0,
        created_at: new Date().toISOString()
      });
      return res.json({ success: true, message: 'Address added successfully.', addressId: addrId });
    }
  } catch (err: any) {
    console.error('Create address error:', err);
    res.status(500).json({ success: false, error: 'Failed to save address.' });
  }
});

// PUT /api/addresses/:id - Update existing address
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, address, city, pincode, phone, isDefault } = req.body;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        if (isDefault) {
          await conn.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [userId]);
        }
        await conn.query(
          `UPDATE user_addresses SET 
            address_title = COALESCE(?, address_title),
            full_address = COALESCE(?, full_address),
            city = COALESCE(?, city),
            postal_code = COALESCE(?, postal_code),
            phone = COALESCE(?, phone),
            is_default = COALESCE(?, is_default)
           WHERE id = ? AND user_id = ?`,
          [title, address, city, pincode, phone, isDefault !== undefined ? (isDefault ? 1 : 0) : null, id, userId]
        );
        return res.json({ success: true, message: 'Address updated successfully.' });
      } finally {
        conn.release();
      }
    } else {
      const addr = (memoryStore.addresses || []).find((a: any) => a.id === id && (a.customer_id === userId || a.user_id === userId));
      if (addr) {
        if (isDefault) {
          memoryStore.addresses.forEach((a: any) => {
            if (a.customer_id === userId || a.user_id === userId) a.is_default = 0;
          });
        }
        if (title) addr.address_title = title;
        if (address) addr.full_address = address;
        if (city) addr.city = city;
        if (pincode) addr.postal_code = pincode;
        if (phone) addr.phone = phone;
        if (isDefault !== undefined) addr.is_default = isDefault ? 1 : 0;
      }
      return res.json({ success: true, message: 'Address updated successfully.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update address.' });
  }
});

// DELETE /api/addresses/:id - Delete an address
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        await conn.query('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [id, userId]);
        return res.json({ success: true, message: 'Address removed successfully.' });
      } finally {
        conn.release();
      }
    } else {
      if (memoryStore.addresses) {
        memoryStore.addresses = memoryStore.addresses.filter((a: any) => !(a.id === id && (a.customer_id === userId || a.user_id === userId)));
      }
      return res.json({ success: true, message: 'Address removed successfully.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to delete address.' });
  }
});

// PUT /api/addresses/:id/default - Set as default address
router.put('/:id/default', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        await conn.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [userId]);
        await conn.query('UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?', [id, userId]);
        return res.json({ success: true, message: 'Default address updated.' });
      } finally {
        conn.release();
      }
    } else {
      if (memoryStore.addresses) {
        memoryStore.addresses.forEach((a: any) => {
          if (a.customer_id === userId || a.user_id === userId) {
            a.is_default = a.id === id ? 1 : 0;
          }
        });
      }
      return res.json({ success: true, message: 'Default address updated.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to set default address.' });
  }
});

export default router;

