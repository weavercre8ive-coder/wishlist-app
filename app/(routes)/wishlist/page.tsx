"use client";

import { useEffect, useState, useCallback } from "react";
import { WishlistItem } from "@/types/wishlist";
import { STORAGE_KEYS, API_ENDPOINTS } from "@/lib/constants";
import WishlistGrid from "@/app/components/WishlistGrid";
import FloatingWishlistBtn from "@/app/components/FloatingWishlistBtn";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // ============================================
  // Toast helper
  // ============================================
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // ============================================
  // Fetch wishlist
  // ============================================
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem(
        STORAGE_KEYS.CUSTOMER_TOKEN
      );

      if (!token) {
        setItems([]);
        setLoading(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.WISHLIST, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setItems(data.items || []);
      } else {
        setError("Failed to load wishlist");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('wishlist_token', urlToken);
    }
    fetchWishlist();
  }, [fetchWishlist]);

  // ============================================
  // Remove item
  // ============================================
  const handleRemove = async (productId: string) => {
    try {
      const token = localStorage.getItem(
        STORAGE_KEYS.CUSTOMER_TOKEN
      );
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.WISHLIST, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (data.success) {
        setItems((prev) =>
          prev.filter((item) => item.product_id !== productId)
        );
        showToast("❌ Removed from wishlist");

        // Update floating button
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (err) {
      console.error("❌ Remove error:", err);
      showToast("Failed to remove item");
    }
  };

  // ============================================
  // Add to Cart
  // ============================================
  const handleAddToCart = (variantId: string) => {
    const storeUrl = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL;
    if (storeUrl) {
      window.open(
        `${storeUrl}/cart/add?id=${variantId}&quantity=1`,
        "_blank"
      );
    }
    showToast("🛒 Added to cart!");
  };

  // ============================================
  // RENDER — Loading Skeleton
  // ============================================
  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">

          <div className="wishlist-header">
            <h1 className="wishlist-title">❤️ My Wishlist</h1>
          </div>

          {/* Skeleton */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                gap: "20px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  background: "#f3f4f6",
                  borderRadius: "8px",
                  flexShrink: 0,
                  animation: "pulse 1.5s ease infinite",
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: 20,
                    background: "#f3f4f6",
                    borderRadius: 4,
                    marginBottom: 8,
                    width: "60%",
                  }}
                />
                <div
                  style={{
                    height: 16,
                    background: "#f3f4f6",
                    borderRadius: 4,
                    marginBottom: 16,
                    width: "30%",
                  }}
                />
                <div
                  style={{
                    height: 36,
                    background: "#f3f4f6",
                    borderRadius: 8,
                    width: "40%",
                  }}
                />
              </div>
            </div>
          ))}

        </div>
      </div>
    );
  }

  // ============================================
  // RENDER — Error
  // ============================================
  if (error) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="empty-wishlist">
            <div className="empty-wishlist-icon">⚠️</div>
            <h2 className="empty-wishlist-title">
              Something went wrong
            </h2>
            <p className="empty-wishlist-subtitle">{error}</p>
            <button
              className="btn btn-primary"
              onClick={fetchWishlist}
              style={{ maxWidth: 200, margin: "0 auto" }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER — Main
  // ============================================
  return (
    <div className="wishlist-page">
      <div className="wishlist-container">

        {/* Header */}
        <div className="wishlist-header">
          <h1 className="wishlist-title">❤️ My Wishlist</h1>
          <p className="wishlist-count-label">
            {items.length}{" "}
            {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {/* Back to Store */}
        <a
          href={
            process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || "#"
          }
          className="btn btn-outline"
          style={{
            marginBottom: 24,
            display: "inline-flex",
          }}
        >
          ← Back to Store
        </a>

        {/* Wishlist Grid */}
        <WishlistGrid
          items={items}
          onRemove={handleRemove}
          onAddToCart={handleAddToCart}
        />

      </div>

      {/* Floating Button */}
      <FloatingWishlistBtn count={items.length} />

      {/* Toast */}
      {toast && (
        <div className="toast">{toast}</div>
      )}

    </div>
  );
}