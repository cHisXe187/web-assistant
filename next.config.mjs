/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Alle Pfade erlauben das Einbetten aus deiner WP-Domain
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://onmotion.it https://www.onmotion.it https://*.onmotion.it;"
          },
          // 👇 hebt das DENY auf!
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
    ];
  },
};
export default nextConfig;
