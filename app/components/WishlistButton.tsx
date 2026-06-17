"use client";

import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS, API_ENDPOINTS } from "@/lib/constants";
import { AddToWishlistInput } from "@/types/wishlist";

interface WishlistButtonProps {
  product: {
    id: string;
    title: string;
    imageUrl?: string;
    price?: number;
    url?: string;
    variantId?: string;
  };
  onGuestClick?: (product: AddToWishlistInput) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function WishlistButton({
  product,
  onGuestClick,
  size = "md",
  className = "",
}: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Icon sizes
  const iconSize = size === "sm" ? 18 : size === "lg" ? 28 : 22;

  // ============================================
  // Check if product is already wishlisted
  // ============================================
  const checkWishlistStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN);
      if (!token) return;

      const response = await fetch(
        `${API_ENDPOINTS.WISHLIST_CHECK}?productId=${product.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setIsWishlisted(data.isWishlisted);
      }
    } catch (err) {
      console.error("❌ Check wishlist error:", err);
    }
  }, [product.id]);

  useEffect(() => {
    checkWishlistStatus();
  }, [checkWishlistStatus]);

  // ============================================
  // Handle wishlist toggle
  // ============================================
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const token = localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN);

    // Guest user — show popup
    if (!token) {
      if (onGuestClick) {
        onGuestClick({
          productId: product.id,
          productTitle: product.title,
          productImageUrl: product.imageUrl,
          productPrice: product.price,
          productUrl: product.url,
          variantId: product.variantId,
        });
      }
      return;
    }

    setLoading(true);

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const response = await fetch(API_ENDPOINTS.WISHLIST, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product.id }),
        });

        const data = await response.json();
        if (data.success) {
          setIsWishlisted(false);
          triggerAnimate();
        }
      } else {
        // Add to wishlist
        const response = await fetch(API_ENDPOINTS.WISHLIST, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            productTitle: product.title,
            productImageUrl: product.imageUrl,
            productPrice: product.price,
            productUrl: product.url,
            variantId: product.variantId,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setIsWishlisted(true);
          triggerAnimate();
        }
      }
    } catch (err) {
      console.error("❌ Wishlist toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnimate = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 400);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`wishlist-btn ${isWishlisted ? "wishlisted" : ""} ${animate ? "animate" : ""} ${className}`}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      {loading ? (
        // Loading spinner
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          style={{
            animation: "spin 0.6s linear infinite",
          }}
        >
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      ) : (
        // Heart icon
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill={isWishlisted ? "#e11d48" : "none"}
          stroke={isWishlisted ? "#e11d48" : "#6b7280"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
    </button>
  );
}