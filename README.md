# ❤️ Shopify Wishlist App

> Custom Shopify Wishlist + Abandoned Recovery System
> Built with Next.js + Neon PostgreSQL + Shopify Flow

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend + API | Next.js 14 (App Router) |
| Database | Neon PostgreSQL |
| Hosting | Vercel |
| Store | Shopify |
| Email | Shopify Flow + Shopify Email |
| Auth | JWT (jose) |

---

## 📁 Project Structure

```
wishlist-app/
├── app/
│   ├── api/
│   │   ├── wishlist/route.ts
│   │   ├── wishlist/guest/route.ts
│   │   ├── wishlist/check/route.ts
│   │   ├── auth/guest-register/route.ts
│   │   ├── shopify/auth/route.ts
│   │   ├── shopify/webhook/route.ts
│   │   └── email/abandoned/route.ts
│   ├── components/
│   │   ├── WishlistButton.tsx
│   │   ├── FloatingWishlistBtn.tsx
│   │   ├── GuestEmailPopup.tsx
│   │   ├── WishlistCard.tsx
│   │   └── WishlistGrid.tsx
│   ├── wishlist/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── db.ts
│   ├── auth-helpers.ts
│   ├── shopify-admin.ts
│   ├── shopify-flow.ts
│   └── constants.ts
├── types/
│   ├── customer.ts
│   ├── wishlist.ts
│   └── product.ts
├── database/
│   └── schema.sql
└── public/icons/
    ├── heart.svg
    └── heart-filled.svg
```

---

## ⚙️ Setup Guide

### Step 1 — Clone & Install

```bash
git clone https://github.com/your-username/wishlist-app.git
cd wishlist-app
npm install
```

### Step 2 — Environment Variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
DATABASE_URL=postgresql://...
SHOPIFY_STORE_URL=https://your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxx
SHOPIFY_API_KEY=xxx
SHOPIFY_API_SECRET=xxx
SHOPIFY_WEBHOOK_SECRET=xxx
JWT_SECRET=your_32_char_secret
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NEXT_PUBLIC_SHOPIFY_STORE_URL=https://your-store.myshopify.com
```

### Step 3 — Database Setup

Run `database/schema.sql` in your **Neon SQL Editor**

### Step 4 — Run Locally

```bash
npm run dev
```

Visit: `http://localhost:3000`

### Step 5 — Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "initial commit"
git push origin main

# Then connect repo in Vercel dashboard
# Add all env variables in Vercel settings
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/wishlist` | Get all wishlist items |
| `POST` | `/api/wishlist` | Add product to wishlist |
| `DELETE` | `/api/wishlist` | Remove from wishlist |
| `GET` | `/api/wishlist/check?productId=x` | Check if wishlisted |
| `POST` | `/api/wishlist/guest` | Guest add to wishlist |
| `POST` | `/api/auth/guest-register` | Register guest user |
| `GET` | `/api/shopify/auth` | Shopify OAuth |
| `POST` | `/api/shopify/webhook` | Order webhook |
| `POST` | `/api/email/abandoned` | Trigger abandoned emails |

---

## 🛍️ Shopify Theme Integration

Add this to your Shopify theme `product.liquid`:

```html
<!-- Wishlist Button -->
<div id="wishlist-btn-container"></div>

<script>
  const WISHLIST_APP_URL = "https://your-app.vercel.app";

  async function initWishlistButton() {
    const productId = "{{ product.id }}";
    const token = localStorage.getItem("wishlist_token");

    // Check if wishlisted
    const res = await fetch(
      `${WISHLIST_APP_URL}/api/wishlist/check?productId=${productId}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    const data = await res.json();

    const btn = document.getElementById("wishlist-btn-container");
    btn.innerHTML = `
      <button
        onclick="toggleWishlist('${productId}')"
        id="wishlist-heart-btn"
        style="
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          font-size: 1.5rem;
        "
      >
        ${data.isWishlisted ? "❤️" : "🤍"}
      </button>
    `;
  }

  async function toggleWishlist(productId) {
    const token = localStorage.getItem("wishlist_token");

    if (!token) {
      // Show guest popup
      showGuestPopup(productId);
      return;
    }

    const btn = document.getElementById("wishlist-heart-btn");
    const isWishlisted = btn.innerText === "❤️";

    if (isWishlisted) {
      await fetch(`${WISHLIST_APP_URL}/api/wishlist`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      btn.innerText = "🤍";
    } else {
      await fetch(`${WISHLIST_APP_URL}/api/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          productTitle: "{{ product.title }}",
          productImageUrl: "{{ product.featured_image | img_url: '400x400' }}",
          productPrice: {{ product.price | divided_by: 100.0 }},
          productUrl: "{{ shop.url }}{{ product.url }}",
          variantId: "{{ product.selected_or_first_available_variant.id }}",
        }),
      });
      btn.innerText = "❤️";
    }
  }

  initWishlistButton();
</script>
```

---

## 📧 Abandoned Email Flow

```
User adds to wishlist
       ↓
API saves to DB + triggers Shopify Flow event
       ↓
Shopify Flow waits 24 hours
       ↓
Checks if order placed
       ↓
If NO order → sends email via Shopify Email
       ↓
48h later → sends second reminder
```

---

## 🔔 Shopify Webhook Setup

In Shopify Admin → Settings → Notifications → Webhooks:

```
Event: Order creation
URL: https://your-app.vercel.app/api/shopify/webhook
Format: JSON
```

---

## 👤 Customer Flow

```
Guest visits store
      ↓
Clicks ❤️ on product
      ↓
Popup: Enter email
      ↓
Customer created in Shopify + our DB
      ↓
Wishlist saved
      ↓
Token stored in localStorage
      ↓
Future visits: auto-recognized
```

---

## 📝 License

MIT © 2024 — Built with ❤️ for Shopify stores