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
      status TEXT DEFAULT 'Processing',
      carrier TEXT DEFAULT 'DHL Express Worldwide',
      tracking_number TEXT,
      estimated_delivery TEXT,
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
  try { db.run("ALTER TABLE orders ADD COLUMN carrier TEXT DEFAULT 'DHL Express Worldwide'"); } catch (e) {}
  try { db.run("ALTER TABLE orders ADD COLUMN tracking_number TEXT"); } catch (e) {}

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
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@auracommerce.io').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';
  const adminName = process.env.ADMIN_NAME || 'Aura System Admin';

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
    // Ensure existing admin user has admin role
    db.run('UPDATE users SET role = ? WHERE lower(email) = lower(?)', ['admin', adminEmail]);
  }
  adminStmt.free();

  // 3. Seed Products
  if (Array.isArray(PRODUCTS) && PRODUCTS.length > 0) {
    for (const p of PRODUCTS) {
      db.run(
        `INSERT OR REPLACE INTO products (
          id, serial_number, name, category, price, original_price, rating, reviews_count, stock, badge, tagline, description,
          features_json, specs_json, images_json, colors_json, reviews_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.serialNumber || `AUR-HW-${p.id.replace('prod-', '8')}-X`,
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

export async function addAuditLog({ adminId = null, adminEmail = 'admin@auracommerce.io', action, targetType, targetId = '', details = {}, ipAddress = '' }) {
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
    reviews: row.reviews_json ? JSON.parse(row.reviews_json) : []
  };
}

export async function getAllProducts({ category, search, sort } = {}) {
  const database = await getDb();
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = {};

  if (category && category !== 'all') {
    query += ' AND category = :category';
    params[':category'] = category;
  }

  if (search && search.trim()) {
    query += ' AND (lower(name) LIKE :search OR lower(description) LIKE :search OR lower(tagline) LIKE :search)';
    params[':search'] = `%${search.trim().toLowerCase()}%`;
  }

  if (sort === 'price-asc') {
    query += ' ORDER BY price ASC';
  } else if (sort === 'price-desc') {
    query += ' ORDER BY price DESC';
  } else if (sort === 'rating') {
    query += ' ORDER BY rating DESC';
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

  database.run(
    `INSERT INTO products (
      id, serial_number, name, category, price, original_price, rating, reviews_count, stock, badge, tagline, description,
      features_json, specs_json, images_json, colors_json, reviews_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      serial,
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
      JSON.stringify(productData.reviews || [])
    ]
  );
  saveDb();

  return await getProductById(id);
}

export async function updateProduct(id, productData) {
  const database = await getDb();
  database.run(
    `UPDATE products SET
      name = ?, category = ?, price = ?, original_price = ?, stock = ?, badge = ?, tagline = ?, description = ?,
      features_json = ?, specs_json = ?, images_json = ?, colors_json = ?, serial_number = ?
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
      id
    ]
  );
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
    status: row.status,
    carrier: row.carrier || 'DHL Express Worldwide',
    trackingNumber: row.tracking_number || 'DHL-AUR-84920412',
    estimatedDelivery: row.estimated_delivery,
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
      delivery_method, payment_method, payment_last4, status, carrier, tracking_number, estimated_delivery
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      orderData.status || 'Processing',
      orderData.carrier || 'DHL Express Worldwide',
      trackingNumber,
      estimatedDelivery
    ]
  );

  // Register warranties for purchased serialized hardware
  if (Array.isArray(orderData.items)) {
    const customerName = orderData.shippingDetails ? `${orderData.shippingDetails.firstName || ''} ${orderData.shippingDetails.lastName || ''}`.trim() : 'Customer';
    const expiry = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString();

    for (const it of orderData.items) {
      const serial = it.serialNumber || (it.product?.serialNumber) || `AUR-HW-${Math.floor(1000 + Math.random() * 9000)}-${id.slice(-4)}`;
      try {
        database.run(
          `INSERT OR REPLACE INTO warranties (serial_number, product_id, product_name, order_id, customer_name, customer_email, warranty_status, expiry_date)
           VALUES (?, ?, ?, ?, ?, ?, 'Active (2-Year Global Protection)', ?)`,
          [serial, it.product?.id || 'prod-custom', it.product?.name || 'Aura Hardware Unit', id, customerName, orderData.userEmail, expiry]
        );
      } catch (e) {}
    }
  }

  saveDb();
  return await getOrderById(id);
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
    query += ' AND (lower(id) LIKE :search OR lower(user_email) LIKE :search OR lower(tracking_number) LIKE :search)';
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

export async function updateOrderStatus(id, status, trackingInfo = {}) {
  const database = await getDb();
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

// -------------------------------------------------------------
// ADMIN OVERVIEW & ANALYTICS
// -------------------------------------------------------------

export async function getAdminOverview() {
  const database = await getDb();

  // 1. Total Orders & Revenue
  const allOrders = await getAllOrders();
  let totalRevenue = 0;
  let pendingOrders = 0;

  for (const o of allOrders) {
    const total = o.summary?.total || 0;
    totalRevenue += parseFloat(total) || 0;
    if (['Pending', 'Processing', 'In Transit'].includes(o.status)) {
      pendingOrders += 1;
    }
  }

  // 2. Total Customers
  const custStmt = database.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user' OR role = 'customer'");
  const totalCustomers = custStmt.step() ? custStmt.getAsObject().count : 0;
  custStmt.free();

  // 3. Total Products & Low Stock
  const allProducts = await getAllProducts();
  const totalProducts = allProducts.length;
  const lowStockCount = allProducts.filter(p => p.stock <= 5).length;

  // 4. Category Breakdown
  const categoryMap = {};
  for (const p of allProducts) {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
  }

  return {
    totalRevenue,
    totalOrders: allOrders.length,
    pendingOrders,
    totalCustomers,
    totalProducts,
    lowStockCount,
    recentOrders: allOrders.slice(0, 8),
    categoryMap
  };
}
