import type { NextConfig } from "next";

const nextConfig /** @type {NextConfig} */ = {
  async redirects() {
    return [
      { source: "/embed", destination: "/embed/", permanent: false }, // falls /embed (ohne Slash) 404en würde
    ];
  },
  // (Optional) iFrame-Einbettung erlauben – passe deine WP-Domain an:
  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://*.deine-wp-domain.tld https://*.vercel.app" },
        ],
      },
    ];
  },
};

export default nextConfig;
