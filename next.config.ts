/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn-images.toolify.ai'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-images.toolify.ai',
        pathname: '**',
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
