export interface Product {
  id: string;
  title: string;
  handle: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  productUrl: string;
  variantId?: string;
  availableForSale: boolean;
  vendor?: string;
  productType?: string;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  image: ShopifyImage;
}

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string;
  inventory_quantity: number;
  available: boolean;
}

export interface ShopifyImage {
  id: number;
  product_id: number;
  src: string;
  alt: string | null;
  width: number;
  height: number;
}

export interface ShopifyOrder {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
  total_price: string;
  line_items: ShopifyLineItem[];
  customer: {
    id: number;
    email: string;
  };
  financial_status: string;
  fulfillment_status: string | null;
}

export interface ShopifyLineItem {
  id: number;
  product_id: number;
  variant_id: number;
  title: string;
  quantity: number;
  price: string;
}

export interface WishlistProductCardProps {
  item: {
    id: number;
    product_id: string;
    product_title: string | null;
    product_image_url: string | null;
    product_price: number | null;
    product_url: string | null;
    variant_id: string | null;
  };
  onRemove: (productId: string) => void;
  onAddToCart: (variantId: string) => void;
}