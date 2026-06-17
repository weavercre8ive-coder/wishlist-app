// app/api/wishlist/route.ts
import { NextRequest } from 'next/server';
import {
  getWishlistByCustomerId,
  getWishlistCount,
  addToWishlist,
  removeFromWishlist,
  upsertAbandonedTracking,
} from '@/lib/db';
import {
  getSessionFromRequest,
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/auth-helpers';
import { handleCorsOptions } from '@/lib/cors';

// ── OPTIONS (CORS preflight) ──────────────
export async function OPTIONS() {
  return handleCorsOptions();
}

// ── GET /api/wishlist ─────────────────────
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const items = await getWishlistByCustomerId(session.customerId);
    const count = await getWishlistCount(session.customerId);

    return successResponse({ items, count });

  } catch (error) {
    console.error('❌ GET wishlist error:', error);
    return errorResponse('Failed to fetch wishlist', 500);
  }
}

// ── POST /api/wishlist ────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const {
      productId,
      title,
      image,
      price,
      url,
      variantId,
    } = body;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Add to wishlist
    const item = await addToWishlist({
      customerId: session.customerId,
      productId,
      productTitle: title,
      productImageUrl: image,
      productPrice: price,
      productUrl: url,
      variantId,
    });

    // Update abandoned tracking
    await upsertAbandonedTracking(session.customerId);

    const count = await getWishlistCount(session.customerId);

    return successResponse({
      success: true,
      wishlisted: true,
      item,
      count,
    });

  } catch (error) {
    console.error('❌ POST wishlist error:', error);
    return errorResponse('Failed to add to wishlist', 500);
  }
}

// ── DELETE /api/wishlist ──────────────────
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    const removed = await removeFromWishlist(session.customerId, productId);

    if (!removed) {
      return errorResponse('Product not found in wishlist', 404);
    }

    const count = await getWishlistCount(session.customerId);

    return successResponse({
      success: true,
      productId,
      count,
    });

  } catch (error) {
    console.error('❌ DELETE wishlist error:', error);
    return errorResponse('Failed to remove from wishlist', 500);
  }
}