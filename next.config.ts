import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }]
  }
};

export default nextConfig;
