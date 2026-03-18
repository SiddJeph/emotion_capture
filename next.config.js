/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/emotion-capture',
  assetPrefix: '/emotion-capture',
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      encoding: false,
    };
    return config;
  },
}

module.exports = nextConfig




