import type { NextConfig } from "next";
import path from "path";

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
  webpack: (config, { isServer }) => {
    // Configure webpack to properly resolve pod_poap and donation packages
    if (isServer) {
      // For server-side, ensure the packages can be resolved
      const podPoapPath = path.resolve(
        __dirname,
        "../../contracts/packages/pod_poap/dist/index.js"
      );
      const donationPath = path.resolve(
        __dirname,
        "../../contracts/packages/donation/dist/index.js"
      );

      config.resolve.alias = {
        ...config.resolve.alias,
        pod_poap: podPoapPath,
        donation: donationPath,
      };

      // Ensure webpack can resolve these modules
      config.resolve.modules = [
        ...(config.resolve.modules || []),
        path.resolve(__dirname, "../../contracts/packages"),
        path.resolve(__dirname, "node_modules"),
      ];
    }

    // Allow dynamic imports for these packages
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    return config;
  },
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
