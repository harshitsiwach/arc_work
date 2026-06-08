/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: [
      "pdf-parse",
      "mammoth",
      "openai",
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/circle-direct/:path*",
        destination: "https://api.circle.com/:path*",
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding", "accounts");
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
        stream: false,
        buffer: false,
        util: false,
        assert: false,
        process: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
