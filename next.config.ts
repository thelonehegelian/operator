import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for matrix-js-sdk multiple entrypoints issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Ensure matrix-js-sdk is treated as external on server side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("matrix-js-sdk");
    }

    return config;
  },

  // Disable static optimization for pages that use Matrix SDK
  experimental: {
    esmExternals: "loose",
  },
};

export default nextConfig;
