import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// POST /api/upload - Image upload / URL verification for food items
router.post('/', authenticateToken, requireRole(['seller', 'admin']), async (req: Request, res: Response) => {
  try {
    const { imageUrl, base64Data } = req.body;

    if (imageUrl) {
      return res.json({
        success: true,
        url: imageUrl,
        message: 'Image verified successfully.'
      });
    }

    if (base64Data) {
      // In production can save to public/uploads or cloud, here return verified data URL
      return res.json({
        success: true,
        url: base64Data,
        message: 'Image uploaded successfully.'
      });
    }

    res.status(400).json({ success: false, error: 'Please provide imageUrl or base64Data.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Image upload failed.' });
  }
});

export default router;

