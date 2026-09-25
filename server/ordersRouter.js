import express from 'express';
import jwt from 'jsonwebtoken';
import { createOrder, getOrdersByUser } from './db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aura-commerce-ultra-secure-jwt-secret-key-2026';

// Middleware to require authentication for order actions
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Please sign in to access this resource.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
}

// POST /api/orders (Create order and persist to database)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, summary, shipping, deliveryMethod, paymentMethod, cardLast4 } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart must contain at least 1 item.' });
    }

    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (totalQuantity > 5) {
      return res.status(400).json({ error: 'You cannot order more than 5 items at a time.' });
    }

    const newOrder = await createOrder({
      userId: req.user.id,
      userEmail: req.user.email,
      items,
      summary,
      shippingDetails: shipping,
      deliveryMethod,
      paymentMethod,
      paymentLast4: cardLast4 || '4242',
      status: 'Processing'
    });

    return res.status(201).json({
      success: true,
      message: 'Order successfully recorded and persisted in database.',
      order: newOrder
    });
  } catch (err) {
    console.error('[Create Order Error]:', err);
    return res.status(500).json({ error: 'Failed to process order. Please try again.' });
  }
});

// GET /api/orders/my-orders (Retrieve user's historical orders from database)
router.get('/my-orders', requireAuth, async (req, res) => {
  try {
    const orders = await getOrdersByUser(req.user.id, req.user.email);
    return res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    console.error('[Get Orders Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve order history.' });
  }
});

export default router;
