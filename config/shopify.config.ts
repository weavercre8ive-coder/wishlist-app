// ============================================
// SHOPIFY APP CONFIGURATION
// ============================================

const shopifyConfig = {
  // Store Info
  store: {
    url: process.env.SHOPIFY_STORE_URL || "",
    name: process.env.SHOPIFY_STORE_URL?.replace(
      "https://",
      ""
    ).replace(".myshopify.com", "") || "",
  },

  // API Credentials
  api: {
    key: process.env.SHOPIFY_API_KEY || "",
    secret: process.env.SHOPIFY_API_SECRET || "",
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN || "",
    version: "2024-01",
    webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || "",
  },

  // OAuth Settings
  oauth: {
    scopes: [
      "read_customers",
      "write_customers",
      "read_orders",
      "write_orders",
      "read_products",
    ].join(","),
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/shopify/auth`,
  },

  // Webhook Topics to register
  webhooks: {
    topics: [
      "orders/create",
      "orders/paid",
      "customers/create",
      "customers/update",
    ],
    endpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/api/shopify/webhook`,
  },

  // Flow Events
  flow: {
    events: {
      wishlistAdded: "wishlist_added",
      abandonedWishlist: "abandoned_wishlist",
      wishlistConverted: "wishlist_converted",
    },
  },

  // Email Settings
  email: {
    delayHours: {
      first: Number(process.env.EMAIL_DELAY_HOURS) || 24,
      second: Number(process.env.EMAIL_DELAY_HOURS_SECOND) || 48,
    },
    fromName: "Your Store Wishlist",
    subject: "You left something behind ❤️",
  },

  // App URLs
  urls: {
    base: process.env.NEXT_PUBLIC_BASE_URL || "",
    wishlistPage: "/wishlist",
    apiBase: "/api",
  },
} as const;

export default shopifyConfig;

// ============================================
// HELPER — Build Shopify Admin API URL
// ============================================
export function buildShopifyUrl(endpoint: string): string {
  const url = shopifyConfig.store.url;
  const version = shopifyConfig.api.version;
  return `${url}/admin/api/${version}/${endpoint}`;
}


// ============================================
// HELPER — Get Shopify headers
// ============================================
export function getShopifyHeaders(): HeadersInit {
  return {
    "X-Shopify-Access-Token": shopifyConfig.api.accessToken,
    "Content-Type": "application/json",
  };
}

// ============================================
// VALIDATE CONFIG on startup
// ============================================
export function validateShopifyConfig(): {
  valid: boolean;
  missing: string[];
} {
  const required = [
    { key: "SHOPIFY_STORE_URL", value: shopifyConfig.store.url },
    { key: "SHOPIFY_ACCESS_TOKEN", value: shopifyConfig.api.accessToken },
    { key: "SHOPIFY_API_KEY", value: shopifyConfig.api.key },
    { key: "SHOPIFY_API_SECRET", value: shopifyConfig.api.secret },
    { key: "JWT_SECRET", value: process.env.JWT_SECRET },
    { key: "DATABASE_URL", value: process.env.DATABASE_URL },
  ];

  const missing = required
    .filter((item) => !item.value)
    .map((item) => item.key);

  return {
    valid: missing.length === 0,
    missing,
  };
}