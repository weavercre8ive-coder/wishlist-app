import { NextRequest } from "next/server";
import {
  getCustomerByEmail,
  createCustomer,
  addToWishlist,
  getWishlistByCustomerId,
  upsertAbandonedTracking,
} from "@/lib/db";
import {
  generateToken,
  successResponse,
  errorResponse,
  createTokenCookie,
} from "@/lib/auth-helpers";
import { findOrCreateShopifyCustomer } from "@/lib/shopify-admin";
import { MESSAGES } from "@/lib/constants";

// ============================================
// POST /api/wishlist/guest
// Guest user - email দিয়ে wishlist add করবে
// ============================================
export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Parse body
    const body = await request.json();
    const {
      email,
      name,
      productId,
      productTitle,
      productImageUrl,
      productPrice,
      productUrl,
      variantId,
      pendingItems, // Array of products saved before email submit
    } = body;

    // 2️⃣ Validate
    if (!email) {
      return errorResponse(MESSAGES.EMAIL_REQUIRED, 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    // 3️⃣ Find or create customer in our DB
    let customer = await getCustomerByEmail(cleanEmail);
    let isNewCustomer = false;

    if (!customer) {
      isNewCustomer = true;

      // Create/find in Shopify first
      const shopifyResult = await findOrCreateShopifyCustomer(
        cleanEmail,
        name
      );
      const shopifyCustomerId =
        shopifyResult?.customer?.id?.toString() || undefined;

      // Create in our DB
      customer = await createCustomer({
        email: cleanEmail,
        name: name?.trim() || undefined,
        shopifyCustomerId,
        isGuest: true,
      });
    }

    // 4️⃣ Add current product to wishlist
    if (productId) {
      await addToWishlist({
        customerId: customer.id,
        productId,
        productTitle,
        productImageUrl,
        productPrice,
        productUrl,
        variantId,
      });
    }

    // 5️⃣ Add any pending items (saved before email was submitted)
    if (pendingItems && Array.isArray(pendingItems)) {
      for (const item of pendingItems) {
        if (item.productId) {
          await addToWishlist({
            customerId: customer.id,
            productId: item.productId,
            productTitle: item.productTitle,
            productImageUrl: item.productImageUrl,
            productPrice: item.productPrice,
            productUrl: item.productUrl,
            variantId: item.variantId,
          });
        }
      }
    }

    // 6️⃣ Update abandoned tracking
    await upsertAbandonedTracking(customer.id);

    // 7️⃣ Generate token
    const token = await generateToken({
      customerId: customer.id,
      email: customer.email,
      isGuest: customer.is_guest,
      shopifyCustomerId: customer.shopify_customer_id || undefined,
    });

    // 8️⃣ Get updated wishlist
    const wishlistItems = await getWishlistByCustomerId(customer.id);

    // 9️⃣ Return with cookie
    const response = successResponse({
      customerId: customer.id,
      email: customer.email,
      token,
      isGuest: customer.is_guest,
      isNewCustomer,
      items: wishlistItems,
      count: wishlistItems.length,
      message: MESSAGES.WISHLIST_ADDED,
    });

    // Set cookie on response
    const headers = new Headers(response.headers);
    headers.append("Set-Cookie", createTokenCookie(token));

    return new Response(response.body, {
      status: response.status,
      headers,
    });

  } catch (error) {
    console.error("❌ Guest wishlist error:", error);
    return errorResponse(MESSAGES.DB_ERROR, 500);
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}