import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db';
import authRoutes from './routes/auth';
import foodRoutes from './routes/foods';
import orderRoutes from './routes/orders';
import surplusRoutes from './routes/surplus';
import loyaltyRoutes from './routes/loyalty';
import savingsRoutes from './routes/savings';
import sellerRoutes from './routes/sellers';
import adminRoutes from './routes/admin';
import categoryRoutes from './routes/categories';
import uploadRoutes from './routes/upload';
import cartRoutes from './routes/cart';
import addressRoutes from './routes/addresses';
import subscriptionRoutes from './routes/subscriptions';
import reviewRoutes from './routes/reviews';
import complaintRoutes from './routes/complaints';
import inventoryRoutes from './routes/inventory';
import couponRoutes from './routes/coupons';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    platform: 'MealMate Smart Campus Food Delivery',
    database: 'MySQL 8.0 (mealmate_db)',
    tablesCount: 21,
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/surplus', surplusRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

// Start Server
export const server = app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 MEALMATE REST API SERVER RUNNING ON PORT ${PORT}`);
  console.log(`👉 http://localhost:${PORT}/api/health`);
  console.log(`📊 Connected Database: ${process.env.DB_NAME || 'mealmate_db'}`);
  console.log(`=======================================================`);
  await initializeDatabase();
});

export default app;
