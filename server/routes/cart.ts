import { Router, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper to calculate bill
const calculateCartBill = (items: any[], couponDiscount = 0, useLoyalty = false) => {
  const itemTotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const deliveryFee = itemTotal >= 300 || itemTotal === 0 ? 0 : 25;
  const platformFee = itemTotal > 0 ? 5 : 0;
  const loyaltyDiscount = useLoyalty && itemTotal > 0 ? Math.round(itemTotal * 0.20) : 0;
  const finalTotal = Math.max(0, itemTotal - couponDiscount - loyaltyDiscount + deliveryFee + platformFee);

  return {
    itemTotal,
    savingsTotal: items.reduce((sum, it) => sum + ((Number(it.originalPrice || it.price) - Number(it.price)) * Number(it.quantity)), 0),
    deliveryFee,
    platformFee,
    couponDiscount,
    loyaltyDiscount,
    finalTotal
  };
};

// GET /api/cart - Get user cart with item details and bill
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        // Ensure user has a cart
        let [cartRows]: any = await conn.query('SELECT * FROM carts WHERE user_id = ?', [userId]);
        let cartId = '';
        let couponCode = '';
        let useRewardPoints = false;

        if (cartRows.length === 0) {
          cartId = `cart-${Date.now()}`;
          await conn.query('INSERT INTO carts (id, user_id) VALUES (?, ?)', [cartId, userId]);
        } else {
          cartId = cartRows[0].id;
          couponCode = cartRows[0].coupon_code || '';
          useRewardPoints = Boolean(cartRows[0].use_reward_points);
        }

        // Fetch cart items joined with food_items
        const [itemRows]: any = await conn.query(
          `SELECT 
            ci.id as cart_item_id,
            ci.quantity,
            f.id as food_id,
            f.food_name as name,
            f.image_url as image,
            f.price,
            f.original_price as originalPrice,
            f.food_type,
            f.module,
            f.available_quantity as stockQuantity,
            f.is_available as isAvailable,
            f.seller_id as sellerId,
            s.kitchen_name as sellerName
           FROM cart_items ci
           JOIN food_items f ON ci.food_item_id = f.id
           LEFT JOIN sellers s ON f.seller_id = s.id
           WHERE ci.cart_id = ?`,
          [cartId]
        );

        let couponDiscount = 0;
        if (couponCode) {
          const [cpn]: any = await conn.query('SELECT * FROM coupons WHERE coupon_code = ? AND is_active = 1', [couponCode]);
          if (cpn.length > 0) {
            couponDiscount = Number(cpn[0].discount_value);
          }
        }

        const items = itemRows.map((r: any) => ({
          cartItemId: r.cart_item_id,
          foodId: r.food_id,
          name: r.name,
          image: r.image,
          price: Number(r.price),
          originalPrice: r.originalPrice ? Number(r.originalPrice) : Number(r.price),
          quantity: Number(r.quantity),
          lineTotal: Number(r.price) * Number(r.quantity),
          sellerId: r.sellerId,
          sellerName: r.sellerName || 'Campus Kitchen',
          module: r.module,
          isVeg: r.food_type === 'veg',
          stockQuantity: Number(r.stockQuantity),
          isAvailable: Boolean(r.isAvailable)
        }));

        const bill = calculateCartBill(items, couponDiscount, useRewardPoints);

        return res.json({
          success: true,
          cart: {
            id: cartId,
            items,
            couponCode,
            useRewardPoints,
            bill,
            totalItemsCount: items.reduce((sum: number, it: any) => sum + it.quantity, 0)
          }
        });
      } finally {
        conn.release();
      }
    } else {
      // MemoryStore fallback
      let userCart = (memoryStore as any).carts?.find((c: any) => c.user_id === userId);
      if (!userCart) {
        userCart = { id: `cart-${Date.now()}`, user_id: userId, coupon_code: '', use_reward_points: 0 };
        if (!(memoryStore as any).carts) (memoryStore as any).carts = [];
        (memoryStore as any).carts.push(userCart);
      }

      if (!(memoryStore as any).cartItems) (memoryStore as any).cartItems = [];
      const userItems = (memoryStore as any).cartItems.filter((ci: any) => ci.cart_id === userCart.id);

      const items = userItems.map((ci: any) => {
        const f = memoryStore.foodItems.find(item => item.id === ci.food_item_id);
        const s = memoryStore.sellers.find(sel => sel.id === f?.seller_id);
        return {
          cartItemId: ci.id,
          foodId: ci.food_item_id,
          name: f?.food_name || 'Food Item',
          image: f?.image_url || '',
          price: Number(f?.price || 0),
          originalPrice: Number(f?.original_price || f?.price || 0),
          quantity: Number(ci.quantity),
          lineTotal: Number(f?.price || 0) * Number(ci.quantity),
          sellerId: f?.seller_id || '',
          sellerName: s?.kitchen_name || 'Campus Kitchen',
          module: f?.module || 'HomePlate',
          isVeg: f?.food_type === 'veg',
          stockQuantity: f?.available_quantity || 10,
          isAvailable: Boolean(f?.is_available)
        };
      });

      let couponDiscount = 0;
      if (userCart.coupon_code) {
        const cpn = memoryStore.coupons.find(c => c.coupon_code === userCart.coupon_code && c.is_active);
        if (cpn) couponDiscount = Number(cpn.discount_value);
      }

      const bill = calculateCartBill(items, couponDiscount, Boolean(userCart.use_reward_points));

      return res.json({
        success: true,
        cart: {
          id: userCart.id,
          items,
          couponCode: userCart.coupon_code || '',
          useRewardPoints: Boolean(userCart.use_reward_points),
          bill,
          totalItemsCount: items.reduce((sum: number, it: any) => sum + it.quantity, 0)
        }
      });
    }
  } catch (err: any) {
    console.error('Fetch cart error:', err);
    res.status(500).json({ success: false, error: 'Could not fetch cart.' });
  }
});

