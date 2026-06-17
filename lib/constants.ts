// ============================================
// API ENDPOINTS
// ============================================
export const API_ENDPOINTS = {
  WISHLIST: "/api/wishlist",
  WISHLIST_GUEST: "/api/wishlist/guest",
  GUEST_REGISTER: "/api/auth/guest-register",
  SHOPIFY_WEBHOOK: "/api/shopify/webhook",
  EMAIL_ABANDONED: "/api/email/abandoned",
  WISHLIST_CHECK: "/api/wishlist/check",
} as const;

// ============================================
// COOKIE & TOKEN
// ============================================
export const TOKEN_COOKIE_NAME = "wishlist_token";
export const TOKEN_EXPIRY_DAYS = 30;
export const JWT_EXPIRY = "30d";

// ============================================
// EMAIL SETTINGS
// ============================================
export const EMAIL_DELAY = {
  FIRST: 24,   // 24 hours
  SECOND: 48,  // 48 hours
} as const;

// ============================================
// SHOPIFY API
// ============================================
export const SHOPIFY_API_VERSION = "2024-01";

export const SHOPIFY_FLOW_EVENTS = {
  WISHLIST_ADDED: "wishlist_added",
  ABANDONED_WISHLIST: "abandoned_wishlist",
  WISHLIST_CONVERTED: "wishlist_converted",
} as const;

// ============================================
// RESPONSE MESSAGES
// ============================================
export const MESSAGES = {
  // Success
  WISHLIST_ADDED: "Product added to wishlist",
  WISHLIST_REMOVED: "Product removed from wishlist",
  CUSTOMER_CREATED: "Account created successfully",
  EMAIL_SENT: "Email triggered successfully",

  // Errors
  UNAUTHORIZED: "Unauthorized. Please login.",
  PRODUCT_NOT_FOUND: "Product not found",
  ALREADY_IN_WISHLIST: "Product already in wishlist",
  DB_ERROR: "Database error occurred",
  MISSING_FIELDS: "Required fields are missing",
  INVALID_TOKEN: "Invalid or expired token",
  SHOPIFY_ERROR: "Shopify API error",
  EMAIL_REQUIRED: "Email address is required",

  // Info
  WISHLIST_EMPTY: "Your wishlist is empty",
  NO_ITEMS_TO_EMAIL: "No pending wishlist items found",
} as const;

// ============================================
// WISHLIST PAGE
// ============================================
export const WISHLIST_PAGE_URL = "/wishlist";

// ============================================
// LOCAL STORAGE KEYS
// (for guest before email submit)
// ============================================
export const STORAGE_KEYS = {
  PENDING_WISHLIST: "wishlist_pending",
  CUSTOMER_TOKEN: "wishlist_token",
  CUSTOMER_EMAIL: "wishlist_email",
  GUEST_WISHLIST: "guest_wishlist",
} as const;

// ============================================
// UI CONSTANTS
// ============================================
export const UI = {
  HEART_ANIMATION_MS: 300,
  POPUP_DELAY_MS: 500,
  TOAST_DURATION_MS: 3000,
  MAX_WISHLIST_DISPLAY: 50,
} as const;