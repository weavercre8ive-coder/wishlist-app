import { neon, neonConfig } from "@neondatabase/serverless";

// Enable connection pooling for serverless
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not defined in environment variables");
}

// Create SQL query function
const sql = neon(process.env.DATABASE_URL);

export default sql;

// ============================================
// CUSTOMER QUERIES
// ============================================

export async function getCustomerByEmail(email: string) {
  const result = await sql`
    SELECT * FROM customers 
    WHERE email = ${email} 
    LIMIT 1
  `;
  return result[0] || null;
}

export async function getCustomerById(id: number) {
  const result = await sql`
    SELECT * FROM customers 
    WHERE id = ${id} 
    LIMIT 1
  `;
  return result[0] || null;
}

export async function getCustomerByShopifyId(shopifyId: string) {
  const result = await sql`
    SELECT * FROM customers 
    WHERE shopify_customer_id = ${shopifyId} 
    LIMIT 1
  `;
  return result[0] || null;
}

export async function createCustomer({
  email,
  name,
  shopifyCustomerId,
  isGuest = true,
  token,
}: {
  email: string;
  name?: string;
  shopifyCustomerId?: string;
  isGuest?: boolean;
  token?: string;
}) {
  const result = await sql`
    INSERT INTO customers (email, name, shopify_customer_id, is_guest, token)
    VALUES (
      ${email}, 
      ${name || null}, 
      ${shopifyCustomerId || null}, 
      ${isGuest},
      ${token || null}
    )
    ON CONFLICT (email) 
    DO UPDATE SET
      name = COALESCE(EXCLUDED.name, customers.name),
      shopify_customer_id = COALESCE(EXCLUDED.shopify_customer_id, customers.shopify_customer_id),
      is_guest = EXCLUDED.is_guest,
      token = COALESCE(EXCLUDED.token, customers.token),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return result[0];
}

export async function updateCustomerToken(id: number, token: string) {
  const result = await sql`
    UPDATE customers 
    SET token = ${token}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

// ============================================
// WISHLIST QUERIES
// ============================================

export async function getWishlistByCustomerId(customerId: number) {
  const result = await sql`
    SELECT * FROM wishlist_items
    WHERE customer_id = ${customerId}
    ORDER BY added_at DESC
  `;
  return result;
}

export async function getWishlistCount(customerId: number) {
  const result = await sql`
    SELECT COUNT(*) as count 
    FROM wishlist_items
    WHERE customer_id = ${customerId}
  `;
  return parseInt(result[0].count as string);
}

export async function addToWishlist({
  customerId,
  productId,
  productTitle,
  productImageUrl,
  productPrice,
  productUrl,
  variantId,
}: {
  customerId: number;
  productId: string;
  productTitle?: string;
  productImageUrl?: string;
  productPrice?: number;
  productUrl?: string;
  variantId?: string;
}) {
  const result = await sql`
    INSERT INTO wishlist_items (
      customer_id, 
      product_id, 
      product_title, 
      product_image_url,
      product_price,
      product_url,
      variant_id
    )
    VALUES (
      ${customerId},
      ${productId},
      ${productTitle || null},
      ${productImageUrl || null},
      ${productPrice || null},
      ${productUrl || null},
      ${variantId || null}
    )
    ON CONFLICT (customer_id, product_id) 
    DO NOTHING
    RETURNING *
  `;
  return result[0] || null;
}

export async function removeFromWishlist(customerId: number, productId: string) {
  const result = await sql`
    DELETE FROM wishlist_items
    WHERE customer_id = ${customerId}
    AND product_id = ${productId}
    RETURNING *
  `;
  return result[0] || null;
}

export async function isProductInWishlist(
  customerId: number,
  productId: string
) {
  const result = await sql`
    SELECT id FROM wishlist_items
    WHERE customer_id = ${customerId}
    AND product_id = ${productId}
    LIMIT 1
  `;
  return result.length > 0;
}

export async function markWishlistItemOrdered(
  customerId: number,
  productId: string
) {
  const result = await sql`
    UPDATE wishlist_items
    SET ordered = TRUE, ordered_at = CURRENT_TIMESTAMP
    WHERE customer_id = ${customerId}
    AND product_id = ${productId}
    RETURNING *
  `;
  return result[0] || null;
}

// ============================================
// ABANDONED TRACKING QUERIES
// ============================================

export async function upsertAbandonedTracking(customerId: number) {
  const result = await sql`
    INSERT INTO abandoned_tracking (customer_id, last_added_at)
    VALUES (${customerId}, CURRENT_TIMESTAMP)
    ON CONFLICT (customer_id)
    DO UPDATE SET
      last_added_at = CURRENT_TIMESTAMP,
      converted = FALSE
    RETURNING *
  `;
  return result[0];
}

export async function getPendingAbandonedEmails(delayHours: number) {
  const result = await sql`
    SELECT 
      at.*,
      c.email,
      c.name,
      c.shopify_customer_id
    FROM abandoned_tracking at
    JOIN customers c ON c.id = at.customer_id
    WHERE at.converted = FALSE
    AND at.last_added_at <= NOW() - INTERVAL '${delayHours} hours'
    AND (
      (${delayHours} = 24 AND at.email_24h_sent = FALSE)
      OR
      (${delayHours} = 48 AND at.email_48h_sent = FALSE)
    )
  `;
  return result;
}

export async function markEmailSent(customerId: number, delayHours: number) {
  if (delayHours === 24) {
    await sql`
      UPDATE abandoned_tracking
      SET email_24h_sent = TRUE, email_24h_sent_at = CURRENT_TIMESTAMP
      WHERE customer_id = ${customerId}
    `;
  } else if (delayHours === 48) {
    await sql`
      UPDATE abandoned_tracking
      SET email_48h_sent = TRUE, email_48h_sent_at = CURRENT_TIMESTAMP
      WHERE customer_id = ${customerId}
    `;
  }
}

export async function markCustomerConverted(customerId: number) {
  await sql`
    UPDATE abandoned_tracking
    SET converted = TRUE, converted_at = CURRENT_TIMESTAMP
    WHERE customer_id = ${customerId}
  `;
}

// ============================================
// EMAIL LOG QUERIES
// ============================================

export async function logEmailSent(
  customerId: number,
  emailType: string = "abandoned_wishlist"
) {
  const result = await sql`
    INSERT INTO email_logs (customer_id, email_type, flow_triggered, flow_triggered_at)
    VALUES (${customerId}, ${emailType}, TRUE, CURRENT_TIMESTAMP)
    RETURNING *
  `;
  return result[0];
}