/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    const pretixUrl = process.env.NEXT_PUBLIC_PRETIX_URL || 'https://pretix.yadawi.com';
    return [
      {
        source: '/api/pretix/:path*',
        destination: `${pretixUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
