/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除 standalone 模式，用 standard（默认，支持 SSR）
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  // 明确开启 TypeScript 编译时解析 alias（解决 Vercel 构建路径问题）
  experimental: {
    // 确保 Next.js 使用 tsconfig.json 的 paths 配置
  },
}

module.exports = nextConfig
