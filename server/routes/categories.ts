import { Router, Request, Response } from 'express';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    let categories: any[] = [];
    if (getDbConnected()) {
      const conn = await pool.getConnection();
      const [rows]: any = await conn.query('SELECT * FROM food_categories WHERE is_active = 1');
      categories = rows;
      conn.release();
    } else {
      categories = memoryStore.categories;
    }
    res.json({ success: true, count: categories.length, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch food categories.' });
  }
});

export default router;

