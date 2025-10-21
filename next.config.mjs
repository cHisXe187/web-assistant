/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://onmotion.it https://www.onmotion.it https://*.onmotion.it;" },
        ],
      },
    ];
  },
};
export default nextConfig;
