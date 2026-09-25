/**
 * Aura Commerce - Cloud Database Connection Adapter
 * Pluggable support for PostgreSQL (Supabase / Neon / AWS RDS)
 * 
 * To activate Cloud Database:
 * 1. Create a free project at https://supabase.com or https://neon.tech
 * 2. Execute server/schema.sql in the SQL Editor
 * 3. Add DATABASE_URL="postgresql://user:password@host:port/database" to your .env or Vercel Environment Variables
 */

let pool = null;

export async function getCloudDb() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    return null; // Signals fallback to local SQLite
  }

  if (pool) return pool;

  try {
    // Dynamic import for pg only if DATABASE_URL is configured
    const { default: pg } = await import('pg');
    pool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    console.log('[Cloud DB] Connected to PostgreSQL instance successfully.');
    return pool;
  } catch (err) {
    console.warn('[Cloud DB] PostgreSQL connection error, falling back to SQLite:', err.message);
    return null;
  }
}

export async function queryCloudDb(sql, params = []) {
  const db = await getCloudDb();
  if (!db) return null;
  const result = await db.query(sql, params);
  return result.rows;
}
