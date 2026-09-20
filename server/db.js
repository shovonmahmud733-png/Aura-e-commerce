import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, '..', 'database.sqlite');

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

  return db;
}

export function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

// Helper query functions
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
  // Delete previous OTPs for this email
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

    // Code is valid: remove used OTP
    database.run('DELETE FROM otps WHERE lower(email) = lower(?)', [email.trim()]);
    // Mark user verified
    database.run('UPDATE users SET is_verified = 1 WHERE lower(email) = lower(?)', [email.trim()]);
    saveDb();

    return { valid: true };
  }
  stmt.free();
  return { valid: false, reason: 'No active verification code found for this email.' };
}
