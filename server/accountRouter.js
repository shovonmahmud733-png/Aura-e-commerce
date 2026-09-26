import express from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth } from './middleware/authMiddleware.js';
import {
  findUserById,
  updateUserProfile,
  getOrdersByUser,
  getOrderById,
  getAddressesByUserId,
  addAddress,
  updateAddress,
  deleteAddress,
  getReviewsByUser,
  addReview,
  getWarrantiesByUser,
  getNotificationsByUser,
  markNotificationRead,
  getAllCoupons
} from './db.js';

const router = express.Router();

// Enforce authentication on all account routes
router.use(requireAuth);

// -------------------------------------------------------------
// 1. PROFILE & STATS
// -------------------------------------------------------------
router.get('/profile', async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    const orders = await getOrdersByUser(user.id, user.email);
    const warranties = await getWarrantiesByUser(user.email);
    const addresses = await getAddressesByUserId(user.id);
    const reviews = await getReviewsByUser(user.id, user.email);

    return res.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone || '',
        createdAt: user.created_at,
        stats: {
          totalOrders: orders.length,
          totalSpent: orders.reduce((sum, o) => sum + (parseFloat(o.summary?.total) || 0), 0),
          activeWarranties: warranties.length,
          savedAddresses: addresses.length,
          reviewsCount: reviews.length
        }
      }
    });
  } catch (err) {
    console.error('[Account Profile Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    let password_hash = null;
    if (newPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      }
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }

      // Verify current password
      const fullUser = await findUserById(req.user.id);
      // Since findUserById returns safe fields, let's verify via email
      const { findUserByEmail } = await import('./db.js');
      const authUser = await findUserByEmail(req.user.email);
      const isMatch = await bcrypt.compare(currentPassword, authUser.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }

      password_hash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await updateUserProfile(req.user.id, {
      name: name.trim(),
      phone: phone || '',
      password_hash
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone
      }
    });
  } catch (err) {
    console.error('[Account Update Profile Error]:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// -------------------------------------------------------------
// 2. ORDERS
// -------------------------------------------------------------
router.get('/orders', async (req, res) => {
  try {
    const orders = await getOrdersByUser(req.user.id, req.user.email);
    return res.json({ success: true, orders });
  } catch (err) {
    console.error('[Account Orders Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch order history.' });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Verify order belongs to this user or user is admin
    if (order.userId !== req.user.id && order.userEmail.toLowerCase() !== req.user.email.toLowerCase() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied to this order.' });
    }

    return res.json({ success: true, order });
  } catch (err) {
    console.error('[Account Order Detail Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch order details.' });
  }
});

// -------------------------------------------------------------
// 3. SAVED ADDRESSES
// -------------------------------------------------------------
router.get('/addresses', async (req, res) => {
  try {
    const addresses = await getAddressesByUserId(req.user.id);
    return res.json({ success: true, addresses });
  } catch (err) {
    console.error('[Account Addresses Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch saved addresses.' });
  }
});

router.post('/addresses', async (req, res) => {
  try {
    const { name, street, city, zip, country, state, phone, is_default } = req.body;
    if (!name || !street || !city || !zip || !country) {
      return res.status(400).json({ error: 'Name, street, city, postal code, and country are required.' });
    }

    const addresses = await addAddress(req.user.id, {
      name,
      street,
      city,
      state,
      zip,
      country,
      phone,
      is_default: !!is_default
    });

    return res.status(201).json({ success: true, addresses });
  } catch (err) {
    console.error('[Account Add Address Error]:', err);
    return res.status(500).json({ error: 'Failed to save address.' });
  }
});

router.put('/addresses/:id', async (req, res) => {
  try {
    const addresses = await updateAddress(req.params.id, req.user.id, req.body);
    return res.json({ success: true, addresses });
  } catch (err) {
    console.error('[Account Update Address Error]:', err);
    return res.status(500).json({ error: 'Failed to update address.' });
  }
});

router.delete('/addresses/:id', async (req, res) => {
  try {
    const addresses = await deleteAddress(req.params.id, req.user.id);
    return res.json({ success: true, addresses });
  } catch (err) {
    console.error('[Account Delete Address Error]:', err);
    return res.status(500).json({ error: 'Failed to delete address.' });
  }
});

// -------------------------------------------------------------
// 4. REVIEWS
// -------------------------------------------------------------
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await getReviewsByUser(req.user.id, req.user.email);
    return res.json({ success: true, reviews });
  } catch (err) {
    console.error('[Account Reviews Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

router.post('/reviews', async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Product ID, rating (1-5), and review comment are required.' });
    }

    const newReview = await addReview({
      productId,
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      rating: parseInt(rating, 10),
      title: title || '',
      comment: comment.trim(),
      status: 'approved' // Automatically approved for verified purchasers
    });

    return res.status(201).json({ success: true, review: newReview });
  } catch (err) {
    console.error('[Account Create Review Error]:', err);
    return res.status(500).json({ error: 'Failed to submit review.' });
  }
});

// -------------------------------------------------------------
// 5. WARRANTIES
// -------------------------------------------------------------
router.get('/warranties', async (req, res) => {
  try {
    const warranties = await getWarrantiesByUser(req.user.email);
    return res.json({ success: true, warranties });
  } catch (err) {
    console.error('[Account Warranties Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch warranties.' });
  }
});

// -------------------------------------------------------------
// 6. NOTIFICATIONS
// -------------------------------------------------------------
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await getNotificationsByUser(req.user.id);
    return res.json({ success: true, notifications });
  } catch (err) {
    console.error('[Account Notifications Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    await markNotificationRead(req.params.id, req.user.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('[Account Notification Read Error]:', err);
    return res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// -------------------------------------------------------------
// 7. COUPONS (ACTIVE PUBLIC COUPONS)
// -------------------------------------------------------------
router.get('/coupons', async (req, res) => {
  try {
    const all = await getAllCoupons();
    const active = all.filter(c => c.is_active === 1);
    return res.json({ success: true, coupons: active });
  } catch (err) {
    console.error('[Account Coupons Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch coupons.' });
  }
});

export default router;
