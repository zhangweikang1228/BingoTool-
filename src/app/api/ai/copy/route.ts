import { NextRequest, NextResponse } from 'next/server'
import { generateCopy } from '../../../../lib/ai'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const apiKey = process.env.MINIMAX_API_KEY || process.env.NEXT_PUBLIC_MINIMAX_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'MINIMAX_API_KEY 未配置，请联系管理员设置环境变量' },
      { status: 503 }
    )
  }

  try {
    const { product, platform } = await req.json()

    if (!product?.trim()) {
      return NextResponse.json({ error: '商品描述不能为空' }, { status: 400 })
    }

    if (!['xiaohongshu', 'douyin', 'weibo'].includes(platform)) {
      return NextResponse.json({ error: '不支持的平台类型' }, { status: 400 })
    }

    const result = await generateCopy(product.trim(), platform, apiKey)
    return NextResponse.json({ success: true, text: result.text })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '生成失败，请重试'
    console.error('[AI Copy]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
