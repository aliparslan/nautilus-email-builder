import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  reactCompiler: true,
  // Temporal's client ships gRPC/protobuf code that bundlers mangle; let Node load it directly.
  serverExternalPackages: ["@temporalio/client", "@temporalio/worker", "@temporalio/workflow"],
};

export default nextConfig;
