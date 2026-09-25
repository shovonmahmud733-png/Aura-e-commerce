import app from '../server/index.js';
import { getDb } from '../server/db.js';

export default async function handler(req, res) {
  try {
    await getDb();
    return app(req, res);
  } catch (err) {
    console.error('[Vercel Serverless API Error]:', err);
    return res.status(500).json({ error: 'Server initialization error', details: err.message });
  }
}
