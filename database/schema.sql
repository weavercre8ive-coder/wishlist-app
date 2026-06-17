-- ============================================
-- WISHLIST APP - FULL DATABASE SCHEMA
-- Run this in Neon SQL Editor
-- ============================================

-- 1️⃣ CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  shopify_customer_id VARCHAR(255) UNIQUE,
  is_guest BOOLEAN DEFAULT TRUE,
  token VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email 
  ON customers(email);

CREATE INDEX IF NOT EXISTS idx_customers_shopify_id 
  ON customers(shopify_customer_id);


-- 2️⃣ WISHLIST ITEMS TABLE
CREATE TABLE IF NOT EXISTS wishlist_items (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL 
    REFERENCES customers(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  product_title VARCHAR(500),
  product_image_url TEXT,
  product_price DECIMAL(10, 2),
  product_url TEXT,
  variant_id VARCHAR(255),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ordered BOOLEAN DEFAULT FALSE,
  ordered_at TIMESTAMP,

  -- No duplicate product per customer
  UNIQUE(customer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_customer 
  ON wishlist_items(customer_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_product 
  ON wishlist_items(product_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_ordered 
  ON wishlist_items(ordered);

CREATE INDEX IF NOT EXISTS idx_wishlist_added_at 
  ON wishlist_items(added_at);


-- 3️⃣ EMAIL LOGS TABLE
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL 
    REFERENCES customers(id) ON DELETE CASCADE,
  email_type VARCHAR(50) DEFAULT 'abandoned_wishlist',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP,
  flow_triggered BOOLEAN DEFAULT FALSE,
  flow_triggered_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_logs_customer 
  ON email_logs(customer_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at 
  ON email_logs(sent_at);


-- 4️⃣ ABANDONED WISHLIST TRACKING TABLE
CREATE TABLE IF NOT EXISTS abandoned_tracking (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL 
    REFERENCES customers(id) ON DELETE CASCADE,
  last_added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email_24h_sent BOOLEAN DEFAULT FALSE,
  email_24h_sent_at TIMESTAMP,
  email_48h_sent BOOLEAN DEFAULT FALSE,
  email_48h_sent_at TIMESTAMP,
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMP,

  UNIQUE(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_abandoned_customer 
  ON abandoned_tracking(customer_id);

CREATE INDEX IF NOT EXISTS idx_abandoned_last_added 
  ON abandoned_tracking(last_added_at);

CREATE INDEX IF NOT EXISTS idx_abandoned_24h 
  ON abandoned_tracking(email_24h_sent);


-- ============================================
-- HELPER FUNCTION: auto update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();