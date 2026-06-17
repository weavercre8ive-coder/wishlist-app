import { ShopifyCustomer, ShopifyCustomerCreateInput } from "@/types/customer";
import { ShopifyProduct } from "@/types/product";

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL!;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN!;
const API_VERSION = "2024-01";

if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
  console.warn("⚠️ Shopify credentials missing in environment variables");
}

// ============================================
// BASE FETCH HELPER
// ============================================
async function shopifyFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${SHOPIFY_STORE_URL}/admin/api/${API_VERSION}/${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Shopify API Error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}

// ============================================
// CUSTOMER OPERATIONS
// ============================================

// Get customer by email
export async function getShopifyCustomerByEmail(
  email: string
): Promise<ShopifyCustomer | null> {
  try {
    const data = await shopifyFetch<{ customers: ShopifyCustomer[] }>(
      `customers.json?email=${encodeURIComponent(email)}`
    );
    return data.customers[0] || null;
  } catch (error) {
    console.error("❌ Error fetching Shopify customer:", error);
    return null;
  }
}

// Get customer by ID
export async function getShopifyCustomerById(
  customerId: string
): Promise<ShopifyCustomer | null> {
  try {
    const data = await shopifyFetch<{ customer: ShopifyCustomer }>(
      `customers/${customerId}.json`
    );
    return data.customer;
  } catch (error) {
    console.error("❌ Error fetching Shopify customer by ID:", error);
    return null;
  }
}

// Create new Shopify customer
export async function createShopifyCustomer(
  email: string,
  name?: string
): Promise<ShopifyCustomer | null> {
  try {
    const nameParts = name ? name.split(" ") : [];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const input: ShopifyCustomerCreateInput = {
      customer: {
        email,
        first_name: firstName,
        last_name: lastName,
        verified_email: true,
        send_email_welcome: false,
        tags: "wishlist-user",
      },
    };

    const data = await shopifyFetch<{ customer: ShopifyCustomer }>(
      "customers.json",
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );

    return data.customer;
  } catch (error) {
    console.error("❌ Error creating Shopify customer:", error);
    return null;
  }
}

// Find or create Shopify customer
export async function findOrCreateShopifyCustomer(
  email: string,
  name?: string
): Promise<{ customer: ShopifyCustomer; isNew: boolean } | null> {
  try {
    // First try to find existing customer
    const existingCustomer = await getShopifyCustomerByEmail(email);

    if (existingCustomer) {
      return { customer: existingCustomer, isNew: false };
    }

    // Create new customer
    const newCustomer = await createShopifyCustomer(email, name);
    if (!newCustomer) return null;

    return { customer: newCustomer, isNew: true };
  } catch (error) {
    console.error("❌ Error in findOrCreateShopifyCustomer:", error);
    return null;
  }
}

// ============================================
// PRODUCT OPERATIONS
// ============================================

// Get product by ID
export async function getShopifyProduct(
  productId: string
): Promise<ShopifyProduct | null> {
  try {
    const cleanId = productId.replace("gid://shopify/Product/", "");
    const data = await shopifyFetch<{ product: ShopifyProduct }>(
      `products/${cleanId}.json`
    );
    return data.product;
  } catch (error) {
    console.error("❌ Error fetching Shopify product:", error);
    return null;
  }
}

// ============================================
// ORDER VERIFICATION
// ============================================

// Check if customer has ordered specific products
export async function checkCustomerOrders(
  customerEmail: string,
  productIds: string[]
): Promise<string[]> {
  try {
    const data = await shopifyFetch<{ orders: any[] }>(
      `orders.json?email=${encodeURIComponent(customerEmail)}&status=any&fields=line_items`
    );

    const orderedProductIds: string[] = [];

    data.orders.forEach((order) => {
      order.line_items?.forEach((item: any) => {
        const pid = item.product_id?.toString();
        if (pid && productIds.includes(pid)) {
          orderedProductIds.push(pid);
        }
      });
    });

    return [...new Set(orderedProductIds)];
  } catch (error) {
    console.error("❌ Error checking customer orders:", error);
    return [];
  }
}

// ============================================
// SHOPIFY FLOW TRIGGER
// ============================================
export async function triggerShopifyFlow(payload: {
  customerId: string;
  email: string;
  eventType: string;
}) {
  try {
    // Shopify Flow trigger via custom webhook
    const response = await fetch(
      `${SHOPIFY_STORE_URL}/admin/api/${API_VERSION}/events.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: {
            subject_type: "Customer",
            subject_id: payload.customerId,
            verb: payload.eventType,
            arguments: [payload.email],
            body: JSON.stringify(payload),
          },
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("❌ Error triggering Shopify Flow:", error);
    return false;
  }
}