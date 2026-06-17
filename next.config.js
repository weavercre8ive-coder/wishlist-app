/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**",
    },
  ],
},

  async headers() {
    return [
      {
        // Allow Shopify store to embed/call our API
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/wishlist",
        destination: "/wishlist",
      },
    ];
  },
};

module.exports = nextConfig;