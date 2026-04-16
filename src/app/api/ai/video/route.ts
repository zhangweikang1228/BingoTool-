import { NextRequest, NextResponse } from 'next/server'
import { generateProductVideo } from '../../../../lib/ai'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const apiKey = process.env.MINIMAX_API_KEY || process.env.NEXT_PUBLIC_MINIMAX_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'MINIMAX_API_KEY 未配置' }, { status: 503 })
  try {
    const { imageUrl, duration } = await req.json()
    if (!imageUrl) return NextResponse.json({ error: '缺少商品图片URL' }, { status: 400 })
    const result = await generateProductVideo(imageUrl, apiKey, duration || 6)
    return NextResponse.json({ success: true, url: result.url })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '生成失败，请重试'
    console.error('[AI Video]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
