/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // TEMP: erlaubt Einbettung aus allen Domains
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' *;" },
        ],
      },
    ];
  },
};
export default nextConfig;
