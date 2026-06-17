import { NextRequest } from "next/server";
import {
  getCustomerByShopifyId,
  createCustomer,
  updateCustomerToken,
} from "@/lib/db";
import {
  generateToken,
  successResponse,
  errorResponse,
  createTokenCookie,
} from "@/lib/auth-helpers";
import { getShopifyCustomerByEmail } from "@/lib/shopify-admin";

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL!;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

// ============================================
// GET /api/shopify/auth
// Shopify OAuth শুরু করবে
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if this is OAuth callback
    const code = searchParams.get("code");
    const shop = searchParams.get("shop");

    // ----------------------------------------
    // STEP 1: Initiate OAuth
    // ----------------------------------------
    if (!code) {
      const shopDomain =
        shop || SHOPIFY_STORE_URL.replace("https://", "");

      const redirectUri = `${BASE_URL}/api/shopify/auth`;
      const scopes = "read_customers,write_customers,read_orders";

      const authUrl =
        `https://${shopDomain}/admin/oauth/authorize` +
        `?client_id=${SHOPIFY_API_KEY}` +
        `&scope=${scopes}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code`;

      // Redirect to Shopify
      return Response.redirect(authUrl, 302);
    }

    // ----------------------------------------
    // STEP 2: Handle OAuth Callback
    // ----------------------------------------
    if (code && shop) {
      // Exchange code for access token
      const tokenResponse = await fetch(
        `https://${shop}/admin/oauth/access_token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: SHOPIFY_API_KEY,
            client_secret: SHOPIFY_API_SECRET,
            code,
          }),
        }
      );

      if (!tokenResponse.ok) {
        return errorResponse("Failed to get Shopify access token", 400);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        return errorResponse("No access token received", 400);
      }

      console.log("✅ Shopify OAuth successful for shop:", shop);

      // Redirect to success page
      return Response.redirect(
        `${BASE_URL}/wishlist?auth=success`,
        302
      );
    }

    return errorResponse("Invalid auth request", 400);

  } catch (error) {
    console.error("❌ Shopify auth error:", error);
    return errorResponse("Authentication failed", 500);
  }
}

// ============================================
// POST /api/shopify/auth
// Shopify customer session verify করবে
// Logged-in customer detect করতে
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shopifyCustomerId, email } = body;

    if (!shopifyCustomerId && !email) {
      return errorResponse("Customer ID or email required", 400);
    }

    // 1️⃣ Find customer in our DB
    let customer = null;

    if (shopifyCustomerId) {
      customer = await getCustomerByShopifyId(
        shopifyCustomerId.toString()
      );
    }

    // 2️⃣ If not found, try by email
    if (!customer && email) {
      const { getCustomerByEmail } = await import("@/lib/db");
      customer = await getCustomerByEmail(
        email.toLowerCase().trim()
      );
    }

    // 3️⃣ If still not found, create new customer
    if (!customer) {
      // Verify with Shopify first
      const shopifyCustomer = email
        ? await getShopifyCustomerByEmail(email)
        : null;

      customer = await createCustomer({
        email: email || `customer_${shopifyCustomerId}@shopify.com`,
        shopifyCustomerId: shopifyCustomerId?.toString(),
        isGuest: false,
      });
    }

    // 4️⃣ Generate JWT token
    const token = await generateToken({
      customerId: customer.id,
      email: customer.email,
      isGuest: false,
      shopifyCustomerId: shopifyCustomerId?.toString(),
    });

    // 5️⃣ Save token to DB
    await updateCustomerToken(customer.id, token);

    // 6️⃣ Return with cookie
    const response = successResponse({
      customerId: customer.id,
      email: customer.email,
      token,
      isGuest: false,
      message: "Authenticated successfully",
    });

    const headers = new Headers(response.headers);
    headers.append("Set-Cookie", createTokenCookie(token));

    return new Response(response.body, {
      status: response.status,
      headers,
    });

  } catch (error) {
    console.error("❌ Shopify auth POST error:", error);
    return errorResponse("Authentication failed", 500);
  }
}

// ============================================
// OPTIONS — CORS
// ============================================
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization",
    },
  });
}