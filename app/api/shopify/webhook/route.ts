import { NextRequest } from "next/server";
import crypto from "crypto";
import {
  getCustomerByEmail,
  markWishlistItemOrdered,
  markCustomerConverted,
} from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/auth-helpers";
import { ShopifyOrder } from "@/types/product";

// ============================================
// Verify Shopify webhook signature
// ============================================
function verifyShopifyWebhook(
  body: string,
  hmacHeader: string
): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return false;

  const hash = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(hmacHeader)
  );
}

// ============================================
// POST /api/shopify/webhook
// Shopify order created webhook
// Order হলে wishlist items mark as ordered
// ============================================
export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Get raw body for signature verification
    const rawBody = await request.text();
    const hmacHeader =
      request.headers.get("X-Shopify-Hmac-Sha256") || "";
    const topic =
      request.headers.get("X-Shopify-Topic") || "";

    // 2️⃣ Verify webhook authenticity
    const isValid = verifyShopifyWebhook(rawBody, hmacHeader);
    if (!isValid) {
      console.error("❌ Invalid webhook signature");
      return errorResponse("Unauthorized webhook", 401);
    }

    // 3️⃣ Parse order data
    const order: ShopifyOrder = JSON.parse(rawBody);
    console.log(`📦 Webhook received: ${topic} - Order #${order.id}`);

    // 4️⃣ Handle order creation
    if (
      topic === "orders/create" ||
      topic === "orders/paid"
    ) {
      const customerEmail = order.email || order.customer?.email;

      if (!customerEmail) {
        return successResponse({ message: "No customer email in order" });
      }

      // 5️⃣ Find customer in our DB
      const customer = await getCustomerByEmail(
        customerEmail.toLowerCase()
      );

      if (!customer) {
        return successResponse({
          message: "Customer not in wishlist system",
        });
      }

      // 6️⃣ Get ordered product IDs
      const orderedProductIds = order.line_items.map((item) =>
        item.product_id.toString()
      );

      // 7️⃣ Mark wishlist items as ordered
      for (const productId of orderedProductIds) {
        await markWishlistItemOrdered(customer.id, productId);
      }

      // 8️⃣ Mark customer as converted
      await markCustomerConverted(customer.id);

      console.log(
        `✅ Marked ${orderedProductIds.length} items as ordered for: ${customerEmail}`
      );

      return successResponse({
        message: "Order processed successfully",
        orderedItems: orderedProductIds.length,
      });
    }

    // Other webhook topics
    return successResponse({ message: `Webhook ${topic} received` });

  } catch (error) {
    console.error("❌ Webhook error:", error);
    return errorResponse("Webhook processing failed", 500);
  }
}

// ============================================
// OPTIONS — CORS preflight
// ============================================
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Hmac-Sha256",
    },
  });
}