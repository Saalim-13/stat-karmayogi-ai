import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep standalone tracing scoped to this app; another unrelated lockfile exists
  // higher in the user's home directory.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
