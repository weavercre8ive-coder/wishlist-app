-- ============================================
-- MIGRATION 002 — CREATE WISHLIST TABLES
-- Run AFTER 001_create_customers.sql
-- ============================================

-- Wishlist Items Table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id                  SERIAL PRIMARY KEY,
  customer_id         INTEGER NOT NULL
                        REFERENCES customers(id)
                        ON DELETE CASCADE,
  product_id          VARCHAR(255) NOT NULL,
  product_title       VARCHAR(500),
  product_image_url   TEXT,
  product_price       DECIMAL(10, 2),
  product_url         TEXT,
  variant_id          VARCHAR(255),
  added_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ordered             BOOLEAN DEFAULT FALSE,
  ordered_at          TIMESTAMP,

  -- Prevent duplicate products per customer
  UNIQUE(customer_id, product_id)
);

COMMENT ON TABLE wishlist_items IS
  'Stores each product a customer has wishlisted';

COMMENT ON COLUMN wishlist_items.ordered IS
  'TRUE when customer has purchased this product';

-- ============================================
-- Abandoned Tracking Table
-- ============================================
CREATE TABLE IF NOT EXISTS abandoned_tracking (
  id                  SERIAL PRIMARY KEY,
  customer_id         INTEGER NOT NULL
                        REFERENCES customers(id)
                        ON DELETE CASCADE,
  last_added_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email_24h_sent      BOOLEAN DEFAULT FALSE,
  email_24h_sent_at   TIMESTAMP,
  email_48h_sent      BOOLEAN DEFAULT FALSE,
  email_48h_sent_at   TIMESTAMP,
  converted           BOOLEAN DEFAULT FALSE,
  converted_at        TIMESTAMP,

  -- One record per customer
  UNIQUE(customer_id)
);

COMMENT ON TABLE abandoned_tracking IS
  'Tracks abandoned wishlist email sending status per customer';

-- ============================================
-- Email Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS email_logs (
  id                  SERIAL PRIMARY KEY,
  customer_id         INTEGER NOT NULL
                        REFERENCES customers(id)
                        ON DELETE CASCADE,
  email_type          VARCHAR(50) DEFAULT 'abandoned_wishlist',
  sent_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  opened              BOOLEAN DEFAULT FALSE,
  opened_at           TIMESTAMP,
  clicked             BOOLEAN DEFAULT FALSE,
  clicked_at          TIMESTAMP,
  flow_triggered      BOOLEAN DEFAULT FALSE,
  flow_triggered_at   TIMESTAMP
);

COMMENT ON TABLE email_logs IS
  'Logs every email sent for tracking and analytics';