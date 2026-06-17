-- ============================================
-- MIGRATION 003 — ADD ALL INDEXES
-- Run AFTER 002_create_wishlist.sql
-- ============================================

-- ----------------------------------------
-- CUSTOMERS indexes
-- ----------------------------------------
CREATE INDEX IF NOT EXISTS idx_customers_email
  ON customers(email);

CREATE INDEX IF NOT EXISTS idx_customers_shopify_id
  ON customers(shopify_customer_id);

CREATE INDEX IF NOT EXISTS idx_customers_is_guest
  ON customers(is_guest);

CREATE INDEX IF NOT EXISTS idx_customers_created_at
  ON customers(created_at);

-- ----------------------------------------
-- WISHLIST_ITEMS indexes
-- ----------------------------------------
CREATE INDEX IF NOT EXISTS idx_wishlist_customer_id
  ON wishlist_items(customer_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_product_id
  ON wishlist_items(product_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_ordered
  ON wishlist_items(ordered);

CREATE INDEX IF NOT EXISTS idx_wishlist_added_at
  ON wishlist_items(added_at);

-- Composite index for fast lookup
CREATE INDEX IF NOT EXISTS idx_wishlist_customer_product
  ON wishlist_items(customer_id, product_id);

-- ----------------------------------------
-- ABANDONED_TRACKING indexes
-- ----------------------------------------
CREATE INDEX IF NOT EXISTS idx_abandoned_customer_id
  ON abandoned_tracking(customer_id);

CREATE INDEX IF NOT EXISTS idx_abandoned_last_added
  ON abandoned_tracking(last_added_at);

CREATE INDEX IF NOT EXISTS idx_abandoned_24h_sent
  ON abandoned_tracking(email_24h_sent);

CREATE INDEX IF NOT EXISTS idx_abandoned_48h_sent
  ON abandoned_tracking(email_48h_sent);

CREATE INDEX IF NOT EXISTS idx_abandoned_converted
  ON abandoned_tracking(converted);

-- Composite — find pending emails fast
CREATE INDEX IF NOT EXISTS idx_abandoned_pending
  ON abandoned_tracking(converted, email_24h_sent, last_added_at);

-- ----------------------------------------
-- EMAIL_LOGS indexes
-- ----------------------------------------
CREATE INDEX IF NOT EXISTS idx_email_logs_customer_id
  ON email_logs(customer_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at
  ON email_logs(sent_at);

CREATE INDEX IF NOT EXISTS idx_email_logs_type
  ON email_logs(email_type);

-- ============================================
-- VERIFY — Show all created indexes
-- ============================================
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;