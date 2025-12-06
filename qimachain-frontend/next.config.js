/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' and distDir for development mode
  // Use standard .next directory to avoid trace file permission issues
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
