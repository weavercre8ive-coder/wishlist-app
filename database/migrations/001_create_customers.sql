-- ============================================
-- MIGRATION 001 — CREATE CUSTOMERS TABLE
-- Run this first in Neon SQL Editor
-- ============================================

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id                  SERIAL PRIMARY KEY,
  email               VARCHAR(255) UNIQUE NOT NULL,
  name                VARCHAR(255),
  shopify_customer_id VARCHAR(255) UNIQUE,
  is_guest            BOOLEAN DEFAULT TRUE,
  token               VARCHAR(500),
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments
COMMENT ON TABLE customers IS
  'Stores all wishlist users — guest and logged-in';

COMMENT ON COLUMN customers.email IS
  'Primary identifier for all users';

COMMENT ON COLUMN customers.shopify_customer_id IS
  'Linked Shopify customer ID — null for pure guests';

COMMENT ON COLUMN customers.is_guest IS
  'TRUE = guest (email only), FALSE = full Shopify customer';

COMMENT ON COLUMN customers.token IS
  'Latest JWT token for session tracking';

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();