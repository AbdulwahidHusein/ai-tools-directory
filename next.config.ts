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
};

export default nextConfig;
