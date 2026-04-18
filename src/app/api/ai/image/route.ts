import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '../../../../lib/ai'
import { requireAuth } from '@/lib/user-auth'

export async function POST(req: NextRequest) {
  // 检查用户认证
  const { isAuth, error } = await requireAuth()
  if (!isAuth) return error!
  
  try {
    const { imageUrl, angle } = await req.json()
    if (!imageUrl) return NextResponse.json({ error: '缺少图片' }, { status: 400 })

    const anglePrompts: Record<string, string> = {
      front: 'Front view of the product, centered, clean white background, professional e-commerce photography, high quality',
      side: 'Side view (90°), product facing right, clean white background, same product identity as reference photo',
      back: 'Back view, centered, clean white background, same product style as reference',
      angle45: '45-degree angle view, product slightly rotated, clean white background, professional e-commerce photo',
      top: 'Top-down overhead view, looking straight down at the product, clean white background',
      detail: 'Close-up macro detail view showing texture and quality, shallow depth of field, white background, premium feel',
    }

    const prompt = anglePrompts[angle] || anglePrompts.angle45
    const outputFile = `/tmp/bingo_${angle}_${Date.now()}.png`
    const url = await generateImage({ prompt, inputUrls: [imageUrl], outputFile, aspectRatio: '1:1' })
    return NextResponse.json({ success: true, url })
  } catch (e: unknown) {
    console.error('[AI Image] 错误:', e)
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
