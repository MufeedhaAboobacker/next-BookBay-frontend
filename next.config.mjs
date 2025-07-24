/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'bookbay-backend-eyit.onrender.com',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
