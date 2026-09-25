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
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Initialize schema
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_verified INTEGER DEFAULT 1,
      role TEXT DEFAULT 'customer',
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
      estimated_delivery TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed demo user if missing
  const demoStmt = db.prepare('SELECT * FROM users WHERE email = :email');
  demoStmt.bind({ ':email': 'alex@auracommerce.io' });
  
  if (!demoStmt.step()) {
    const hashed = bcrypt.hashSync('Demo1234!', 10);
    db.run(
      'INSERT INTO users (name, email, password_hash, is_verified, role) VALUES (?, ?, ?, 1, ?)',
      ['Alex Vance', 'alex@auracommerce.io', hashed, 'customer']
    );
    saveDb();
    console.log('[SQLite] Demo user seeded: alex@auracommerce.io');
  }
  demoStmt.free();

  // Seed products if table is empty
  const prodCheck = db.prepare('SELECT COUNT(*) as count FROM products');
  if (prodCheck.step()) {
    const row = prodCheck.getAsObject();
    if (row.count === 0 && Array.isArray(PRODUCTS) && PRODUCTS.length > 0) {
      for (const p of PRODUCTS) {
        db.run(
          `INSERT INTO products (
            id, name, category, price, original_price, rating, reviews_count, stock, badge, tagline, description,
            features_json, specs_json, images_json, colors_json, reviews_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id,
            p.name,
            p.category,
            p.price,
            p.originalPrice || null,
            p.rating || 5.0,
            p.reviewsCount || 0,
            p.stock || 10,
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
      saveDb();
      console.log(`[SQLite] Seeded ${PRODUCTS.length} products into database.`);
    }
  }
  prodCheck.free();

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

// Helper query functions for Users
export async function findUserByEmail(email) {
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM users WHERE lower(email) = lower(:email)');
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
  const database = await getDb();
  const stmt = database.prepare('SELECT id, name, email, is_verified, role, created_at FROM users WHERE id = :id');
  stmt.bind({ ':id': id });
  
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

export async function insertUser({ name, email, password_hash, is_verified = 1 }) {
  const database = await getDb();
  database.run(
    'INSERT INTO users (name, email, password_hash, is_verified) VALUES (?, ?, ?, ?)',
    [name.trim(), email.trim().toLowerCase(), password_hash, is_verified]
  );
  saveDb();

  return await findUserByEmail(email);
}

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

// Formatters for Products & Orders
function formatProductRow(row) {
  if (!row) return null;
  return {
    id: row.id,
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
    estimatedDelivery: row.estimated_delivery,
    date: row.created_at
  };
}

// Helper query functions for Products
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

// Helper query functions for Orders
export async function createOrder(orderData) {
  const database = await getDb();
  const id = orderData.id || `AUR-${Math.floor(100000 + Math.random() * 900000)}`;
  const estimatedDelivery = orderData.estimatedDelivery || new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  database.run(
    `INSERT INTO orders (
      id, user_id, user_email, items_json, summary_json, shipping_details_json,
      delivery_method, payment_method, payment_last4, status, estimated_delivery
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      orderData.userId || null,
      (orderData.userEmail || '').toLowerCase(),
      JSON.stringify(orderData.items || []),
      JSON.stringify(orderData.summary || {}),
      JSON.stringify(orderData.shippingDetails || {}),
      orderData.deliveryMethod || 'Standard Delivery',
      orderData.paymentMethod || 'Credit Card',
      orderData.paymentLast4 || '4242',
      orderData.status || 'Processing',
      estimatedDelivery
    ]
  );
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
