import express from 'express';
import { requireAuth, requireAdmin } from './middleware/authMiddleware.js';
import {
  getAdminOverview,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getAllUsers,
  findUserById,
  updateUserStatus,
  updateUserRole,
  getOrdersByUser,
  getReviewsByUser,
  getAddressesByUserId,
  getWarrantiesByUser,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  getAllCoupons,
  getCouponByCode,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllWarranties,
  getWarrantyBySerial,
  updateWarranty,
  getAuditLogs,
  addAuditLog
} from './db.js';

const router = express.Router();

// Enforce both JWT authentication and admin role verification on EVERY route
router.use(requireAuth, requireAdmin);

// -------------------------------------------------------------
// 1. DASHBOARD & OVERVIEW ANALYTICS
// -------------------------------------------------------------
router.get('/overview', async (req, res) => {
  try {
    const overview = await getAdminOverview();
    return res.json({ success: true, overview });
  } catch (err) {
    console.error('[Admin API Overview Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard metrics.' });
  }
});

// -------------------------------------------------------------
// 2. PRODUCT MANAGEMENT (CRUD)
// -------------------------------------------------------------
router.get('/products', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const products = await getAllProducts({ category, search, sort });
    return res.json({ success: true, products });
  } catch (err) {
    console.error('[Admin API Products Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { name, category, price } = req.body;
    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: 'Name, category, and price are required.' });
    }

    const newProduct = await createProduct(req.body);

    await addAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'PRODUCT_CREATED',
      targetType: 'product',
      targetId: newProduct.id,
      details: { name: newProduct.name, price: newProduct.price, stock: newProduct.stock }
    });

    return res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    console.error('[Admin API Create Product Error]:', err);
    return res.status(500).json({ error: 'Failed to create product.' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getProductById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const updated = await updateProduct(id, req.body);

    await addAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'PRODUCT_UPDATED',
      targetType: 'product',
      targetId: id,
      details: { name: updated.name, price: updated.price, stock: updated.stock }
    });

    return res.json({ success: true, product: updated });
  } catch (err) {
    console.error('[Admin API Update Product Error]:', err);
    return res.status(500).json({ error: 'Failed to update product.' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getProductById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await deleteProduct(id);

    await addAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'PRODUCT_DELETED',
      targetType: 'product',
      targetId: id,
      details: { name: existing.name }
    });

    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('[Admin API Delete Product Error]:', err);
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
});

router.put('/products/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    if (stock === undefined) {
      return res.status(400).json({ error: 'Stock value is required.' });
    }

    const updated = await updateProductStock(id, stock);

    await addAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'STOCK_UPDATED',
      targetType: 'product',
      targetId: id,
      details: { stock: updated.stock }
    });

    return res.json({ success: true, product: updated });
  } catch (err) {
    console.error('[Admin API Stock Update Error]:', err);
    return res.status(500).json({ error: 'Failed to update stock.' });
  }
});

// -------------------------------------------------------------
// 3. INVENTORY MANAGEMENT
// -------------------------------------------------------------
router.get('/inventory', async (req, res) => {
  try {
    const products = await getAllProducts();
    const inventory = products.map(p => ({
      id: p.id,
      name: p.name,
      serialNumber: p.serialNumber,
      category: p.category,
      price: p.price,
      stock: p.stock,
      image: p.images?.[0] || '',
      status: p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock'
    }));

    return res.json({ success: true, inventory });
  } catch (err) {
    console.error('[Admin API Inventory Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch inventory.' });
  }
});

// -------------------------------------------------------------
// 4. ORDER MANAGEMENT
// -------------------------------------------------------------
router.get('/orders', async (req, res) => {
  try {
    const { search, status } = req.query;
    const orders = await getAllOrders({ search, status });
    return res.json({ success: true, orders });
  } catch (err) {
    console.error('[Admin API Orders Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    return res.json({ success: true, order });
  } catch (err) {
    console.error('[Admin API Order Detail Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve order details.' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, carrier, estimatedDelivery } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const updated = await updateOrderStatus(id, status, { trackingNumber, carrier, estimatedDelivery });

    await addAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'ORDER_STATUS_CHANGED',
      targetType: 'order',
      targetId: id,
      details: { status, trackingNumber: updated.trackingNumber, carrier: updated.carrier }
    });

    return res.json({ success: true, order: updated });
  } catch (err) {
    console.error('[Admin API Update Order Error]:', err);
    return res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// -------------------------------------------------------------
// 5. CUSTOMER MANAGEMENT
// -------------------------------------------------------------
router.get('/customers', async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const customers = await getAllUsers({ search, role, status });
    return res.json({ success: true, customers });
  } catch (err) {
    console.error('[Admin API Customers Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve customers.' });
  }
});

router.get('/customers/:id', async (req, res) => {
  try {
    const customer = await findUserById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const orders = await getOrdersByUser(customer.id, customer.email);
    const reviews = await getReviewsByUser(customer.id, customer.email);
    const addresses = await getAddressesByUserId(customer.id);
    const warranties = await getWarrantiesByUser(customer.email);

    return res.json({
      success: true,
      customer: {
        ...customer,
        orders,
        reviews,
        addresses,
        warranties
      }
    });
  } catch (err) {
    console.error('[Admin API Customer Details Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve customer details.' });
  }
});

