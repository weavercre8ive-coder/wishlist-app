"use client";

import { useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import { AddToWishlistInput } from "@/types/wishlist";

interface GuestEmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, email: string) => void;
  pendingProduct?: AddToWishlistInput | null;
}

export default function GuestEmailPopup({
  isOpen,
  onClose,
  onSuccess,
  pendingProduct,
}: GuestEmailPopupProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // ============================================
  // Handle form submit
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/wishlist/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          // Pass the pending product info
          productId: pendingProduct?.productId,
          productTitle: pendingProduct?.productTitle,
          productImageUrl: pendingProduct?.productImageUrl,
          productPrice: pendingProduct?.productPrice,
          productUrl: pendingProduct?.productUrl,
          variantId: pendingProduct?.variantId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save token to localStorage
        localStorage.setItem(STORAGE_KEYS.CUSTOMER_TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.CUSTOMER_EMAIL, data.email);

        // Notify parent
        onSuccess(data.token, data.email);

        // Dispatch event to update floating button count
        window.dispatchEvent(new Event("wishlistUpdated"));

        // Reset form
        setEmail("");
        setName("");
        onClose();
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("❌ Guest popup error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Handle overlay click
  // ============================================
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-card">
        {/* Close Button */}
        <button
          className="popup-close-btn"
          onClick={onClose}
          aria-label="Close popup"
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>❤️</div>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "#111",
              marginBottom: 6,
            }}
          >
            Save to Wishlist
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.5 }}>
            Enter your email to save{" "}
            {pendingProduct?.productTitle
              ? `"${pendingProduct.productTitle}"`
              : "this product"}{" "}
            to your wishlist.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="guest-email">
              Email Address <span style={{ color: "#e11d48" }}>*</span>
            </label>
            <input
              id="guest-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus
              required
            />
          </div>

          {/* Name (optional) */}
          <div className="form-group">
            <label className="form-label" htmlFor="guest-name">
              Name{" "}
              <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <input
              id="guest-name"
              type="text"
              className="form-input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#dc2626",
                fontSize: "0.875rem",
                marginBottom: 16,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginBottom: 12 }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Saving...
              </>
            ) : (
              "❤️ Save to Wishlist"
            )}
          </button>

          {/* Cancel */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
            style={{ width: "100%" }}
          >
            Cancel
          </button>
        </form>

        {/* Privacy note */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.75rem",
            color: "#9ca3af",
            marginTop: 16,
          }}
        >
          🔒 We respect your privacy. No spam, ever.
        </p>
      </div>
    </div>
  );
}