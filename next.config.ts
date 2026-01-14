import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Turbopack is the default in Next.js 16
  turbopack: {},
  // Exclude pdf-parse test files from bundling
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
