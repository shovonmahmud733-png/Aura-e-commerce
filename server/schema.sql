-- Aura Universal Commerce - PostgreSQL Cloud Schema (Supabase / Neon)
-- Run this script in the Supabase SQL editor or Neon console to create cloud persistence.

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'customer',
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  rating NUMERIC(3, 2) DEFAULT 4.9,
  reviews_count INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 15,
  badge VARCHAR(50),
  tagline TEXT,
  description TEXT,
  images JSONB NOT NULL,
  colors JSONB,
  specs JSONB,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders Table (With DHL Express Tracking & Serial Numbers)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255) NOT NULL,
  invoice_number VARCHAR(100) NOT NULL,
  tracking_number VARCHAR(100) NOT NULL,
  carrier VARCHAR(100) DEFAULT 'DHL Express Worldwide',
  status VARCHAR(50) DEFAULT 'In Transit',
  total_amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  delivery_method VARCHAR(100),
  payment_method VARCHAR(100),
  card_last4 VARCHAR(4),
  items JSONB NOT NULL,
  shipping_details JSONB NOT NULL,
  tracking_timeline JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Warranties & Serial Numbers Registry
CREATE TABLE IF NOT EXISTS warranties (
  serial_number VARCHAR(100) PRIMARY KEY,
  order_id VARCHAR(100) REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(50) REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  owner_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Active (2-Year Global Protection)',
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '2 years')
);

-- 5. Product Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial products (if empty)
INSERT INTO products (id, name, category, price, original_price, rating, reviews_count, stock, badge, tagline, description, images, colors, specs, features)
VALUES 
(
  'prod-1',
  'Aura Studio Wireless Over-Ear Headphones',
  'audio',
  349.00,
  399.00,
  4.9,
  142,
  14,
  'Best Seller',
  'Titanium acoustic chambers with active adaptive cancellation.',
  'Engineered for acoustic purity, Aura Studio combines 40mm custom beryllium drivers with aerospace titanium chassis and active noise cancellation.',
  '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80"]'::jsonb,
  '[{"name":"Matte Obsidian","hex":"#18181b"},{"name":"Titanium Silver","hex":"#cbd5e1"},{"name":"Champagne Gold","hex":"#d4af37"}]'::jsonb,
  '{"Driver":"40mm Custom Beryllium","Frequency Response":"10Hz - 45,000Hz","Battery Life":"45 Hours (ANC On)","Connectivity":"Bluetooth 5.3 / USB-C Lossless"}'::jsonb,
  '["Hybrid Active Noise Cancellation with Transparency Mode","Multipoint Bluetooth 5.3 Audio Switching","Ultra-plush magnetic memory foam ear cushions"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
