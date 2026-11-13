import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool, getDbConnected } from '../db';
import { memoryStore } from '../memoryStore';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mealmate_super_secret_jwt_token_2026';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==========================================
// 1. REGISTRATION ENDPOINT
// ==========================================
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role = 'customer', businessName, businessAddress } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, error: 'Name, email, phone number, and password are all required.' });
    }

    if (!name.toString().trim()) {
      return res.status(400).json({ success: false, error: 'Please provide a valid full name.' });
    }

    const cleanEmail = email.toString().trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const cleanPhone = phone.toString().trim();
    if (cleanPhone.length < 8) {
      return res.status(400).json({ success: false, error: 'Please enter a valid phone number.' });
    }

    const rawPassword = password.toString();
    if (rawPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const cleanRole = ['customer', 'seller', 'admin'].includes(role) ? role : 'customer';

    if (cleanRole === 'seller' && (!businessName || !businessAddress)) {
      return res.status(400).json({ success: false, error: 'Kitchen name and address are required for seller registration.' });
    }

    // Check whether the email is already registered
    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [existing]: any = await conn.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
        if (existing.length > 0) {
          conn.release();
          return res.status(400).json({ 
            success: false, 
            error: 'An account with this email already exists. Please sign in.' 
          });
        }
      } finally {
        conn.release();
      }
    } else {
      const exists = memoryStore.users.some(u => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        return res.status(400).json({ 
          success: false, 
          error: 'An account with this email already exists. Please sign in.' 
        });
      }
    }

    // Hash password securely before storing
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        await conn.query(
          `INSERT INTO users (id, full_name, email, password_hash, phone, role, account_status)
           VALUES (?, ?, ?, ?, ?, ?, 'active')`,
          [userId, name.toString().trim(), cleanEmail, passwordHash, cleanPhone, cleanRole]
        );

        if (cleanRole === 'seller') {
          const sellerId = `seller-${Date.now()}`;
          await conn.query(
            `INSERT INTO sellers (id, user_id, kitchen_name, description, address, approval_status, is_active)
             VALUES (?, ?, ?, ?, ?, 'approved', 1)`,
            [sellerId, userId, businessName || `${name}'s Kitchen`, 'Campus home kitchen partner', businessAddress || 'Campus']
          );
        }
      } finally {
        conn.release();
      }
    } else {
      // MemoryStore fallback
      const newUser = {
        id: userId,
        full_name: name.toString().trim(),
        email: cleanEmail,
        password_hash: passwordHash,
        phone: cleanPhone,
        role: cleanRole,
        account_status: 'active',
        profile_image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memoryStore.users.push(newUser);

      if (cleanRole === 'seller') {
        memoryStore.sellers.push({
          id: `seller-${Date.now()}`,
          user_id: userId,
          kitchen_name: businessName || `${name}'s Kitchen`,
          description: 'Campus home kitchen partner',
          address: businessAddress || 'Campus',
          approval_status: 'approved',
          is_active: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    // Generate authenticated JWT token for the new user
    const token = jwt.sign(
      { id: userId, email: cleanEmail, role: cleanRole, name: name.toString().trim() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to MealMate.',
      token,
      user: {
        id: userId,
        name: name.toString().trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role: cleanRole,
        accountStatus: 'active',
        businessName: cleanRole === 'seller' ? businessName : undefined,
        businessAddress: cleanRole === 'seller' ? businessAddress : undefined,
        rewardPoints: 20
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
});

// ==========================================
// 2. LOGIN ENDPOINT
// ==========================================
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.toString().trim() || !password) {
      return res.status(400).json({ success: false, error: 'Please provide both email and password.' });
    }

    const cleanEmail = email.toString().trim().toLowerCase();
    let userRecord: any = null;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [rows]: any = await conn.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
        if (rows.length > 0) {
          userRecord = rows[0];
        }
      } finally {
        conn.release();
      }
    } else {
      userRecord = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
    }

    // If the email does not exist, show: "Account not found. Please register first."
    // Strictly NO account auto-creation and NO role-substitution during login!
    if (!userRecord) {
      return res.status(404).json({ success: false, error: 'Account not found. Please register first.' });
    }

    // Check account active status
    if (userRecord.account_status === 'deactivated' || userRecord.account_status === 'inactive') {
      return res.status(403).json({ success: false, error: 'This account has been deactivated. Please contact campus admin.' });
    }

    // Verify password against stored hash
    const isMatch = await bcrypt.compare(password.toString(), userRecord.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
    }

    // Issue signed JWT token preserving exact database role
    const token = jwt.sign(
      { 
        id: userRecord.id, 
        email: userRecord.email, 
        role: userRecord.role, 
        name: userRecord.full_name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Fetch seller business info if user is a seller
    let sellerInfo: any = null;
    if (userRecord.role === 'seller') {
      if (getDbConnected()) {
        const conn = await pool.getConnection();
        try {
          const [sellers]: any = await conn.query('SELECT * FROM sellers WHERE user_id = ? LIMIT 1', [userRecord.id]);
          if (sellers.length > 0) sellerInfo = sellers[0];
        } finally {
          conn.release();
        }
      } else {
        sellerInfo = memoryStore.sellers.find(s => s.user_id === userRecord.id) || memoryStore.sellers[0];
      }
    }

    // Fetch customer reward points if user is a customer
    let rewardPoints = 0;
    if (userRecord.role === 'customer') {
      if (getDbConnected()) {
        const conn = await pool.getConnection();
        try {
          const [pts]: any = await conn.query('SELECT total_points FROM loyalty_points WHERE customer_id = ?', [userRecord.id]);
          if (pts.length > 0) rewardPoints = pts[0].total_points;
        } finally {
          conn.release();
        }
      } else {
        const p = memoryStore.loyaltyPoints.find(lp => lp.customer_id === userRecord.id);
        if (p) rewardPoints = p.total_points;
      }
    }

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: userRecord.id,
        name: userRecord.full_name,
        email: userRecord.email,
        phone: userRecord.phone,
        role: userRecord.role, // strictly preserved from database role
        accountStatus: userRecord.account_status,
        avatarUrl: userRecord.profile_image,
        businessName: sellerInfo ? sellerInfo.kitchen_name : undefined,
        businessAddress: sellerInfo ? sellerInfo.address : undefined,
        sellerId: sellerInfo ? sellerInfo.id : undefined,
        rewardPoints
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during login.' });
  }
});

// ==========================================
// 3. GET CURRENT USER PROFILE
// ==========================================
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    let userRecord: any = null;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        const [rows]: any = await conn.query('SELECT id, full_name, email, phone, role, account_status, profile_image FROM users WHERE id = ?', [userId]);
        if (rows.length > 0) userRecord = rows[0];
      } finally {
        conn.release();
      }
    } else {
      userRecord = memoryStore.users.find(u => u.id === userId);
    }

    if (!userRecord) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.json({
      success: true,
      user: {
        id: userRecord.id,
        name: userRecord.full_name,
        email: userRecord.email,
        phone: userRecord.phone,
        role: userRecord.role,
        accountStatus: userRecord.account_status,
        avatarUrl: userRecord.profile_image
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Could not fetch user profile.' });
  }
});

// ==========================================
// 4. UPDATE USER PROFILE
// ==========================================
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, phone, avatarUrl } = req.body;

    if (getDbConnected()) {
      const conn = await pool.getConnection();
      try {
        await conn.query(
          'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), profile_image = COALESCE(?, profile_image) WHERE id = ?',
          [name, phone, avatarUrl, userId]
        );
      } finally {
        conn.release();
      }
    } else {
      const u = memoryStore.users.find(user => user.id === userId);
      if (u) {
        if (name) u.full_name = name;
        if (phone) u.phone = phone;
        if (avatarUrl) u.profile_image = avatarUrl;
      }
    }

    return res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

export default router;
