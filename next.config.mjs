import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/**",
      },
      {
        protocol: "https",
        hostname: "*.githubusercontent.com",
      },
    ],
  },
  turbopack: {
    // 明确 Turbopack 工作根目录，避免因其他 lockfile 误判
    root: __dirname,
  },
  // 排除 public/projects 目录，避免被包含到 serverless 函数中
  outputFileTracingExcludes: {
    "*": ["./public/projects/**/*"],
  },
}

export default nextConfig
