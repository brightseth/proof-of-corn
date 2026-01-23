import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable system TLS certificates for Google Fonts (fixes build TLS errors)
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;
