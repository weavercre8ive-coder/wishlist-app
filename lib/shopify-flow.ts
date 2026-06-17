// lib/shopify-flow.ts
import { getWishlistByCustomerId } from "@/lib/db";
import { WishlistItem } from "@/types/wishlist";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;
const SHOPIFY_FLOW_WEBHOOK_URL = process.env.SHOPIFY_FLOW_WEBHOOK_URL;

// ============================================
// TRIGGER WISHLIST ADDED EVENT
// ============================================
export async function triggerWishlistAddedFlow(
  shopifyCustomerId: string,
  email: string,
  productTitle: string
): Promise<boolean> {
  if (!SHOPIFY_FLOW_WEBHOOK_URL) {
    console.warn("⚠️ SHOPIFY_FLOW_WEBHOOK_URL not set - Flow not triggered");
    return false;
  }

  try {
    const response = await fetch(SHOPIFY_FLOW_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "wishlist_added",
        customer_id: shopifyCustomerId,
        email,
        product_title: productTitle,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("❌ Flow trigger failed:", err);
      return false;
    }

    console.log(`✅ Wishlist added flow triggered for: ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error triggering wishlist flow:", error);
    return false;
  }
}

// ============================================
// BUILD EMAIL PAYLOAD
// ============================================
export async function buildAbandonedEmailPayload(
  customerId: number,
  customerEmail: string,
  customerName?: string
) {
  try {
    const wishlistItems = (await getWishlistByCustomerId(
      customerId
    )) as WishlistItem[];

    const pendingItems = wishlistItems.filter((item) => !item.ordered);

    if (pendingItems.length === 0) {
      return null;
    }

    const productListHtml = pendingItems
      .map(
        (item) => `
        <div style="margin-bottom:20px; border:1px solid #eee; 
                    padding:15px; border-radius:8px;">
          <img 
            src="${item.product_image_url || ""}" 
            alt="${item.product_title || "Product"}"
            style="width:100px; height:100px; object-fit:cover;"
          />
          <h3 style="margin:10px 0 5px;">
            ${item.product_title || "Product"}
          </h3>
          <p style="color:#666; margin:0;">
            $${item.product_price?.toFixed(2) || "0.00"}
          </p>
          <a 
            href="${item.product_url || ""}"
            style="display:inline-block; margin-top:10px; 
                   padding:8px 16px; background:#000; 
                   color:#fff; text-decoration:none; 
                   border-radius:4px;"
          >
            View Product
          </a>
        </div>
      `
      )
      .join("");

    const emailPayload = {
      customerEmail,
      customerName: customerName || "Valued Customer",
      itemCount: pendingItems.length,
      wishlistUrl: `${NEXT_PUBLIC_BASE_URL}/wishlist`,
      productListHtml,
      products: pendingItems.map((item) => ({
        title: item.product_title,
        price: item.product_price,
        image: item.product_image_url,
        url: item.product_url,
      })),
    };

    return emailPayload;
  } catch (error) {
    console.error("❌ Error building email payload:", error);
    return null;
  }
}

// ============================================
// SEND ABANDONED WISHLIST EMAIL VIA FLOW
// ============================================
export async function sendAbandonedWishlistEmail(
  shopifyCustomerId: string,
  email: string,
  customerId: number,
  name?: string
): Promise<boolean> {
  if (!SHOPIFY_FLOW_WEBHOOK_URL) {
    console.warn("⚠️ SHOPIFY_FLOW_WEBHOOK_URL not set");
    return false;
  }

  try {
    const payload = await buildAbandonedEmailPayload(customerId, email, name);

    if (!payload) {
      console.log("ℹ️ No pending wishlist items for:", email);
      return false;
    }

    // Trigger Shopify Flow via HTTP Request
    const response = await fetch(SHOPIFY_FLOW_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "abandoned_wishlist",
        customer_id: shopifyCustomerId,
        email,
        name: payload.customerName,
        item_count: payload.itemCount,
        wishlist_url: payload.wishlistUrl,
        products: payload.products,
        product_list_html: payload.productListHtml,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("❌ Abandoned email flow failed:", err);
      return false;
    }

    console.log(`✅ Abandoned wishlist email triggered for: ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending abandoned wishlist email:", error);
    return false;
  }
}