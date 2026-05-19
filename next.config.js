/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  async rewrites() {
    return [
      {
        // Proxy all Circle API calls through our server to avoid browser CORS restriction
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
