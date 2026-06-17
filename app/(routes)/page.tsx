export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9f9f9",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ textAlign: "center", padding: "40px 20px" }}>

        {/* Title */}
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "800",
            color: "#111",
            margin: "0 0 16px",
          }}
        >
          ❤️ Wishlist App
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            color: "#555",
            maxWidth: "500px",
            lineHeight: "1.6",
            margin: "0 auto 32px",
          }}
        >
          Shopify Custom Wishlist & Abandoned Recovery System.
          Fully custom. No extra SaaS needed.
        </p>

        {/* Status Cards */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "32px",
          }}
        >
          {[
            { icon: "✅", label: "API Live" },
            { icon: "🗄️", label: "DB Connected" },
            { icon: "🛍️", label: "Shopify Ready" },
            { icon: "📧", label: "Email Flow Active" },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "20px 28px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                fontSize: "1rem",
                color: "#333",
                fontWeight: "600",
              }}
            >
              {card.icon} {card.label}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/wishlist"
            style={{
              padding: "12px 28px",
              background: "#e11d48",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "1rem",
            }}
          >
            ❤️ View Wishlist Page
          </a>

          <a
            href="/api/wishlist"
            style={{
              padding: "12px 28px",
              background: "#111",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "1rem",
            }}
          >
            🔌 API Endpoint
          </a>
        </div>

      </div>
    </main>
  );
}