/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      '/api/analyze': ['.env']
    }
  }
}

module.exports = nextConfig
