"use client";

import Image from "next/image";
import { WishlistProductCardProps } from "@/types/product";

export default function WishlistCard({
  item,
  onRemove,
  onAddToCart,
}: WishlistProductCardProps) {
  const {
    product_id,
    product_title,
    product_image_url,
    product_price,
    product_url,
    variant_id,
  } = item;

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="wishlist-card">

      {/* Product Image */}
      <a
        href={product_url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        style={{ flexShrink: 0 }}
      >
        {product_image_url ? (
          <Image
            src={product_image_url}
            alt={product_title || "Product"}
            width={100}
            height={100}
            className="wishlist-card-image"
            style={{ cursor: "pointer" }}
          />
        ) : (
          // Fallback if no image
          <div
            className="wishlist-card-image"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f3f4f6",
              fontSize: "2rem",
            }}
          >
            🛍️
          </div>
        )}
      </a>

      {/* Product Info */}
      <div className="wishlist-card-info">

        {/* Title */}
        <a
          href={product_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <h3 className="wishlist-card-title">
            {product_title || "Unnamed Product"}
          </h3>
        </a>

        {/* Price */}
        <p className="wishlist-card-price">
          {product_price
            ? `$${Number(product_price).toFixed(2)}`
            : "Price unavailable"}
        </p>

        {/* Action Buttons */}
        <div className="wishlist-card-actions">

          {/* Add to Cart */}
          <button
            className="btn btn-dark"
            onClick={() =>
              onAddToCart(variant_id || product_id)
            }
            style={{ fontSize: "0.85rem", padding: "8px 16px" }}
          >
            🛒 Add to Cart
          </button>

          {/* View Product */}
          <a
            href={product_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ fontSize: "0.85rem", padding: "8px 16px" }}
          >
            👁️ View
          </a>

          {/* Remove */}
          <button
            className="btn btn-outline"
            onClick={() => onRemove(product_id)}
            style={{
              fontSize: "0.85rem",
              padding: "8px 16px",
              color: "#e11d48",
              borderColor: "#fecdd3",
            }}
          >
            ❌ Remove
          </button>

        </div>
      </div>
    </div>
  );
}