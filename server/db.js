import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { PRODUCTS } from '../src/data/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = process.env.VERCEL
  ? path.join('/tmp', 'database.sqlite')
  : path.join(__dirname, '..', 'database.sqlite');

let db = null;
let SQL = null;

export async function getDb() {
  if (db) return db;

  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('[SQLite] Error reading existing DB file, creating fresh database in-memory:', e.message);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  // 1. Initialize Core & Role-Based Schema
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_verified INTEGER DEFAULT 1,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      serial_number TEXT,
      sku TEXT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      rating REAL DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      stock INTEGER DEFAULT 10,
      badge TEXT,
      tagline TEXT,
      description TEXT,
      features_json TEXT,
      specs_json TEXT,
      images_json TEXT,
      colors_json TEXT,
      reviews_json TEXT,
      is_archived INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      user_email TEXT NOT NULL,
      items_json TEXT NOT NULL,
      summary_json TEXT NOT NULL,
      shipping_details_json TEXT NOT NULL,
      delivery_method TEXT,
      payment_method TEXT,
      payment_last4 TEXT,
      payment_status TEXT DEFAULT 'Paid',
      status TEXT DEFAULT 'Processing',
      carrier TEXT DEFAULT 'DHL Express Worldwide',
      tracking_number TEXT,
      estimated_delivery TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT,
      zip TEXT NOT NULL,
      country TEXT NOT NULL,
      phone TEXT,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT DEFAULT 'percentage',
      discount_value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      max_discount_amount REAL,
      usage_limit INTEGER DEFAULT 1000,
      times_used INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id INTEGER,
      user_name TEXT NOT NULL,
      user_email TEXT,
      rating INTEGER NOT NULL,
      title TEXT,
      comment TEXT NOT NULL,
      status TEXT DEFAULT 'approved',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS warranties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serial_number TEXT UNIQUE NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      order_id TEXT,
      customer_name TEXT,
      customer_email TEXT,
      warranty_status TEXT DEFAULT 'Active (2-Year Global Protection)',
      expiry_date DATETIME,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      admin_email TEXT,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      details_json TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      adjustment_type TEXT NOT NULL,
      quantity_change INTEGER NOT NULL,
      old_stock INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      reason TEXT,
      admin_email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Column Migrations for existing databases
  try { db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'"); } catch (e) {}
  try { db.run("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'"); } catch (e) {}
  try { db.run("ALTER TABLE users ADD COLUMN phone TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN serial_number TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN sku TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN is_archived INTEGER DEFAULT 0"); } catch (e) {}
  try { db.run("ALTER TABLE orders ADD COLUMN carrier TEXT DEFAULT 'DHL Express Worldwide'"); } catch (e) {}
  try { db.run("ALTER TABLE orders ADD COLUMN tracking_number TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'Paid'"); } catch (e) {}
  try { db.run("ALTER TABLE orders ADD COLUMN notes TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE orders ADD COLUMN order_source TEXT DEFAULT 'STOREFRONT'"); } catch (e) {}
  try { db.run("ALTER TABLE orders ADD COLUMN created_by_admin TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE orders ADD COLUMN admin_id INTEGER"); } catch (e) {}

  // 2. Seed Default Accounts (Demo Customer + Demo Admin)
  // Demo Customer
  const demoStmt = db.prepare('SELECT * FROM users WHERE lower(email) = lower(:email)');
  demoStmt.bind({ ':email': 'alex@auracommerce.io' });
  if (!demoStmt.step()) {
    const hashedCustomer = bcrypt.hashSync('Demo1234!', 10);
    db.run(
      'INSERT INTO users (name, email, password_hash, is_verified, role, status, phone) VALUES (?, ?, ?, 1, ?, ?, ?)',
      ['Alex Vance', 'alex@auracommerce.io', hashedCustomer, 'user', 'active', '+1 (555) 234-8901']
    );
    console.log('[SQLite] Demo customer seeded: alex@auracommerce.io / Demo1234!');
  }
  demoStmt.free();

  // Demo Admin Account
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin@@11';
  const adminName = process.env.ADMIN_NAME || 'Aura System Admin';

  // Migrate any previous admin account (admin@auracommerce.io) to admin@gmail.com
  try {
    const oldAdminCheck = db.prepare("SELECT id FROM users WHERE lower(email) = 'admin@auracommerce.io'");
    if (oldAdminCheck.step()) {
      const oldRow = oldAdminCheck.getAsObject();
      const hashedAdmin = bcrypt.hashSync(adminPassword, 10);
      db.run("UPDATE users SET email = ?, password_hash = ?, role = 'admin', status = 'active' WHERE id = ?", [adminEmail, hashedAdmin, oldRow.id]);
      console.log(`[SQLite] Migrated admin user #${oldRow.id} to ${adminEmail}`);
    }
    oldAdminCheck.free();
  } catch (e) {}

  const adminStmt = db.prepare('SELECT * FROM users WHERE lower(email) = lower(:email)');
  adminStmt.bind({ ':email': adminEmail });
  if (!adminStmt.step()) {
    const hashedAdmin = bcrypt.hashSync(adminPassword, 10);
    db.run(
      'INSERT INTO users (name, email, password_hash, is_verified, role, status, phone) VALUES (?, ?, ?, 1, ?, ?, ?)',
      [adminName, adminEmail, hashedAdmin, 'admin', 'active', '+1 (555) 999-0000']
    );
    console.log(`[SQLite] Admin account seeded: ${adminEmail} / ${adminPassword}`);
  } else {
    // Ensure existing admin user has admin role and updated password hash
    const hashedAdmin = bcrypt.hashSync(adminPassword, 10);
    db.run('UPDATE users SET role = ?, password_hash = ?, status = ? WHERE lower(email) = lower(?)', ['admin', hashedAdmin, 'active', adminEmail]);
  }
  adminStmt.free();

  // 3. Seed Products
  if (Array.isArray(PRODUCTS) && PRODUCTS.length > 0) {
    for (const p of PRODUCTS) {
      const sku = p.sku || `SKU-AUR-${(p.category || 'GEN').slice(0, 3).toUpperCase()}-${p.id.replace('prod-', '')}`;
      db.run(
        `INSERT OR REPLACE INTO products (
          id, serial_number, sku, name, category, price, original_price, rating, reviews_count, stock, badge, tagline, description,
          features_json, specs_json, images_json, colors_json, reviews_json, is_archived
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          p.id,
          p.serialNumber || `AUR-HW-${p.id.replace('prod-', '8')}-X`,
          sku,
          p.name,
          p.category,
          p.price,
          p.originalPrice || null,
          p.rating || 5.0,
          p.reviewsCount || 0,
          p.stock || 12,
          p.badge || null,
          p.tagline || '',
          p.description || '',
          JSON.stringify(p.features || []),
          JSON.stringify(p.specs || {}),
          JSON.stringify(p.images || []),
          JSON.stringify(p.colors || []),
          JSON.stringify(p.reviews || [])
        ]
      );
    }
  }

  // 4. Seed Demo Coupons (SAVE20, AURA10, FREESHIP)
  const defaultCoupons = [
    { code: 'SAVE20', discount_type: 'percentage', discount_value: 20, min_order_amount: 50, usage_limit: 500, times_used: 42 },
    { code: 'AURA10', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, usage_limit: 1000, times_used: 128 },
    { code: 'FREESHIP', discount_type: 'fixed', discount_value: 25, min_order_amount: 0, usage_limit: 500, times_used: 65 }
  ];

  for (const c of defaultCoupons) {
    const cStmt = db.prepare('SELECT id FROM coupons WHERE code = :code');
    cStmt.bind({ ':code': c.code });
    if (!cStmt.step()) {
      db.run(
        'INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, usage_limit, times_used, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [c.code, c.discount_type, c.discount_value, c.min_order_amount, c.usage_limit, c.times_used]
      );
    }
    cStmt.free();
  }

  // 5. Seed Initial Warranties from Catalog
  for (const p of PRODUCTS) {
    if (p.serialNumber) {
      const wStmt = db.prepare('SELECT id FROM warranties WHERE serial_number = :serial');
      wStmt.bind({ ':serial': p.serialNumber });
      if (!wStmt.step()) {
        const expiry = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString();
        db.run(
          `INSERT INTO warranties (serial_number, product_id, product_name, customer_name, customer_email, warranty_status, expiry_date, notes)
           VALUES (?, ?, ?, 'Authorized Retailer Unit', 'support@auracommerce.io', 'Active (2-Year Global Protection)', ?, 'Factory Certified Hardware')`,
          [p.serialNumber, p.id, p.name, expiry]
        );
      }
      wStmt.free();
    }
  }

  // 6. Seed Sample Address for Demo User
  const addrCheck = db.prepare("SELECT id FROM addresses WHERE user_id = 1");
  if (!addrCheck.step()) {
    db.run(
      `INSERT INTO addresses (user_id, name, street, city, state, zip, country, phone, is_default)
       VALUES (1, 'Alex Vance', '742 Evergreen Terrace', 'San Francisco', 'CA', '94107', 'United States', '+1 (555) 234-8901', 1)`
    );
  }
  addrCheck.free();

  // 7. Seed Sample Notifications for Demo User
  const notifCheck = db.prepare("SELECT id FROM notifications WHERE user_id = 1");
  if (!notifCheck.step()) {
    db.run(
      `INSERT INTO notifications (user_id, title, message, type, is_read)
       VALUES (1, 'Welcome to Aura Care', 'Your 2-Year International Aura Care Warranty has been initialized.', 'success', 0)`
    );
    db.run(
      `INSERT INTO notifications (user_id, title, message, type, is_read)
       VALUES (1, 'DHL Express Dispatched', 'Your recent Aura hardware shipment is in transit with DHL Express Priority.', 'order', 0)`
    );
  }
  notifCheck.free();

  // 8. Seed Default Store Settings
  const defaultSettings = [
    {
      key: 'general',
      value: JSON.stringify({
        storeName: 'Aura Technology & Audio Systems',
        storeTagline: 'Pure Hardware. Zero Compromise.',
        contactEmail: 'support@auracommerce.io',
        contactPhone: '+1 (800) 287-2432',
        currency: 'USD',
        orderPrefix: 'AUR-',
        supportHours: 'Monday – Friday, 9:00 AM – 6:00 PM EST'
      })
    },
    {
      key: 'shipping',
      value: JSON.stringify({
        defaultCarrier: 'DHL Express Worldwide',
        freeShippingThreshold: 500,
        standardShippingRate: 25,
        priorityShippingRate: 45,
        internationalShippingRate: 65,
        dispatchCutoffTime: '16:00 EST'
      })
    },
    {
      key: 'checkout',
      value: JSON.stringify({
        taxRate: 8.0,
        requirePhone: false,
        enableCoupons: true,
        maxItemsPerOrder: 5,
        allowGuestCheckout: false
      })
    },
    {
      key: 'notifications',
      value: JSON.stringify({
        emailOnNewOrder: true,
        emailOnLowStock: true,
        lowStockThreshold: 5,
        emailOnWarrantyClaim: true
      })
    }
  ];

  for (const s of defaultSettings) {
    const sStmt = db.prepare('SELECT key FROM store_settings WHERE key = :key');
    sStmt.bind({ ':key': s.key });
    if (!sStmt.step()) {
      db.run('INSERT INTO store_settings (key, value_json) VALUES (?, ?)', [s.key, s.value]);
    }
    sStmt.free();
  }

  saveDb();
  return db;
}

export function saveDb() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.warn('[SQLite] saveDb warning:', err.message);
  }
}

// -------------------------------------------------------------
// USER & PROFILE DATABASE FUNCTIONS
// -------------------------------------------------------------

export async function saveOtpRecord(email, otpCode, ttlMs = 10 * 60 * 1000) {
  const database = await getDb();
  database.run('DELETE FROM otps WHERE lower(email) = lower(?)', [email.trim()]);
  const expiresAt = Date.now() + ttlMs;
  database.run('INSERT INTO otps (email, otp_code, expires_at) VALUES (?, ?, ?)', [
    email.trim().toLowerCase(),
    otpCode,
    expiresAt
  ]);
  saveDb();
}

export async function verifyOtpRecord(email, otpCode) {
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM otps WHERE lower(email) = lower(:email)');
  stmt.bind({ ':email': email.trim() });
  
  if (stmt.step()) {
    const record = stmt.getAsObject();
    stmt.free();

    if (Date.now() > record.expires_at) {
      return { valid: false, reason: 'Verification code has expired. Please request a new one.' };
    }
    if (record.otp_code !== otpCode) {
      return { valid: false, reason: 'Invalid verification code.' };
    }

    database.run('DELETE FROM otps WHERE lower(email) = lower(?)', [email.trim()]);
    database.run('UPDATE users SET is_verified = 1 WHERE lower(email) = lower(?)', [email.trim()]);
    saveDb();

    return { valid: true };
  }
  stmt.free();
  return { valid: false, reason: 'No active verification code found for this email.' };
}

export async function findUserByEmail(email) {
  if (!email) return null;
  const database = await getDb();
  const stmt = database.prepare('SELECT id, name, email, password_hash, is_verified, role, status, phone, created_at FROM users WHERE lower(email) = lower(:email)');
  stmt.bind({ ':email': email.trim() });
  
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

export async function findUserById(id) {
  if (!id) return null;
  const database = await getDb();
  const stmt = database.prepare('SELECT id, name, email, is_verified, role, status, phone, created_at FROM users WHERE id = :id');
  stmt.bind({ ':id': id });
  
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

export async function insertUser({ name, email, password_hash, is_verified = 1, role = 'user', phone = '' }) {
  const database = await getDb();
  database.run(
    'INSERT INTO users (name, email, password_hash, is_verified, role, status, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name.trim(), email.trim().toLowerCase(), password_hash, is_verified, role, 'active', phone]
  );
  saveDb();

  return await findUserByEmail(email);
}

export async function getAllUsers({ search, role, status } = {}) {
  const database = await getDb();
  let query = 'SELECT id, name, email, is_verified, role, status, phone, created_at FROM users WHERE 1=1';
  const params = {};

  if (search && search.trim()) {
    query += ' AND (lower(name) LIKE :search OR lower(email) LIKE :search)';
    params[':search'] = `%${search.trim().toLowerCase()}%`;
  }
  if (role && role !== 'all') {
    query += ' AND lower(role) = lower(:role)';
    params[':role'] = role;
  }
  if (status && status !== 'all') {
    query += ' AND lower(status) = lower(:status)';
    params[':status'] = status;
  }

  query += ' ORDER BY created_at DESC';

  const stmt = database.prepare(query);
  stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    const u = stmt.getAsObject();
    results.push(u);
  }
  stmt.free();

  // Attach order summary for each customer
  for (const user of results) {
    const oStmt = database.prepare('SELECT COUNT(*) as count, SUM(summary_json) as total FROM orders WHERE user_id = :uid OR lower(user_email) = lower(:email)');
    oStmt.bind({ ':uid': user.id, ':email': user.email });
    if (oStmt.step()) {
      const oRow = oStmt.getAsObject();
      user.totalOrders = oRow.count || 0;
    }
    oStmt.free();
  }

  return results;
}

export async function updateUserStatus(id, status) {
  const database = await getDb();
  database.run('UPDATE users SET status = ? WHERE id = ?', [status, id]);
  saveDb();
  return await findUserById(id);
}

export async function updateUserRole(id, role) {
  const database = await getDb();
  database.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  saveDb();
  return await findUserById(id);
}

export async function updateUserProfile(id, { name, phone, password_hash }) {
  const database = await getDb();
  if (password_hash) {
    database.run('UPDATE users SET name = ?, phone = ?, password_hash = ? WHERE id = ?', [name, phone, password_hash, id]);
  } else {
    database.run('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone, id]);
  }
  saveDb();
  return await findUserById(id);
}

// -------------------------------------------------------------
// PRODUCT REVIEWS
// -------------------------------------------------------------

export async function getAllReviews({ status, productId } = {}) {
  const database = await getDb();
  let query = 'SELECT * FROM reviews WHERE 1=1';
  const params = {};

  if (status && status !== 'all') {
    query += ' AND status = :status';
    params[':status'] = status;
  }
  if (productId) {
    query += ' AND product_id = :productId';
    params[':productId'] = productId;
  }

  query += ' ORDER BY created_at DESC';
  const stmt = database.prepare(query);
  stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export async function getReviewsByUser(userId, email) {
  const database = await getDb();
  let query = 'SELECT * FROM reviews WHERE 1=0';
  const params = {};

  if (userId) {
    query += ' OR user_id = :userId';
    params[':userId'] = userId;
  }
  if (email) {
    query += ' OR lower(user_email) = lower(:email)';
    params[':email'] = email.trim();
  }
  query += ' ORDER BY created_at DESC';

  const stmt = database.prepare(query);
  stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export async function addReview({ productId, userId, userName, userEmail, rating, title, comment, status = 'approved' }) {
  const database = await getDb();
  const id = `REV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  database.run(
    'INSERT INTO reviews (id, product_id, user_id, user_name, user_email, rating, title, comment, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, productId, userId || null, userName, userEmail || null, rating, title || '', comment, status]
  );
  saveDb();

  return { id, productId, userId, userName, userEmail, rating, title, comment, status, created_at: new Date().toISOString() };
}

export async function updateReviewStatus(id, status) {
  const database = await getDb();
  database.run('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
  saveDb();
  return { id, status };
}

export async function deleteReview(id) {
  const database = await getDb();
  database.run('DELETE FROM reviews WHERE id = ?', [id]);
  saveDb();
  return { success: true };
}

// -------------------------------------------------------------
// ADDRESSES
// -------------------------------------------------------------

export async function getAddressesByUserId(userId) {
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM addresses WHERE user_id = :uid ORDER BY is_default DESC, created_at DESC');
  stmt.bind({ ':uid': userId });

  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export async function addAddress(userId, { name, street, city, state, zip, country, phone, is_default = 0 }) {
  const database = await getDb();
  if (is_default) {
    database.run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
  }
  database.run(
    'INSERT INTO addresses (user_id, name, street, city, state, zip, country, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, name, street, city, state || '', zip, country, phone || '', is_default ? 1 : 0]
  );
  saveDb();
  return await getAddressesByUserId(userId);
}

export async function updateAddress(id, userId, { name, street, city, state, zip, country, phone, is_default }) {
  const database = await getDb();
  if (is_default) {
    database.run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
  }
  database.run(
    'UPDATE addresses SET name = ?, street = ?, city = ?, state = ?, zip = ?, country = ?, phone = ?, is_default = ? WHERE id = ? AND user_id = ?',
    [name, street, city, state || '', zip, country, phone || '', is_default ? 1 : 0, id, userId]
  );
  saveDb();
  return await getAddressesByUserId(userId);
}

export async function deleteAddress(id, userId) {
  const database = await getDb();
  database.run('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
  saveDb();
  return await getAddressesByUserId(userId);
}

// -------------------------------------------------------------
// COUPONS
// -------------------------------------------------------------

export async function getAllCoupons() {
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM coupons ORDER BY created_at DESC');
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export async function getCouponByCode(code) {
  if (!code) return null;
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM coupons WHERE upper(code) = upper(:code)');
  stmt.bind({ ':code': code.trim() });
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

export async function createCoupon({ code, discount_type = 'percentage', discount_value, min_order_amount = 0, max_discount_amount = null, usage_limit = 1000, expires_at = null }) {
  const database = await getDb();
  database.run(
    'INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active, expires_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
    [code.trim().toUpperCase(), discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, expires_at]
  );
  saveDb();
  return await getCouponByCode(code);
}

export async function updateCoupon(id, { discount_type, discount_value, min_order_amount, usage_limit, is_active, expires_at }) {
  const database = await getDb();
  database.run(
    'UPDATE coupons SET discount_type = ?, discount_value = ?, min_order_amount = ?, usage_limit = ?, is_active = ?, expires_at = ? WHERE id = ?',
    [discount_type, discount_value, min_order_amount, usage_limit, is_active ? 1 : 0, expires_at, id]
  );
  saveDb();
  const stmt = database.prepare('SELECT * FROM coupons WHERE id = :id');
  stmt.bind({ ':id': id });
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

export async function deleteCoupon(id) {
  const database = await getDb();
  database.run('DELETE FROM coupons WHERE id = ?', [id]);
  saveDb();
  return { success: true };
}

export async function incrementCouponUsage(code) {
  const database = await getDb();
  database.run('UPDATE coupons SET times_used = times_used + 1 WHERE upper(code) = upper(?)', [code.trim()]);
  saveDb();
}

// -------------------------------------------------------------
// WARRANTIES
// -------------------------------------------------------------

export async function getAllWarranties({ search, status } = {}) {
  const database = await getDb();
  let query = 'SELECT * FROM warranties WHERE 1=1';
  const params = {};

  if (search && search.trim()) {
    query += ' AND (upper(serial_number) LIKE :search OR lower(customer_name) LIKE :search OR lower(customer_email) LIKE :search OR lower(product_name) LIKE :search)';
    params[':search'] = `%${search.trim().toLowerCase()}%`;
  }
  if (status && status !== 'all') {
    query += ' AND warranty_status = :status';
    params[':status'] = status;
  }

  query += ' ORDER BY registered_at DESC';
  const stmt = database.prepare(query);
  stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export async function getWarrantyBySerial(serial) {
  if (!serial) return null;
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM warranties WHERE upper(serial_number) = upper(:serial)');
  stmt.bind({ ':serial': serial.trim() });
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

export async function getWarrantiesByUser(email) {
  if (!email) return [];
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM warranties WHERE lower(customer_email) = lower(:email) ORDER BY registered_at DESC');
  stmt.bind({ ':email': email.trim() });
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export async function updateWarranty(id, { warranty_status, expiry_date, notes }) {
  const database = await getDb();
  database.run('UPDATE warranties SET warranty_status = ?, expiry_date = ?, notes = ? WHERE id = ?', [warranty_status, expiry_date, notes, id]);
  saveDb();
  const stmt = database.prepare('SELECT * FROM warranties WHERE id = :id');
  stmt.bind({ ':id': id });
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

// -------------------------------------------------------------
// ADMIN AUDIT LOGS
// -------------------------------------------------------------

export async function addAuditLog({ adminId = null, adminEmail = 'admin@gmail.com', action, targetType, targetId = '', details = {}, ipAddress = '' }) {
  const database = await getDb();
  database.run(
    'INSERT INTO admin_logs (admin_id, admin_email, action, target_type, target_id, details_json, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [adminId, adminEmail, action, targetType, targetId, JSON.stringify(details), ipAddress]
  );
  saveDb();
}

export async function getAuditLogs({ limit = 50, action = null, targetType = null } = {}) {
  const database = await getDb();
  let query = 'SELECT * FROM admin_logs WHERE 1=1';
  const params = {};

  if (action) {
    query += ' AND action = :action';
    params[':action'] = action;
  }
  if (targetType) {
    query += ' AND target_type = :targetType';
    params[':targetType'] = targetType;
  }

  query += ' ORDER BY created_at DESC LIMIT ' + parseInt(limit, 10);
  const stmt = database.prepare(query);
  stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    row.details = row.details_json ? JSON.parse(row.details_json) : {};
    results.push(row);
  }
  stmt.free();
  return results;
}

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------

export async function getNotificationsByUser(userId) {
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM notifications WHERE user_id = :uid ORDER BY created_at DESC LIMIT 20');
  stmt.bind({ ':uid': userId });

  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export async function markNotificationRead(id, userId) {
  const database = await getDb();
  database.run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
  saveDb();
  return { success: true };
}

// -------------------------------------------------------------
// PRODUCTS CRUD
// -------------------------------------------------------------

function formatProductRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    serialNumber: row.serial_number || `AUR-HW-${row.id.replace('prod-', '8')}-X`,
    sku: row.sku || `SKU-AUR-${(row.category || 'GEN').slice(0, 3).toUpperCase()}-${row.id.replace('prod-', '')}`,
    name: row.name,
    category: row.category,
    price: row.price,
    originalPrice: row.original_price,
    rating: row.rating,
    reviewsCount: row.reviews_count,
    stock: row.stock,
    badge: row.badge,
    tagline: row.tagline,
    description: row.description,
    features: row.features_json ? JSON.parse(row.features_json) : [],
    specs: row.specs_json ? JSON.parse(row.specs_json) : {},
    images: row.images_json ? JSON.parse(row.images_json) : [],
    colors: row.colors_json ? JSON.parse(row.colors_json) : [],
    reviews: row.reviews_json ? JSON.parse(row.reviews_json) : [],
    isArchived: Boolean(row.is_archived)
  };
}

export async function getAllProducts({ category, search, sort, archived = 'active' } = {}) {
  const database = await getDb();
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = {};

  if (archived === 'active') {
    query += ' AND (is_archived = 0 OR is_archived IS NULL)';
  } else if (archived === 'archived') {
    query += ' AND is_archived = 1';
  }

  if (category && category !== 'all') {
    query += ' AND category = :category';
    params[':category'] = category;
  }

  if (search && search.trim()) {
    query += ' AND (lower(name) LIKE :search OR lower(description) LIKE :search OR lower(tagline) LIKE :search OR lower(sku) LIKE :search)';
    params[':search'] = `%${search.trim().toLowerCase()}%`;
  }

  if (sort === 'price-asc') {
    query += ' ORDER BY price ASC';
  } else if (sort === 'price-desc') {
    query += ' ORDER BY price DESC';
  } else if (sort === 'rating') {
    query += ' ORDER BY rating DESC';
  } else if (sort === 'stock-asc') {
    query += ' ORDER BY stock ASC';
  } else if (sort === 'stock-desc') {
    query += ' ORDER BY stock DESC';
  } else {
    query += ' ORDER BY rowid ASC';
  }

  const stmt = database.prepare(query);
  stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    results.push(formatProductRow(stmt.getAsObject()));
  }
  stmt.free();
  return results;
}

export async function getProductById(id) {
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM products WHERE id = :id');
  stmt.bind({ ':id': id });
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return formatProductRow(row);
  }
  stmt.free();
  return null;
}

export async function createProduct(productData) {
  const database = await getDb();
  const id = productData.id || `prod-${Date.now().toString().slice(-4)}`;
  const serial = productData.serialNumber || `AUR-HW-${Math.floor(1000 + Math.random() * 9000)}-${(productData.category || 'GEN').slice(0, 3).toUpperCase()}`;
  const sku = productData.sku || `SKU-AUR-${(productData.category || 'GEN').slice(0, 3).toUpperCase()}-${id.replace('prod-', '')}`;

  database.run(
    `INSERT INTO products (
      id, serial_number, sku, name, category, price, original_price, rating, reviews_count, stock, badge, tagline, description,
      features_json, specs_json, images_json, colors_json, reviews_json, is_archived
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      serial,
      sku,
      productData.name,
      productData.category,
      parseFloat(productData.price) || 0,
      productData.originalPrice ? parseFloat(productData.originalPrice) : null,
      parseFloat(productData.rating) || 5.0,
      parseInt(productData.reviewsCount, 10) || 0,
      parseInt(productData.stock, 10) || 10,
      productData.badge || null,
      productData.tagline || '',
      productData.description || '',
      JSON.stringify(productData.features || []),
      JSON.stringify(productData.specs || {}),
      JSON.stringify(productData.images || []),
      JSON.stringify(productData.colors || []),
      JSON.stringify(productData.reviews || []),
      productData.isArchived ? 1 : 0
    ]
  );
  saveDb();

  return await getProductById(id);
}

export async function updateProduct(id, productData) {
  const database = await getDb();
  const existing = await getProductById(id);
  const sku = productData.sku || existing?.sku || `SKU-AUR-${(productData.category || 'GEN').slice(0, 3).toUpperCase()}-${id.replace('prod-', '')}`;
  const isArchived = productData.isArchived !== undefined ? (productData.isArchived ? 1 : 0) : (existing?.isArchived ? 1 : 0);

  database.run(
    `UPDATE products SET
      name = ?, category = ?, price = ?, original_price = ?, stock = ?, badge = ?, tagline = ?, description = ?,
      features_json = ?, specs_json = ?, images_json = ?, colors_json = ?, serial_number = ?, sku = ?, is_archived = ?
     WHERE id = ?`,
    [
      productData.name,
      productData.category,
      parseFloat(productData.price) || 0,
      productData.originalPrice ? parseFloat(productData.originalPrice) : null,
      parseInt(productData.stock, 10) || 0,
      productData.badge || null,
      productData.tagline || '',
      productData.description || '',
      JSON.stringify(productData.features || []),
      JSON.stringify(productData.specs || {}),
      JSON.stringify(productData.images || []),
      JSON.stringify(productData.colors || []),
      productData.serialNumber || null,
      sku,
      isArchived,
      id
    ]
  );
  saveDb();

  return await getProductById(id);
}

export async function archiveProduct(id, adminEmail = 'admin@gmail.com') {
  const database = await getDb();
  database.run('UPDATE products SET is_archived = 1 WHERE id = ?', [id]);
  saveDb();
  return await getProductById(id);
}

export async function restoreProduct(id, adminEmail = 'admin@gmail.com') {
  const database = await getDb();
  database.run('UPDATE products SET is_archived = 0 WHERE id = ?', [id]);
  saveDb();
  return await getProductById(id);
}

export async function deleteProduct(id) {
  const database = await getDb();
  database.run('DELETE FROM products WHERE id = ?', [id]);
  saveDb();
  return { success: true };
}

export async function updateProductStock(id, newStock) {
  const database = await getDb();
  database.run('UPDATE products SET stock = ? WHERE id = ?', [parseInt(newStock, 10), id]);
  saveDb();
  return await getProductById(id);
}

export async function adjustProductStockWithLog({ productId, adjustmentType = 'correction', quantityChange, reason = '', adminEmail = 'admin@gmail.com' }) {
  const database = await getDb();
  const product = await getProductById(productId);
  if (!product) throw new Error(`Product ${productId} not found.`);

  const oldStock = parseInt(product.stock, 10) || 0;
  const change = parseInt(quantityChange, 10);
  if (isNaN(change)) throw new Error('Invalid quantity change.');

  const newStock = oldStock + change;
  if (newStock < 0) {
    throw new Error(`Insufficient inventory: current stock is ${oldStock}, cannot reduce by ${Math.abs(change)}.`);
  }

  database.run('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);
  database.run(
    `INSERT INTO inventory_logs (product_id, product_name, adjustment_type, quantity_change, old_stock, new_stock, reason, admin_email)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [productId, product.name, adjustmentType, change, oldStock, newStock, reason || 'Manual Admin Adjustment', adminEmail]
  );
  saveDb();

  return { product: await getProductById(productId), oldStock, newStock, change };
}

export async function getInventoryLogs({ limit = 50, productId = null } = {}) {
  const database = await getDb();
  let query = 'SELECT * FROM inventory_logs WHERE 1=1';
  const params = {};

  if (productId) {
    query += ' AND product_id = :pid';
    params[':pid'] = productId;
  }

  query += ' ORDER BY created_at DESC LIMIT ' + parseInt(limit, 10);
  const stmt = database.prepare(query);
  stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// -------------------------------------------------------------
// ORDERS & ADMIN ORDERS MANAGEMENT
// -------------------------------------------------------------

function formatOrderRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    items: row.items_json ? JSON.parse(row.items_json) : [],
    summary: row.summary_json ? JSON.parse(row.summary_json) : {},
    shippingDetails: row.shipping_details_json ? JSON.parse(row.shipping_details_json) : {},
    deliveryMethod: row.delivery_method,
    paymentMethod: row.payment_method,
    paymentLast4: row.payment_last4,
    paymentStatus: row.payment_status || 'Paid',
    status: row.status,
    carrier: row.carrier || 'DHL Express Worldwide',
    trackingNumber: row.tracking_number || 'DHL-AUR-84920412',
    estimatedDelivery: row.estimated_delivery,
    notes: row.notes || '',
    orderSource: row.order_source || 'STOREFRONT',
    createdByAdmin: row.created_by_admin || null,
    adminId: row.admin_id || null,
    date: row.created_at
  };
}

export async function createOrder(orderData) {
  const database = await getDb();
  const id = orderData.id || `AUR-${Math.floor(100000 + Math.random() * 900000)}`;
  const trackingNumber = orderData.trackingNumber || `DHL-AUR-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const estimatedDelivery = orderData.estimatedDelivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  database.run(
    `INSERT INTO orders (
      id, user_id, user_email, items_json, summary_json, shipping_details_json,
      delivery_method, payment_method, payment_last4, payment_status, status, carrier, tracking_number, estimated_delivery, notes,
      order_source, created_by_admin, admin_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      orderData.userId || null,
      (orderData.userEmail || '').toLowerCase(),
      JSON.stringify(orderData.items || []),
      JSON.stringify(orderData.summary || {}),
      JSON.stringify(orderData.shippingDetails || {}),
      orderData.deliveryMethod || 'DHL Express Priority',
      orderData.paymentMethod || 'Credit Card (Stripe)',
      orderData.paymentLast4 || '4242',
      orderData.paymentStatus || 'Paid',
      orderData.status || 'Processing',
      orderData.carrier || 'DHL Express Worldwide',
      trackingNumber,
      estimatedDelivery,
      orderData.notes || '',
      orderData.orderSource || 'STOREFRONT',
      orderData.createdByAdmin || null,
      orderData.adminId || null
    ]
  );

  // Decrement inventory stock & add log
  if (Array.isArray(orderData.items)) {
    for (const it of orderData.items) {
      const prodId = it.product?.id || it.id || it.productId;
      const qty = parseInt(it.quantity, 10) || 1;
      if (prodId) {
        const prod = await getProductById(prodId);
        if (prod) {
          const oldStock = prod.stock;
          const newStock = Math.max(0, oldStock - qty);
          database.run('UPDATE products SET stock = ? WHERE id = ?', [newStock, prodId]);
          database.run(
            `INSERT INTO inventory_logs (product_id, product_name, adjustment_type, quantity_change, old_stock, new_stock, reason, admin_email)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [prodId, prod.name, 'sale', -qty, oldStock, newStock, `Order #${id}`, orderData.createdByAdmin ? `${orderData.createdByAdmin}` : (orderData.userEmail || 'storefront')]
          );
        }
      }
    }
  }

  // Register warranties for purchased serialized hardware
  if (Array.isArray(orderData.items)) {
    const customerName = orderData.shippingDetails ? `${orderData.shippingDetails.firstName || orderData.shippingDetails.name || orderData.shippingDetails.fullName || ''} ${orderData.shippingDetails.lastName || ''}`.trim() : 'Customer';
    const expiry = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString();

    for (const it of orderData.items) {
      const serial = it.serialNumber || (it.product?.serialNumber) || `AUR-HW-${Math.floor(1000 + Math.random() * 9000)}-${id.slice(-4)}`;
      try {
        database.run(
          `INSERT OR REPLACE INTO warranties (serial_number, product_id, product_name, order_id, customer_name, customer_email, warranty_status, expiry_date)
           VALUES (?, ?, ?, ?, ?, ?, 'Active (2-Year Global Protection)', ?)`,
          [serial, it.product?.id || it.id || 'prod-custom', it.product?.name || it.name || 'Aura Hardware Unit', id, customerName, orderData.userEmail, expiry]
        );
      } catch (e) {}
    }
  }

  saveDb();
  return await getOrderById(id);
}

export async function calculateAdminOrderPreview({ items, couponCode, deliveryMethod }) {
  if (!items || !items.length) {
    return { subtotal: 0, discountAmount: 0, shippingFee: 0, taxAmount: 0, total: 0, validatedItems: [] };
  }

  const validatedItems = [];
  let subtotal = 0;

  for (const it of items) {
    const prodId = it.productId || it.product?.id || it.id;
    const prod = await getProductById(prodId);
    if (!prod) throw new Error(`Product not found: ${prodId}`);
    if (prod.isArchived) throw new Error(`Product "${prod.name}" is archived and cannot be ordered.`);

    const qty = parseInt(it.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Invalid quantity for "${prod.name}".`);
    }

    if (prod.stock < qty) {
      throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.stock}, requested: ${qty}.`);
    }

    // Backend price security: strictly use prod.price from database
    const dbPrice = parseFloat(prod.price) || 0;
    subtotal += dbPrice * qty;

    validatedItems.push({
      productId: prod.id,
      name: prod.name,
      sku: prod.sku,
      image: prod.images?.[0] || '',
      price: dbPrice,
      quantity: qty,
      stock: prod.stock,
      selectedColor: it.selectedColor || prod.colors?.[0]?.name || 'Standard Finish',
      lineTotal: dbPrice * qty
    });
  }

  let discountAmount = 0;
  let appliedCoupon = null;
  if (couponCode && couponCode.trim()) {
    const coupon = await getCouponByCode(couponCode.trim());
    if (coupon && coupon.is_active) {
      if (!coupon.min_order_amount || subtotal >= coupon.min_order_amount) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = (subtotal * coupon.discount_value) / 100;
          if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
            discountAmount = coupon.max_discount_amount;
          }
        } else {
          discountAmount = Math.min(subtotal, coupon.discount_value);
        }
        discountAmount = Math.round(discountAmount * 100) / 100;
        appliedCoupon = { code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value };
      }
    }
  }

  let shippingFee = 0;
  if (deliveryMethod === 'DHL Express Priority Air' || deliveryMethod === 'DHL Express Priority') {
    shippingFee = 25;
  } else {
    shippingFee = subtotal >= 500 ? 0 : 25;
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.08 * 100) / 100;
  const total = Math.round((taxableAmount + shippingFee + taxAmount) * 100) / 100;

  return {
    subtotal,
    discountAmount,
    shippingFee,
    taxAmount,
    total,
    appliedCoupon,
    validatedItems
  };
}

export async function createAdminOrder(orderData, adminUser = { email: 'admin@gmail.com' }) {
  const database = await getDb();
  const { customerId, customerEmail, customerName, items, shippingAddress, couponCode, deliveryMethod, paymentMethod, paymentStatus, notes } = orderData;

  // 1. Critical Business Rule: Verify Customer Exists in Database
  let customer = null;
  if (customerId) {
    customer = await findUserById(customerId);
  }
  if (!customer && customerEmail) {
    customer = await findUserByEmail(customerEmail);
  }

  if (!customer) {
    throw new Error('Selected customer does not exist in the database. Arbitrary or non-existing customer IDs are not permitted.');
  }

  if (customer.status === 'disabled') {
    throw new Error(`Customer account "${customer.email}" is suspended. Cannot create an order for a suspended account.`);
  }

  if (!items || !items.length) {
    throw new Error('Order must contain at least 1 product line item.');
  }

  // 2. Validate line items & backend prices directly from database
  const validatedItems = [];
  let subtotal = 0;

  for (const it of items) {
    const prodId = it.productId || it.product?.id || it.id;
    const prod = await getProductById(prodId);
    if (!prod) {
      throw new Error(`Product not found: ${prodId}`);
    }
    if (prod.isArchived) {
      throw new Error(`Product "${prod.name}" is archived and cannot be ordered.`);
    }

    const qty = parseInt(it.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Invalid quantity for "${prod.name}". Quantity must be at least 1.`);
    }

    if (prod.stock < qty) {
      throw new Error(`Insufficient stock for "${prod.name}". Available stock: ${prod.stock}, requested: ${qty}.`);
    }

    // Backend security: Price is strictly fetched from DB product record
    const dbPrice = parseFloat(prod.price) || 0;
    subtotal += dbPrice * qty;

    validatedItems.push({
      product: prod,
      quantity: qty,
      price: dbPrice,
      selectedColor: it.selectedColor || prod.colors?.[0]?.name || 'Standard Finish',
      serialNumber: `AUR-HW-${Math.floor(1000 + Math.random() * 9000)}-ADM`,
      warrantyStatus: 'Active (2-Year Global Protection)'
    });
  }

  // 3. Validate coupon if provided
  let discountAmount = 0;
  let appliedCouponCode = null;
  if (couponCode && couponCode.trim()) {
    const coupon = await getCouponByCode(couponCode.trim());
    if (coupon && coupon.is_active) {
      if (!coupon.min_order_amount || subtotal >= coupon.min_order_amount) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = (subtotal * coupon.discount_value) / 100;
          if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
            discountAmount = coupon.max_discount_amount;
          }
        } else {
          discountAmount = Math.min(subtotal, coupon.discount_value);
        }
        discountAmount = Math.round(discountAmount * 100) / 100;
        appliedCouponCode = coupon.code;
        await incrementCouponUsage(coupon.code);
      } else {
        throw new Error(`Order subtotal ($${subtotal.toFixed(2)}) does not meet the minimum requirement of $${coupon.min_order_amount} for coupon ${coupon.code}.`);
      }
    } else if (couponCode.trim()) {
      throw new Error(`Coupon code "${couponCode}" is invalid or expired.`);
    }
  }

  // 4. Calculation of taxes & shipping
  let shippingFee = 0;
  if (deliveryMethod === 'DHL Express Priority Air' || deliveryMethod === 'DHL Express Priority') {
    shippingFee = 25;
  } else {
    // Default DHL Express Worldwide
    shippingFee = subtotal >= 500 ? 0 : 25;
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.08 * 100) / 100;
  const total = Math.round((taxableAmount + shippingFee + taxAmount) * 100) / 100;

  // 5. CRITICAL BUSINESS LOGIC:
  // The created order must belong to the SELECTED CUSTOMER.
  // Order Owner/Buyer = Customer
  // Order Operator = Admin
  const buyerUserId = customer.id;
  const buyerUserEmail = customer.email;
  const buyerCustomerName = customer.name || customerName || 'Valued Customer';
  const adminIdentifier = adminUser.name ? `${adminUser.name} (${adminUser.email})` : (adminUser.email || 'Aura System Admin');

  const orderId = `AUR-${Math.floor(100000 + Math.random() * 900000)}`;
  const trackingNumber = `DHL-AUR-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const fullNotes = `[ADMIN-ASSISTED ORDER created by ${adminIdentifier}] ${notes || ''}`.trim();

  // Create order via createOrder
  const created = await createOrder({
    id: orderId,
    userId: buyerUserId,
    userEmail: buyerUserEmail,
    items: validatedItems,
    summary: {
      subtotal,
      discountAmount,
      shippingFee,
      taxAmount,
      total,
      couponCode: appliedCouponCode
    },
    shippingDetails: {
      fullName: buyerCustomerName,
      email: buyerUserEmail,
      address: shippingAddress?.address || shippingAddress?.street || '100 Immersion Way',
      city: shippingAddress?.city || 'Portland',
      state: shippingAddress?.state || 'OR',
      zip: shippingAddress?.zip || '97201',
      country: shippingAddress?.country || 'United States',
      phone: shippingAddress?.phone || customer.phone || '+1 (503) 555-0199'
    },
    deliveryMethod: deliveryMethod || 'DHL Express Worldwide',
    paymentMethod: paymentMethod || 'Manual Corporate Invoice',
    paymentLast4: '0000',
    paymentStatus: paymentStatus || 'Paid',
    status: 'Confirmed',
    carrier: 'DHL Express Worldwide',
    trackingNumber,
    estimatedDelivery,
    notes: fullNotes,
    orderSource: 'ADMIN_CREATED',
    createdByAdmin: adminIdentifier,
    adminId: adminUser.id || null
  });

  // Record Audit Event
  await addAuditLog({
    adminId: adminUser.id || null,
    adminEmail: adminUser.email,
    action: 'CREATE_ORDER',
    targetType: 'order',
    targetId: orderId,
    details: {
      action: 'CREATE_ORDER',
      admin: adminUser.name || adminUser.email || 'Aura System Admin',
      adminEmail: adminUser.email,
      customer: buyerCustomerName,
      customerEmail: buyerUserEmail,
      customerId: buyerUserId,
      order: orderId,
      orderSource: 'ADMIN_CREATED',
      subtotal,
      discountAmount,
      shippingFee,
      taxAmount,
      total,
      paymentMethod: paymentMethod || 'Manual Corporate Invoice',
      paymentStatus: paymentStatus || 'Paid',
      itemCount: validatedItems.length,
      items: validatedItems.map(it => ({ id: it.product.id, name: it.product.name, qty: it.quantity, price: it.price }))
    }
  });

  return created;
}

export async function getOrderById(id) {
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM orders WHERE id = :id');
  stmt.bind({ ':id': id });
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return formatOrderRow(row);
  }
  stmt.free();
  return null;
}

export async function getOrdersByUser(userId, email) {
  const database = await getDb();
  let query = 'SELECT * FROM orders WHERE 1=0';
  const params = {};

  if (userId) {
    query += ' OR user_id = :userId';
    params[':userId'] = userId;
  }
  if (email) {
    query += ' OR lower(user_email) = lower(:email)';
    params[':email'] = email.trim();
  }
  query += ' ORDER BY created_at DESC';

  const stmt = database.prepare(query);
  stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    results.push(formatOrderRow(stmt.getAsObject()));
  }
  stmt.free();
  return results;
}

export async function getAllOrders({ search, status, sort } = {}) {
  const database = await getDb();
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = {};

  if (search && search.trim()) {
    query += ' AND (lower(id) LIKE :search OR lower(user_email) LIKE :search OR lower(tracking_number) LIKE :search OR lower(shipping_details_json) LIKE :search)';
    params[':search'] = `%${search.trim().toLowerCase()}%`;
  }

  if (status && status !== 'all') {
    query += ' AND status = :status';
    params[':status'] = status;
  }

  query += ' ORDER BY created_at DESC';

  const stmt = database.prepare(query);
  stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    results.push(formatOrderRow(stmt.getAsObject()));
  }
  stmt.free();
  return results;
}

export async function updateOrderStatus(id, status, trackingInfo = {}, adminEmail = 'admin@gmail.com') {
  const database = await getDb();
  const existing = await getOrderById(id);
  if (!existing) throw new Error('Order not found.');

  // Validate lifecycle transitions
  const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid order status: ${status}`);
  }

  if (existing.status === 'Cancelled' && status !== 'Cancelled') {
    throw new Error('A cancelled order cannot be reactivated.');
  }

  const updates = ['status = ?'];
  const values = [status];

  if (trackingInfo.trackingNumber) {
    updates.push('tracking_number = ?');
    values.push(trackingInfo.trackingNumber);
  }
  if (trackingInfo.carrier) {
    updates.push('carrier = ?');
    values.push(trackingInfo.carrier);
  }
  if (trackingInfo.estimatedDelivery) {
    updates.push('estimated_delivery = ?');
    values.push(trackingInfo.estimatedDelivery);
  }

  values.push(id);
  database.run(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, values);
  saveDb();

  return await getOrderById(id);
}

export async function cancelOrder(id, { reason = 'Cancelled by administrator', restoreStock = true, adminEmail = 'admin@gmail.com' } = {}) {
  const database = await getDb();
  const order = await getOrderById(id);
  if (!order) throw new Error('Order not found.');

  if (order.status === 'Cancelled') {
    throw new Error('Order is already cancelled.');
  }

  // Restore inventory if requested
  if (restoreStock && Array.isArray(order.items)) {
    for (const it of order.items) {
      const prodId = it.product?.id || it.id || it.productId;
      const qty = parseInt(it.quantity, 10) || 1;
      if (prodId) {
        const prod = await getProductById(prodId);
        if (prod) {
          const oldStock = prod.stock;
          const newStock = oldStock + qty;
          database.run('UPDATE products SET stock = ? WHERE id = ?', [newStock, prodId]);
          database.run(
            `INSERT INTO inventory_logs (product_id, product_name, adjustment_type, quantity_change, old_stock, new_stock, reason, admin_email)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [prodId, prod.name, 'return', qty, oldStock, newStock, `Order #${id} Cancelled: ${reason}`, adminEmail]
          );
        }
      }
    }
  }

  const timestamp = new Date().toISOString();
  const newNotes = `${order.notes || ''}\n[${timestamp}] CANCELLED: ${reason} (by ${adminEmail})`.trim();

  database.run(
    'UPDATE orders SET status = ?, payment_status = ?, notes = ? WHERE id = ?',
    ['Cancelled', 'Refunded', newNotes, id]
  );
  saveDb();

  await addAuditLog({
    adminEmail,
    action: 'ORDER_CANCELLED',
    targetType: 'order',
    targetId: id,
    details: { reason, restoreStock }
  });

  return await getOrderById(id);
}

