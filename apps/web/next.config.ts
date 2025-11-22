import type { NextConfig } from "next";

const transpilePackages = [
  process.env.NEXT_PUBLIC_HELLO_WORLD_BINDING || "",
  process.env.NEXT_PUBLIC_INCREMENT_BINDING || "",
  process.env.NEXT_PUBLIC_POD_POAP_BINDING || "",
  // Explicitly include pod_poap package to ensure it's bundled in production
  "pod_poap",
  "donation",
].filter(Boolean) as string[];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  transpilePackages,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "design-system.stellar.org",
      },
    ],
  },
};

export default nextConfig;
