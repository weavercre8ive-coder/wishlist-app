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

  const imageUrl = product_image_url
    ? product_image_url.startsWith("//")
      ? `https:${product_image_url}`
      : product_image_url
    : null;

  return (
    <div className="wishlist-card">
      <a
        href={product_url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        style={{ flexShrink: 0 }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product_title || "Product"}
            width={100}
            height={100}
            className="wishlist-card-image"
            style={{ cursor: "pointer" }}
          />
        ) : (
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

      <div className="wishlist-card-info">
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

        <p className="wishlist-card-price">
          {product_price
            ? `$${Number(product_price).toFixed(2)}`
            : "Price unavailable"}
        </p>

        <div className="wishlist-card-actions">
          <button
            className="btn btn-dark"
            onClick={() => onAddToCart(variant_id || product_id)}
            style={{ fontSize: "0.85rem", padding: "8px 16px" }}
          >
            🛒 Add to Cart
          </button>

          <a
            href={product_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ fontSize: "0.85rem", padding: "8px 16px" }}
          >
            👁️ View
          </a>

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