export interface WishlistItem {
  id: number;
  customer_id: number;
  product_id: string;
  product_title: string | null;
  product_image_url: string | null;
  product_price: number | null;
  product_url: string | null;
  variant_id: string | null;
  added_at: string;
  ordered: boolean;
  ordered_at: string | null;
}

export interface AddToWishlistInput {
  productId: string;
  productTitle?: string;
  productImageUrl?: string;
  productPrice?: number;
  productUrl?: string;
  variantId?: string;
}

export interface WishlistResponse {
  success: boolean;
  items: WishlistItem[];
  count: number;
  message?: string;
}

export interface AddWishlistResponse {
  success: boolean;
  wishlisted: boolean;
  item?: WishlistItem;
  message?: string;
}

export interface RemoveWishlistResponse {
  success: boolean;
  message?: string;
}

export interface WishlistCheckResponse {
  success: boolean;
  isWishlisted: boolean;
  productId: string;
}

export interface AbandonedTracking {
  id: number;
  customer_id: number;
  last_added_at: string;
  email_24h_sent: boolean;
  email_24h_sent_at: string | null;
  email_48h_sent: boolean;
  email_48h_sent_at: string | null;
  converted: boolean;
  converted_at: string | null;
  // joined
  email?: string;
  name?: string;
  shopify_customer_id?: string;
}

export interface EmailLog {
  id: number;
  customer_id: number;
  email_type: string;
  sent_at: string;
  opened: boolean;
  opened_at: string | null;
  clicked: boolean;
  clicked_at: string | null;
  flow_triggered: boolean;
  flow_triggered_at: string | null;
}