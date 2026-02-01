/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Ensure API routes are not prerendered
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
