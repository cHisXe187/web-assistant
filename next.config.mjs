/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Erlaube Einbettung NUR von deiner WP-Domain (mit/ohne www + Subdomains)
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://deine-domain.tld https://www.deine-domain.tld https://*.deine-domain.tld;" },
        ],
      },
    ];
  },
};
export default nextConfig;
