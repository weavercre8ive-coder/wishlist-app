import { NextRequest } from "next/server";
import {
  getPendingAbandonedEmails,
  markEmailSent,
  getWishlistByCustomerId,
  logEmailSent,
} from "@/lib/db";
import {
  sendAbandonedWishlistEmail,
} from "@/lib/shopify-flow";
import { successResponse, errorResponse } from "@/lib/auth-helpers";
import { EMAIL_DELAY } from "@/lib/constants";

// ============================================
// POST /api/email/abandoned
// Cron job বা manual trigger করলে এই route call হবে
// Abandoned wishlist email পাঠাবে
// ============================================
export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Verify internal API call (optional security)
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse("Unauthorized", 401);
    }

    // 2️⃣ Parse body for delay hours
    const body = await request.json().catch(() => ({}));
    const delayHours: number = body.delayHours || EMAIL_DELAY.FIRST;

    console.log(`📧 Processing abandoned emails for ${delayHours}h delay...`);

    // 3️⃣ Get all pending abandoned customers
    const pendingCustomers = await getPendingAbandonedEmails(delayHours);

    if (pendingCustomers.length === 0) {
      return successResponse({
        message: "No pending abandoned wishlist emails",
        processed: 0,
      });
    }

    console.log(`📋 Found ${pendingCustomers.length} customers to email`);

    // 4️⃣ Process each customer
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
    };

    for (const customer of pendingCustomers) {
      try {
        // Check if they have wishlist items
        const wishlistItems = await getWishlistByCustomerId(
          customer.customer_id
        );

        const pendingItems = wishlistItems.filter(
          (item: any) => !item.ordered
        );

        if (pendingItems.length === 0) {
          results.skipped++;
          continue;
        }

        // Skip if no Shopify customer ID
        if (!customer.shopify_customer_id) {
          console.log(
            `⚠️ No Shopify ID for customer: ${customer.email}`
          );
          results.skipped++;
          continue;
        }

        // 5️⃣ Send email via Shopify Flow
        const sent = await sendAbandonedWishlistEmail(
          customer.shopify_customer_id,
          customer.email,
          customer.customer_id,
          customer.name || undefined
        );

        if (sent) {
          // 6️⃣ Mark email as sent
          await markEmailSent(customer.customer_id, delayHours);

          // 7️⃣ Log the email
          await logEmailSent(customer.customer_id, "abandoned_wishlist");

          results.success++;
          console.log(`✅ Email sent to: ${customer.email}`);
        } else {
          results.failed++;
          console.error(`❌ Failed to send to: ${customer.email}`);
        }

      } catch (customerError) {
        console.error(
          `❌ Error processing customer ${customer.email}:`,
          customerError
        );
        results.failed++;
      }
    }

    return successResponse({
      message: "Abandoned email processing complete",
      delayHours,
      results,
      total: pendingCustomers.length,
    });

  } catch (error) {
    console.error("❌ Abandoned email route error:", error);
    return errorResponse("Email processing failed", 500);
  }
}

// ============================================
// GET /api/email/abandoned
// Status check — কতজন pending আছে
// ============================================
export async function GET(request: NextRequest) {
  try {
    const pending24h = await getPendingAbandonedEmails(
      EMAIL_DELAY.FIRST
    );
    const pending48h = await getPendingAbandonedEmails(
      EMAIL_DELAY.SECOND
    );

    return successResponse({
      pending24h: pending24h.length,
      pending48h: pending48h.length,
      total: pending24h.length + pending48h.length,
    });

  } catch (error) {
    console.error("❌ GET abandoned status error:", error);
    return errorResponse("Failed to get status", 500);
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