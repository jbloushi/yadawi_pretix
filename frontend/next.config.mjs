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
  // NOTE: removed the '/api/pretix/:path*' → Pretix rewrite. It shadowed the
  // route handlers under app/api/pretix/* (which add the organizer path + auth
  // token) and proxied to Pretix without auth, 404-ing every call.
};

export default nextConfig;
