import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BingoTool - AI内容生成平台',
  description: '一键生成商品主图、种草文案、短视频脚本',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
