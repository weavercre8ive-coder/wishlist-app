"use client";

import { WishlistItem } from "@/types/wishlist";
import WishlistCard from "./WishlistCard";

interface WishlistGridProps {
  items: WishlistItem[];
  onRemove: (productId: string) => void;
  onAddToCart: (variantId: string) => void;
}

export default function WishlistGrid({
  items,
  onRemove,
  onAddToCart,
}: WishlistGridProps) {

  // ============================================
  // Empty State
  // ============================================
  if (items.length === 0) {
    return (
      <div className="empty-wishlist">
        <div className="empty-wishlist-icon">💔</div>
        <h2 className="empty-wishlist-title">
          Your wishlist is empty
        </h2>
        <p className="empty-wishlist-subtitle">
          Browse our store and add products you love!
        </p>
        <a
          href={
            process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || "#"
          }
          className="btn btn-primary"
          style={{ maxWidth: 220, margin: "0 auto" }}
        >
          🛍️ Continue Shopping
        </a>
      </div>
    );
  }

  // ============================================
  // Grid of Wishlist Cards
  // ============================================
  return (
    <div>
      {/* Summary Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          padding: "12px 16px",
          background: "#fff",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
        }}
      >
        <span style={{ fontWeight: 600, color: "#374151" }}>
          ❤️ {items.length}{" "}
          {items.length === 1 ? "item" : "items"} saved
        </span>

        <a
          href={
            process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || "https://weavercre8ive.com/collections/all"
          }
          style={{
            fontSize: "0.85rem",
            color: "#6b7280",
            textDecoration: "none",
          }}
        >
          + Add more items
        </a>
      </div>

      {/* Cards */}
      {items.map((item) => (
        <WishlistCard
          key={item.id}
          item={item}
          onRemove={onRemove}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}