export async function updateOrderNotes(id, notes, adminEmail = 'admin@gmail.com') {
  const database = await getDb();
  database.run('UPDATE orders SET notes = ? WHERE id = ?', [notes, id]);
  saveDb();
  return await getOrderById(id);
}

export async function updateOrderPaymentStatus(id, paymentStatus, adminEmail = 'admin@gmail.com') {
  const database = await getDb();
  database.run('UPDATE orders SET payment_status = ? WHERE id = ?', [paymentStatus, id]);
  saveDb();
  return await getOrderById(id);
}

// -------------------------------------------------------------
// ADMIN OVERVIEW & ANALYTICS
// -------------------------------------------------------------

export async function getAdminAnalytics(timeRange = '30D') {
  const allOrders = await getAllOrders();
  const now = Date.now();

  let days = 30;
  if (timeRange === '7D') days = 7;
  else if (timeRange === '30D') days = 30;
  else if (timeRange === '90D') days = 90;
  else if (timeRange === '1Y') days = 365;
  else if (timeRange === 'ALL') days = 3650;

  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const filteredOrders = allOrders.filter(o => {
    const t = new Date(o.date || 0).getTime();
    return t >= cutoff;
  });

  const priorCutoff = cutoff - days * 24 * 60 * 60 * 1000;
  const priorOrders = allOrders.filter(o => {
    const t = new Date(o.date || 0).getTime();
    return t >= priorCutoff && t < cutoff;
  });

  let totalRevenue = 0;
  let priorRevenue = 0;
  let completedOrders = 0;
  let pendingOrders = 0;
  let cancelledOrders = 0;

  const categoryMap = {};
  const productMap = {};
  const paymentMethods = {};
  const statusCounts = {
    Pending: 0,
    Confirmed: 0,
    Processing: 0,
    Packed: 0,
    Shipped: 0,
    'Out for Delivery': 0,
    Delivered: 0,
    Cancelled: 0,
    Refunded: 0
  };

  const dailyMap = {};
  const timelineDays = Math.min(days, 30);
  for (let i = 0; i < timelineDays; i++) {
    const d = new Date(now - (timelineDays - 1 - i) * 86400 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = { date: key, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue: 0, orders: 0 };
  }

  for (const o of filteredOrders) {
    const total = parseFloat(o.summary?.total) || 0;
    const isCancelled = o.status === 'Cancelled';

    if (!isCancelled) {
      totalRevenue += total;
    }

    if (o.status === 'Delivered') completedOrders++;
    else if (isCancelled) cancelledOrders++;
    else pendingOrders++;

    if (statusCounts[o.status] !== undefined) {
      statusCounts[o.status]++;
    } else {
      statusCounts[o.status] = 1;
    }

    const payMethod = o.paymentMethod || 'Credit Card';
    paymentMethods[payMethod] = (paymentMethods[payMethod] || 0) + 1;

    const dateKey = (o.date || new Date().toISOString()).slice(0, 10);
    if (dailyMap[dateKey]) {
      if (!isCancelled) dailyMap[dateKey].revenue += total;
      dailyMap[dateKey].orders += 1;
    }

    if (Array.isArray(o.items)) {
      for (const item of o.items) {
        const pId = item.product?.id || item.id || 'unknown';
        const pName = item.product?.name || item.name || 'Hardware Unit';
        const pCat = item.product?.category || item.category || 'General';
        const qty = parseInt(item.quantity, 10) || 1;
        const pPrice = parseFloat(item.product?.price || item.price) || 0;
        const lineTotal = pPrice * qty;

        categoryMap[pCat] = (categoryMap[pCat] || 0) + lineTotal;

        if (!productMap[pId]) {
          productMap[pId] = {
            id: pId,
            name: pName,
            category: pCat,
            unitsSold: 0,
            revenue: 0,
            image: item.product?.images?.[0] || ''
          };
        }
        productMap[pId].unitsSold += qty;
        productMap[pId].revenue += lineTotal;
      }
    }
  }

  for (const o of priorOrders) {
    if (o.status !== 'Cancelled') {
      priorRevenue += parseFloat(o.summary?.total) || 0;
    }
  }

  const revenueGrowth = priorRevenue > 0
    ? Math.round(((totalRevenue - priorRevenue) / priorRevenue) * 100 * 10) / 10
    : (totalRevenue > 0 ? 100 : 0);

  const orderGrowth = priorOrders.length > 0
    ? Math.round(((filteredOrders.length - priorOrders.length) / priorOrders.length) * 100 * 10) / 10
    : (filteredOrders.length > 0 ? 100 : 0);

  const averageOrderValue = filteredOrders.length > 0 ? Math.round((totalRevenue / filteredOrders.length) * 100) / 100 : 0;
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  const timeline = Object.values(dailyMap);

  return {
    timeRange,
    hasData: filteredOrders.length > 0,
    totalRevenue,
    revenueGrowth,
    totalOrders: filteredOrders.length,
    orderGrowth,
    averageOrderValue,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    statusCounts,
    categoryMap,
    topProducts,
    paymentMethods,
    timeline
  };
}

export async function getAdminOverview() {
  const database = await getDb();
  const allOrders = await getAllOrders();
  const allProducts = await getAllProducts({ archived: 'all' });

  let totalRevenue = 0;
  let pendingOrders = 0;
  let completedOrders = 0;
  let cancelledOrders = 0;

  for (const o of allOrders) {
    const total = parseFloat(o.summary?.total) || 0;
    if (o.status !== 'Cancelled') {
      totalRevenue += total;
    }
    if (['Pending', 'Processing', 'In Transit', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.status)) {
      pendingOrders += 1;
    } else if (o.status === 'Delivered') {
      completedOrders += 1;
    } else if (o.status === 'Cancelled') {
      cancelledOrders += 1;
    }
  }

  const custStmt = database.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user' OR role = 'customer'");
  const totalCustomers = custStmt.step() ? custStmt.getAsObject().count : 0;
  custStmt.free();

  const totalProducts = allProducts.length;
  const lowStockCount = allProducts.filter(p => !p.isArchived && p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = allProducts.filter(p => !p.isArchived && p.stock === 0).length;

  const categoryMap = {};
  for (const p of allProducts) {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
  }

  const analytics30d = await getAdminAnalytics('30D');

  return {
    totalRevenue,
    totalOrders: allOrders.length,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalCustomers,
    totalProducts,
    lowStockCount,
    outOfStockCount,
    averageOrderValue: allOrders.length > 0 ? Math.round((totalRevenue / allOrders.length) * 100) / 100 : 0,
    recentOrders: allOrders.slice(0, 8),
    categoryMap,
    revenue: {
      total: totalRevenue,
      percentageGrowth: analytics30d.revenueGrowth
    },
    orders: {
      total: allOrders.length,
      growth: analytics30d.orderGrowth
    },
    customers: {
      total: totalCustomers,
      active: totalCustomers
    },
    inventory: {
      totalProducts,
      lowStockCount,
      outOfStockCount
    }
  };
}

// -------------------------------------------------------------
// GLOBAL SEARCH & SETTINGS & NOTIFICATIONS
// -------------------------------------------------------------

export async function globalAdminSearch(query) {
  if (!query || !query.trim()) {
    return { products: [], orders: [], customers: [], coupons: [], warranties: [] };
  }

  const database = await getDb();
  const q = `%${query.trim().toLowerCase()}%`;

  // 1. Products
  const pStmt = database.prepare(
    `SELECT * FROM products WHERE lower(name) LIKE :q OR lower(id) LIKE :q OR lower(sku) LIKE :q OR lower(serial_number) LIKE :q LIMIT 6`
  );
  pStmt.bind({ ':q': q });
  const products = [];
  while (pStmt.step()) {
    products.push(formatProductRow(pStmt.getAsObject()));
  }
  pStmt.free();

  // 2. Orders
  const oStmt = database.prepare(
    `SELECT * FROM orders WHERE lower(id) LIKE :q OR lower(user_email) LIKE :q OR lower(tracking_number) LIKE :q OR lower(shipping_details_json) LIKE :q LIMIT 6`
  );
  oStmt.bind({ ':q': q });
  const orders = [];
  while (oStmt.step()) {
    orders.push(formatOrderRow(oStmt.getAsObject()));
  }
  oStmt.free();

  // 3. Customers
  const uStmt = database.prepare(
    `SELECT id, name, email, role, status, phone, created_at FROM users WHERE lower(name) LIKE :q OR lower(email) LIKE :q OR lower(phone) LIKE :q LIMIT 6`
  );
  uStmt.bind({ ':q': q });
  const customers = [];
  while (uStmt.step()) {
    customers.push(uStmt.getAsObject());
  }
  uStmt.free();

  // 4. Coupons
  const cStmt = database.prepare(
    `SELECT * FROM coupons WHERE lower(code) LIKE :q LIMIT 5`
  );
  cStmt.bind({ ':q': q });
  const coupons = [];
  while (cStmt.step()) {
    coupons.push(cStmt.getAsObject());
  }
  cStmt.free();

  // 5. Warranties
  const wStmt = database.prepare(
    `SELECT * FROM warranties WHERE lower(serial_number) LIKE :q OR lower(customer_name) LIKE :q OR lower(customer_email) LIKE :q LIMIT 5`
  );
  wStmt.bind({ ':q': q });
  const warranties = [];
  while (wStmt.step()) {
    warranties.push(wStmt.getAsObject());
  }
  wStmt.free();

  return { products, orders, customers, coupons, warranties };
}

export async function getStoreSettings() {
  const database = await getDb();
  const stmt = database.prepare('SELECT key, value_json FROM store_settings');
  const settings = {};
  while (stmt.step()) {
    const row = stmt.getAsObject();
    try {
      settings[row.key] = JSON.parse(row.value_json);
    } catch (e) {
      settings[row.key] = row.value_json;
    }
  }
  stmt.free();
  return settings;
}

export async function updateStoreSettings(settingsMap, adminEmail = 'admin@gmail.com') {
  const database = await getDb();
  for (const [key, value] of Object.entries(settingsMap)) {
    const jsonStr = typeof value === 'string' ? value : JSON.stringify(value);
    database.run(
      `INSERT OR REPLACE INTO store_settings (key, value_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [key, jsonStr]
    );
  }
  saveDb();

  await addAuditLog({
    adminEmail,
    action: 'SETTINGS_UPDATED',
    targetType: 'system',
    targetId: 'store_settings',
    details: Object.keys(settingsMap)
  });

  return await getStoreSettings();
}

export async function getAdminNotifications() {
  const database = await getDb();
  const notifications = [];

  // 1. Low stock alerts from DB
  const lowStockProds = await getAllProducts({ archived: 'active' });
  for (const p of lowStockProds) {
    if (p.stock === 0) {
      notifications.push({
        id: `stock-out-${p.id}`,
        title: 'Out of Stock Alert',
        message: `${p.name} (${p.sku}) is currently completely out of stock.`,
        type: 'danger',
        created_at: new Date().toISOString(),
        link: '/admin/inventory'
      });
    } else if (p.stock <= 5) {
      notifications.push({
        id: `stock-low-${p.id}`,
        title: 'Low Stock Alert',
        message: `${p.name} only has ${p.stock} units remaining in inventory.`,
        type: 'warning',
        created_at: new Date().toISOString(),
        link: '/admin/inventory'
      });
    }
  }

  // 2. Pending reviews from DB
  const revStmt = database.prepare("SELECT * FROM reviews WHERE status = 'pending' ORDER BY created_at DESC LIMIT 5");
  while (revStmt.step()) {
    const rev = revStmt.getAsObject();
    notifications.push({
      id: `rev-${rev.id}`,
      title: 'Review Awaiting Moderation',
      message: `New ${rev.rating}-star review submitted by ${rev.user_name} for moderation.`,
      type: 'info',
      created_at: rev.created_at,
      link: '/admin/reviews'
    });
  }
  revStmt.free();

  // 3. Warranty claims
  const warStmt = database.prepare("SELECT * FROM warranties WHERE warranty_status LIKE '%Claim%' OR warranty_status LIKE '%Review%' ORDER BY registered_at DESC LIMIT 5");
  while (warStmt.step()) {
    const war = warStmt.getAsObject();
    notifications.push({
      id: `war-${war.id}`,
      title: 'Hardware Warranty Claim',
      message: `Warranty claim registered for serial ${war.serial_number} (${war.product_name}).`,
      type: 'warning',
      created_at: war.registered_at,
      link: '/admin/warranty'
    });
  }
  warStmt.free();

  return notifications;
}
