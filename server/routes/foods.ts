import { Router, Request, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Fallback high-res image if an image fails or is missing
export const FALLBACK_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

// Calculate single item total with standard delivery & platform fees
const calculateItemTotalWithFees = (price: number) => {
  const deliveryFee = price >= 300 ? 0 : 25;
  const platformFee = 5;
  return price + deliveryFee + platformFee;
};

// GET /api/foods - List and filter foods
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      module, 
      category, 
      food_type, // 'veg' | 'non-veg' | 'all'
      budget, 
      include_fees = 'true',
      search,
      seller_id 
    } = req.query;

    let items: any[] = [];

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        let query = `
          SELECT 
            f.*, 
            s.kitchen_name as seller_name, 
            s.address as seller_address,
            c.category_name
          FROM food_items f
          LEFT JOIN sellers s ON f.seller_id = s.id
          LEFT JOIN food_categories c ON f.category_id = c.id
          WHERE f.is_available = 1
        `;
        const params: any[] = [];

        if (module) {
          query += ' AND f.module = ?';
          params.push(module);
        }

        if (seller_id) {
          query += ' AND f.seller_id = ?';
          params.push(seller_id);
        }

        if (category && category !== 'All') {
          query += ' AND (c.category_name = ? OR f.category_id = ?)';
          params.push(category, category);
        }

        if (food_type && food_type !== 'all' && food_type !== 'All') {
          const typeVal = food_type.toString().toLowerCase().includes('non') ? 'non-veg' : 'veg';
          query += ' AND f.food_type = ?';
          params.push(typeVal);
        }

        if (search) {
          query += ' AND (f.food_name LIKE ? OR f.description LIKE ?)';
          params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY f.price ASC';

        const [rows]: any = await conn.query(query, params);
        items = rows;
        conn.release();
      } catch (err) {
        conn.release();
        throw err;
      }
    } else {
      // Memory store fallback
      items = memoryStore.foodItems.filter(f => f.is_available === 1);

      if (module) {
        items = items.filter(f => f.module === module);
      }

      if (seller_id) {
        items = items.filter(f => f.seller_id === seller_id);
      }

      if (category && category !== 'All') {
        const cat = memoryStore.categories.find(c => c.category_name === category || c.id === category);
        if (cat) items = items.filter(f => f.category_id === cat.id);
      }

      if (food_type && food_type !== 'all' && food_type !== 'All') {
        const isNonVeg = food_type.toString().toLowerCase().includes('non');
        items = items.filter(f => isNonVeg ? f.food_type === 'non-veg' : f.food_type === 'veg');
      }

      if (search) {
        const q = search.toString().toLowerCase();
        items = items.filter(f => f.food_name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
      }

      // Attach seller & category names
      items = items.map(f => {
        const seller = memoryStore.sellers.find(s => s.id === f.seller_id);
        const cat = memoryStore.categories.find(c => c.id === f.category_id);
        return {
          ...f,
          seller_name: seller ? seller.kitchen_name : 'Campus Kitchen',
          category_name: cat ? cat.category_name : 'General'
        };
      });
    }

    // Apply strict budget filter if provided
    if (budget) {
      const budgetNum = Number(budget);
      if (!isNaN(budgetNum) && budgetNum > 0) {
        const mustIncludeFees = include_fees === 'true' || include_fees === true;
        items = items.filter(item => {
          const itemPrice = Number(item.price);
          if (mustIncludeFees) {
            const finalWithFees = calculateItemTotalWithFees(itemPrice);
            return finalWithFees <= budgetNum;
          } else {
            return itemPrice <= budgetNum;
          }
        });
      }
    }

    // Map to frontend-friendly FoodItem shape
    const formatted = items.map(f => ({
      id: f.id,
      name: f.food_name,
      description: f.description,
      price: Number(f.price),
      originalPrice: f.original_price ? Number(f.original_price) : undefined,
      discountPercentage: f.original_price && f.original_price > f.price
        ? Math.round(((f.original_price - f.price) / f.original_price) * 100)
        : undefined,
      image: f.image_url || FALLBACK_FOOD_IMAGE,
      category: f.category_name || 'General',
      categoryId: f.category_id,
      sellerId: f.seller_id,
      sellerName: f.seller_name || 'Campus Kitchen',
      module: f.module,
      isVeg: f.food_type === 'veg',
      isAvailable: Boolean(f.is_available),
      stockQuantity: f.available_quantity,
      prepTimeMinutes: f.prep_time_minutes || 20,
      rating: Number(f.rating) || 4.8,
      reviewCount: Number(f.review_count) || 25,
      // For SaveMyMeal surplus cutoff calculation:
      cutoffTime: f.module === 'SaveMyMeal' 
        ? new Date(Date.now() + 4 * 3600 * 1000).toISOString() // Live 4 hours remaining today
        : undefined
    }));

    res.json({
      success: true,
      count: formatted.length,
      foods: formatted,
      data: formatted
    });
  } catch (err: any) {
    console.error('Fetch foods error:', err);
    res.status(500).json({ success: false, error: 'Could not load food items.' });
  }
});

