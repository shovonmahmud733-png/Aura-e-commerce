import express from 'express';
import cors from 'cors';
import authRouter from './auth.js';
import productsRouter from './productsRouter.js';
import ordersRouter from './ordersRouter.js';
import adminRouter from './adminRouter.js';
import accountRouter from './accountRouter.js';
import { getDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/account', accountRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Aura Commerce SQLite API', timestamp: new Date().toISOString() });
});

// Initialize database & start listening if run directly
if (!process.env.VERCEL) {
  getDb().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Backend API] Express Server listening on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error('[Backend Init Error]:', err);
  });
}

export default app;