router.put('/customers/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['active', 'disabled'].includes(status)) {
      return res.status(400).json({ error: 'Valid status (active or disabled) is required.' });
    }

    const updated = await updateUserStatus(id, status);

    await addAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'CUSTOMER_STATUS_CHANGED',
      targetType: 'customer',
      targetId: id,
      details: { email: updated.email, status }
    });

    return res.json({ success: true, customer: updated });
  } catch (err) {
    console.error('[Admin API Customer Status Error]:', err);
    return res.status(500).json({ error: 'Failed to update customer status.' });
  }
});

router.put('/customers/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Valid role (user or admin) is required.' });
    }

    const updated = await updateUserRole(id, role);

    await addAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'CUSTOMER_ROLE_CHANGED',
      targetType: 'customer',
      targetId: id,
      details: { email: updated.email, role }
    });

    return res.json({ success: true, customer: updated });
  } catch (err) {
    console.error('[Admin API Customer Role Error]:', err);
    return res.status(500).json({ error: 'Failed to update customer role.' });
  }
});

// -------------------------------------------------------------
// 6. REVIEWS MANAGEMENT
// -------------------------------------------------------------
router.get('/reviews', async (req, res) => {
  try {
    const { status, productId } = req.query;
    const reviews = await getAllReviews({ status, productId });
    return res.json({ success: true, reviews });
  } catch (err) {
    console.error('[Admin API Reviews Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

router.put('/reviews/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required.' });
    }

    const updated = await updateReviewStatus(id, status);

    await addAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'REVIEW_STATUS_UPDATED',
      targetType: 'review',
      targetId: id,
      details: { status }
    });

    return res.json({ success: true, review: updated });
  } catch (err) {
    console.error('[Admin API Update Review Error]:', err);
    return res.status(500).json({ error: 'Failed to update review status.' });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteReview(id);

    await addAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'REVIEW_DELETED',
      targetType: 'review',
      targetId: id
    });

    return res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (err) {
    console.error('[Admin API Delete Review Error]:', err);
    return res.status(500).json({ error: 'Failed to delete review.' });
  }
});

// -------------------------------------------------------------
// 7. COUPONS MANAGEMENT
// -------------------------------------------------------------
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await getAllCoupons();
    return res.json({ success: true, coupons });
  } catch (err) {
    console.error('[Admin API Coupons Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch coupons.' });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const { code, discount_value } = req.body;
    if (!code || discount_value === undefined) {
      return res.status(400).json({ error: 'Code and discount value are required.' });
    }

    const existing = await getCouponByCode(code);
    if (existing) {
      return res.status(409).json({ error: 'A coupon with this code already exists.' });
    }

    const created = await createCoupon(req.body);

    await addAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'COUPON_CREATED',
      targetType: 'coupon',
      targetId: created.id.toString(),
      details: { code: created.code, value: created.discount_value }
    });

    return res.status(201).json({ success: true, coupon: created });
  } catch (err) {
    console.error('[Admin API Create Coupon Error]:', err);
    return res.status(500).json({ error: 'Failed to create coupon.' });
  }
});

router.put('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateCoupon(id, req.body);

    await addAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'COUPON_UPDATED',
      targetType: 'coupon',
      targetId: id.toString(),
      details: { code: updated.code, is_active: updated.is_active }
    });

    return res.json({ success: true, coupon: updated });
  } catch (err) {
    console.error('[Admin API Update Coupon Error]:', err);
    return res.status(500).json({ error: 'Failed to update coupon.' });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCoupon(id);

    await addAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'COUPON_DELETED',
      targetType: 'coupon',
      targetId: id.toString()
    });

    return res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (err) {
    console.error('[Admin API Delete Coupon Error]:', err);
    return res.status(500).json({ error: 'Failed to delete coupon.' });
  }
});

// -------------------------------------------------------------
// 8. WARRANTY REGISTRY
// -------------------------------------------------------------
router.get('/warranties', async (req, res) => {
  try {
    const { search, status } = req.query;
    const warranties = await getAllWarranties({ search, status });
    return res.json({ success: true, warranties });
  } catch (err) {
    console.error('[Admin API Warranties Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve warranty records.' });
  }
});

router.put('/warranties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateWarranty(id, req.body);

    await addAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'WARRANTY_UPDATED',
      targetType: 'warranty',
      targetId: id.toString(),
      details: { serial: updated.serial_number, status: updated.warranty_status }
    });

    return res.json({ success: true, warranty: updated });
  } catch (err) {
    console.error('[Admin API Update Warranty Error]:', err);
    return res.status(500).json({ error: 'Failed to update warranty record.' });
  }
});

// -------------------------------------------------------------
// 9. AUDIT LOGS
// -------------------------------------------------------------
router.get('/logs', async (req, res) => {
  try {
    const { limit = 50, action, targetType } = req.query;
    const logs = await getAuditLogs({ limit, action, targetType });
    return res.json({ success: true, logs });
  } catch (err) {
    console.error('[Admin API Logs Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

export default router;
