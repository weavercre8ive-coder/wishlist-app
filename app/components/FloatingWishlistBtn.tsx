"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

interface FloatingWishlistBtnProps {
  count?: number;
}

export default function FloatingWishlistBtn({
  count: initialCount,
}: FloatingWishlistBtnProps) {
  const [count, setCount] = useState(initialCount || 0);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // ============================================
  // Fetch real count from API
  // ============================================
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN);
        if (!token) return;

        const response = await fetch("/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          setCount(data.count || 0);
        }
      } catch (err) {
        console.error("❌ Floating btn count error:", err);
      }
    };

    fetchCount();

    // Listen for wishlist updates
    window.addEventListener("wishlistUpdated", fetchCount);
    return () => window.removeEventListener("wishlistUpdated", fetchCount);
  }, []);

  // Update when prop changes
  useEffect(() => {
    if (initialCount !== undefined) {
      setCount(initialCount);
    }
  }, [initialCount]);

  // ============================================
  // Hide on scroll down, show on scroll up
  // ============================================
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <a
      href="/wishlist"
      className="floating-wishlist-btn"
      style={{
        transform: visible ? "translateY(0)" : "translateY(100px)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s ease, opacity 0.3s ease, background 0.15s ease",
      }}
      aria-label={`Wishlist with ${count} items`}
    >
      {/* Heart Icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="white"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>

      <span>Wishlist</span>

      {/* Count Badge */}
      {count > 0 && (
        <span className="count-badge">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </a>
  );
}