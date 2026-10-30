import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  logging: { incomingRequests: false },
};

export default nextConfig;
