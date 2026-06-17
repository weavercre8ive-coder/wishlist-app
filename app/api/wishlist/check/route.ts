import { NextRequest } from "next/server";
import {
  isProductInWishlist,
  getWishlistCount,
} from "@/lib/db";
import {
  getSessionFromRequest,
  successResponse,
  errorResponse,
} from "@/lib/auth-helpers";
import { MESSAGES } from "@/lib/constants";

// ============================================
// GET /api/wishlist/check?productId=xxx
// Check if a product is in customer's wishlist
// Heart icon filled/unfilled decide করতে
// ============================================
export async function GET(request: NextRequest) {
  try {
    // 1️⃣ Get productId from query params
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return errorResponse(MESSAGES.MISSING_FIELDS, 400);
    }

    // 2️⃣ Get session
    const session = await getSessionFromRequest(request);

    // If no session, product is not wishlisted
    if (!session) {
      return successResponse({
        isWishlisted: false,
        productId,
        count: 0,
      });
    }

    // 3️⃣ Check DB
    const isWishlisted = await isProductInWishlist(
      session.customerId,
      productId
    );

    const count = await getWishlistCount(session.customerId);

    return successResponse({
      isWishlisted,
      productId,
      count,
    });

  } catch (error) {
    console.error("❌ Wishlist check error:", error);
    return errorResponse(MESSAGES.DB_ERROR, 500);
  }
}

// ============================================
// POST /api/wishlist/check
// Check multiple products at once
// Collection page এর জন্য
// ============================================
export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Get session
    const session = await getSessionFromRequest(request);

    if (!session) {
      return successResponse({
        wishlistedIds: [],
        count: 0,
      });
    }

    // 2️⃣ Parse body
    const body = await request.json();
    const { productIds } = body;

    if (!productIds || !Array.isArray(productIds)) {
      return errorResponse(MESSAGES.MISSING_FIELDS, 400);
    }

    // 3️⃣ Check each product
    const wishlistedIds: string[] = [];

    for (const productId of productIds) {
      const isWishlisted = await isProductInWishlist(
        session.customerId,
        productId
      );
      if (isWishlisted) {
        wishlistedIds.push(productId);
      }
    }

    const count = await getWishlistCount(session.customerId);

    return successResponse({
      wishlistedIds,
      count,
    });

  } catch (error) {
    console.error("❌ Bulk wishlist check error:", error);
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}