import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  // The authorized offline endpoint reads these guides in serverless deployments too.
  outputFileTracingIncludes: {
    "/api/learning/offline/*/files/*": [
      "./public/images/learning/modules/module-3-session-*.webp"
    ]
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }]
  }
};

export default nextConfig;
