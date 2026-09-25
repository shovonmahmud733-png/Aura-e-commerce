import express from 'express';
import { getAllProducts, getProductById } from './db.js';

const router = express.Router();

// GET /api/products (filters: category, search, sort)
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const products = await getAllProducts({ category, search, sort });
    return res.json({ success: true, count: products.length, products });
  } catch (err) {
    console.error('[Products List Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve products from database.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found in database.' });
    }
    return res.json({ success: true, product });
  } catch (err) {
    console.error('[Product Detail Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve product details.' });
  }
});

export default router;
