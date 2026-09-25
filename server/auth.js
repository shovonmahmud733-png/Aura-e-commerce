import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  findUserByEmail, 
  findUserById, 
  insertUser, 
  saveOtpRecord, 
  verifyOtpRecord 
} from './db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aura-commerce-ultra-secure-jwt-secret-key-2026';

// Helper to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    // Check if user already exists in SQLite
    const existing = await findUserByEmail(email);
    if (existing) {
      const isMatch = await bcrypt.compare(password, existing.password_hash);
      if (isMatch) {
        const token = generateToken(existing);
        return res.status(200).json({
          success: true,
          message: 'Account verified. Welcome back!',
          token,
          user: {
            id: existing.id,
            name: existing.name,
            email: existing.email,
            role: existing.role,
            is_verified: existing.is_verified,
            created_at: existing.created_at
          }
        });
      }
      return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
    }

    // Hash password with bcrypt
    const password_hash = await bcrypt.hash(password, 10);

    // Create user in SQLite database (OTP is NOT mandatory -> is_verified = 1 directly)
    const newUser = await insertUser({
      name,
      email,
      password_hash,
      is_verified: 1
    });

    // Generate JWT token for instant access
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account successfully created and saved to database.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        is_verified: newUser.is_verified,
        created_at: newUser.created_at
      }
    });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user in SQLite
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
});

// GET /api/auth/me (Validate JWT Token & Retrieve Profile)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Token is invalid or expired.' });
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found in database.' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('[Auth Me Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  return res.json({
    success: true,
    message: 'If an account matches that email, password recovery instructions have been dispatched.'
  });
});

export default router;
