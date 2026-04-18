import { NextRequest, NextResponse } from 'next/server'
import { generateVideo } from '../../../../lib/ai'
import { requireAuth } from '@/lib/user-auth'

export async function POST(req: NextRequest) {
  // 检查用户认证
  const { isAuth, error } = await requireAuth()
  if (!isAuth) return error!
  
  try {
    const { imageUrl, prompt, duration } = await req.json()
    if (!imageUrl) return NextResponse.json({ error: '缺少图片' }, { status: 400 })

    const defaultPrompt = 'Product showcase video, rotating view, professional e-commerce style, clean background'
    const outputFile = `/tmp/bingo_video_${Date.now()}.mp4`
    const url = await generateVideo({
      prompt: prompt || defaultPrompt,
      imageFile: imageUrl,
      outputFile,
      duration: duration || 6,
    })
    return NextResponse.json({ success: true, url })
  } catch (e: unknown) {
    console.error('[AI Video] 错误:', e)
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