// GET /api/foods/:id - Single food item
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let food: any = null;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      const [rows]: any = await conn.query(
        `SELECT f.*, s.kitchen_name as seller_name, c.category_name 
         FROM food_items f
         LEFT JOIN sellers s ON f.seller_id = s.id
         LEFT JOIN food_categories c ON f.category_id = c.id
         WHERE f.id = ?`,
        [id]
      );
      if (rows.length > 0) food = rows[0];
      conn.release();
    } else {
      food = memoryStore.foodItems.find(f => f.id === id);
      if (food) {
        const seller = memoryStore.sellers.find(s => s.id === food.seller_id);
        const cat = memoryStore.categories.find(c => c.id === food.category_id);
        food = { ...food, seller_name: seller?.kitchen_name, category_name: cat?.category_name };
      }
    }

    if (!food) {
      return res.status(404).json({ success: false, error: 'Food item not found.' });
    }

    res.json({
      success: true,
      food: {
        id: food.id,
        name: food.food_name,
        description: food.description,
        price: Number(food.price),
        originalPrice: food.original_price ? Number(food.original_price) : undefined,
        discountPercentage: food.original_price && food.original_price > food.price
          ? Math.round(((food.original_price - food.price) / food.original_price) * 100)
          : undefined,
        image: food.image_url || FALLBACK_FOOD_IMAGE,
        category: food.category_name || 'General',
        sellerId: food.seller_id,
        sellerName: food.seller_name || 'Campus Kitchen',
        module: food.module,
        isVeg: food.food_type === 'veg',
        isAvailable: Boolean(food.is_available),
        stockQuantity: food.available_quantity,
        prepTimeMinutes: food.prep_time_minutes || 20,
        rating: Number(food.rating) || 4.8,
        reviewCount: Number(food.review_count) || 25,
        cutoffTime: food.module === 'SaveMyMeal' ? new Date(Date.now() + 4 * 3600 * 1000).toISOString() : undefined
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch food details.' });
  }
});

// POST /api/foods - Add new food item (Seller or Admin)
router.post('/', authenticateToken, requireRole(['seller', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      food_name,
      description,
      food_type,
      module = 'HomePlate',
      price,
      original_price,
      image_url,
      category_id = 'cat-lunch',
      available_quantity = 20,
      prep_time_minutes = 20
    } = req.body;

    if (!food_name || !price) {
      return res.status(400).json({ success: false, error: 'Food name and price are required.' });
    }

    const sellerId = req.user?.role === 'seller' ? (req.user as any).sellerId || 'seller-1' : (req.body.seller_id || 'seller-1');
    const foodId = `food-${Date.now()}`;
    const cleanType = food_type === 'non-veg' ? 'non-veg' : 'veg';
    const finalImage = image_url || FALLBACK_FOOD_IMAGE;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO food_items 
         (id, seller_id, category_id, food_name, description, food_type, module, price, original_price, image_url, available_quantity, is_available, prep_time_minutes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [foodId, sellerId, category_id, food_name, description, cleanType, module, price, original_price || price, finalImage, available_quantity, prep_time_minutes]
      );
      conn.release();
    } else {
      memoryStore.foodItems.push({
        id: foodId,
        seller_id: sellerId,
        category_id,
        food_name,
        description,
        food_type: cleanType,
        module,
        price: Number(price),
        original_price: original_price ? Number(original_price) : Number(price),
        image_url: finalImage,
        available_quantity: Number(available_quantity),
        is_available: 1,
        prep_time_minutes: Number(prep_time_minutes),
        rating: 5.0,
        review_count: 1,
        created_at: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Dish listed successfully in the centralized food catalog.',
      foodId
    });
  } catch (err: any) {
    console.error('Create food error:', err);
    res.status(500).json({ success: false, error: 'Could not create food listing.' });
  }
});

// PUT /api/foods/:id - Update food item
router.put('/:id', authenticateToken, requireRole(['seller', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      food_name,
      description,
      price,
      original_price,
      available_quantity,
      is_available,
      image_url,
      food_type
    } = req.body;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      await conn.query(
        `UPDATE food_items SET 
           food_name = COALESCE(?, food_name),
           description = COALESCE(?, description),
           price = COALESCE(?, price),
           original_price = COALESCE(?, original_price),
           available_quantity = COALESCE(?, available_quantity),
           is_available = COALESCE(?, is_available),
           image_url = COALESCE(?, image_url),
           food_type = COALESCE(?, food_type)
         WHERE id = ?`,
        [food_name, description, price, original_price, available_quantity, is_available !== undefined ? (is_available ? 1 : 0) : null, image_url, food_type, id]
      );
      conn.release();
    } else {
      const item = memoryStore.foodItems.find(f => f.id === id);
      if (item) {
        if (food_name !== undefined) item.food_name = food_name;
        if (description !== undefined) item.description = description;
        if (price !== undefined) item.price = Number(price);
        if (original_price !== undefined) item.original_price = Number(original_price);
        if (available_quantity !== undefined) item.available_quantity = Number(available_quantity);
        if (is_available !== undefined) item.is_available = is_available ? 1 : 0;
        if (image_url !== undefined) item.image_url = image_url;
        if (food_type !== undefined) item.food_type = food_type;
      }
    }

    res.json({ success: true, message: 'Food item updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update food item.' });
  }
});

export default router;