// POST /api/cart/items - Add item to cart
router.post('/items', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { foodId, quantity = 1 } = req.body;

    if (!userId || !foodId) {
      return res.status(400).json({ success: false, error: 'User and food ID are required.' });
    }

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        let [cartRows]: any = await conn.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
        let cartId = '';
        if (cartRows.length === 0) {
          cartId = `cart-${Date.now()}`;
          await conn.query('INSERT INTO carts (id, user_id) VALUES (?, ?)', [cartId, userId]);
        } else {
          cartId = cartRows[0].id;
        }

        // Check if item already exists in cart
        const [existing]: any = await conn.query('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND food_item_id = ?', [cartId, foodId]);
        if (existing.length > 0) {
          const newQty = existing[0].quantity + Number(quantity);
          await conn.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
        } else {
          const cartItemId = `ci-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          await conn.query('INSERT INTO cart_items (id, cart_id, food_item_id, quantity) VALUES (?, ?, ?, ?)', [cartItemId, cartId, foodId, quantity]);
        }

        return res.json({ success: true, message: 'Item added to cart.' });
      } finally {
        conn.release();
      }
    } else {
      if (!(memoryStore as any).carts) (memoryStore as any).carts = [];
      if (!(memoryStore as any).cartItems) (memoryStore as any).cartItems = [];

      let userCart = (memoryStore as any).carts.find((c: any) => c.user_id === userId);
      if (!userCart) {
        userCart = { id: `cart-${Date.now()}`, user_id: userId, coupon_code: '', use_reward_points: 0 };
        (memoryStore as any).carts.push(userCart);
      }

      const existing = (memoryStore as any).cartItems.find((ci: any) => ci.cart_id === userCart.id && ci.food_item_id === foodId);
      if (existing) {
        existing.quantity += Number(quantity);
      } else {
        (memoryStore as any).cartItems.push({
          id: `ci-${Date.now()}`,
          cart_id: userCart.id,
          food_item_id: foodId,
          quantity: Number(quantity)
        });
      }

      return res.json({ success: true, message: 'Item added to cart.' });
    }
  } catch (err: any) {
    console.error('Add cart item error:', err);
    res.status(500).json({ success: false, error: 'Could not add item to cart.' });
  }
});

// PUT /api/cart/items/:foodId - Update item quantity
router.put('/items/:foodId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { foodId } = req.params;
    const { quantity } = req.body;

    if (!userId || !foodId) {
      return res.status(400).json({ success: false, error: 'Food ID is required.' });
    }

    const qty = Number(quantity);

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [cartRows]: any = await conn.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
        if (cartRows.length === 0) {
          return res.status(404).json({ success: false, error: 'Cart not found.' });
        }
        const cartId = cartRows[0].id;

        if (qty <= 0) {
          await conn.query('DELETE FROM cart_items WHERE cart_id = ? AND food_item_id = ?', [cartId, foodId]);
        } else {
          await conn.query('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND food_item_id = ?', [qty, cartId, foodId]);
        }

        return res.json({ success: true, message: 'Cart updated successfully.' });
      } finally {
        conn.release();
      }
    } else {
      const userCart = (memoryStore as any).carts?.find((c: any) => c.user_id === userId);
      if (userCart && (memoryStore as any).cartItems) {
        if (qty <= 0) {
          (memoryStore as any).cartItems = (memoryStore as any).cartItems.filter((ci: any) => !(ci.cart_id === userCart.id && ci.food_item_id === foodId));
        } else {
          const item = (memoryStore as any).cartItems.find((ci: any) => ci.cart_id === userCart.id && ci.food_item_id === foodId);
          if (item) item.quantity = qty;
        }
      }
      return res.json({ success: true, message: 'Cart updated successfully.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not update cart quantity.' });
  }
});

// DELETE /api/cart/items/:foodId - Remove single item from cart
router.delete('/items/:foodId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { foodId } = req.params;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [cartRows]: any = await conn.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
        if (cartRows.length > 0) {
          await conn.query('DELETE FROM cart_items WHERE cart_id = ? AND food_item_id = ?', [cartRows[0].id, foodId]);
        }
        return res.json({ success: true, message: 'Item removed from cart.' });
      } finally {
        conn.release();
      }
    } else {
      const userCart = (memoryStore as any).carts?.find((c: any) => c.user_id === userId);
      if (userCart && (memoryStore as any).cartItems) {
        (memoryStore as any).cartItems = (memoryStore as any).cartItems.filter((ci: any) => !(ci.cart_id === userCart.id && ci.food_item_id === foodId));
      }
      return res.json({ success: true, message: 'Item removed from cart.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not remove item.' });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [cartRows]: any = await conn.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
        if (cartRows.length > 0) {
          await conn.query('DELETE FROM cart_items WHERE cart_id = ?', [cartRows[0].id]);
          await conn.query('UPDATE carts SET coupon_code = NULL, use_reward_points = 0 WHERE id = ?', [cartRows[0].id]);
        }
        return res.json({ success: true, message: 'Cart cleared.' });
      } finally {
        conn.release();
      }
    } else {
      const userCart = (memoryStore as any).carts?.find((c: any) => c.user_id === userId);
      if (userCart && (memoryStore as any).cartItems) {
        (memoryStore as any).cartItems = (memoryStore as any).cartItems.filter((ci: any) => ci.cart_id !== userCart.id);
        userCart.coupon_code = '';
        userCart.use_reward_points = 0;
      }
      return res.json({ success: true, message: 'Cart cleared.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not clear cart.' });
  }
});

// POST /api/cart/coupon - Apply or remove coupon
router.post('/coupon', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { couponCode } = req.body;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [cartRows]: any = await conn.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
        if (cartRows.length > 0) {
          await conn.query('UPDATE carts SET coupon_code = ? WHERE id = ?', [couponCode || null, cartRows[0].id]);
        }
        return res.json({ success: true, message: couponCode ? 'Coupon applied.' : 'Coupon removed.' });
      } finally {
        conn.release();
      }
    } else {
      const userCart = (memoryStore as any).carts?.find((c: any) => c.user_id === userId);
      if (userCart) {
        userCart.coupon_code = couponCode || '';
      }
      return res.json({ success: true, message: couponCode ? 'Coupon applied.' : 'Coupon removed.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not update coupon.' });
  }
});

// POST /api/cart/loyalty - Toggle reward points
router.post('/loyalty', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { useRewardPoints } = req.body;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [cartRows]: any = await conn.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
        if (cartRows.length > 0) {
          await conn.query('UPDATE carts SET use_reward_points = ? WHERE id = ?', [useRewardPoints ? 1 : 0, cartRows[0].id]);
        }
        return res.json({ success: true, message: 'Loyalty points preference updated.' });
      } finally {
        conn.release();
      }
    } else {
      const userCart = (memoryStore as any).carts?.find((c: any) => c.user_id === userId);
      if (userCart) {
        userCart.use_reward_points = useRewardPoints ? 1 : 0;
      }
      return res.json({ success: true, message: 'Loyalty points preference updated.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not update loyalty status.' });
  }
});

export default router;

