import express from 'express';
import cors from 'cors';
import authRouter from './auth.js';
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Shuvo Commerce SQLite API', timestamp: new Date().toISOString() });
});

// Initialize database & start listening
getDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Backend API] Shuvo Express Server listening on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('[Backend Init Error]:', err);
  process.exit(1);
});
