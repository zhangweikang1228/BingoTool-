import { NextRequest, NextResponse } from 'next/server'
import { llmTask } from '../../../../lib/ai'
import { requireAuth } from '@/lib/user-auth'

export async function POST(req: NextRequest) {
  // 检查用户认证
  const { isAuth, error } = await requireAuth()
  if (!isAuth) return error!
  
  try {
    const { product, platform } = await req.json()
    if (!product?.trim()) return NextResponse.json({ error: '商品描述不能为空' }, { status: 400 })

    const prompts: Record<string, string> = {
      xiaohongshu: `你是一位专业的小红书种草文案博主，擅长写有感染力的商品推荐文案。\n\n要求：\n- 开头有代入感的生活场景切入\n- 产品卖点融入真实体验，不生硬\n- 结尾有互动引导（收藏/点赞/评论）\n- 适当用emoji，每段不长\n- 字数300-500字\n\n商品信息：${product}`,
      douyin: `你是一位抖音带货主播，擅长写有节奏感、冲动消费型的带货脚本。\n\n要求：\n- 前3秒必须抓眼球（疑问句/冲突场景/数字）\n- 痛点+解决方案结构\n- 多次重复核心卖点，制造记忆点\n- 结尾促单话术\n- 配合字幕标注和镜头建议\n- 字数400-600字\n\n商品信息：${product}`,
      weibo: `你是一位生活方式类微博博主，擅长写自然种草的长图文。\n\n要求：\n- 轻松第一人称分享口吻\n- 图文结合，有层次感\n- 植入自然，不像硬广告\n- 适当带话题标签 #好物推荐 #种草\n- 字数200-400字\n\n商品信息：${product}`,
    }

    const prompt = prompts[platform] || prompts.xiaohongshu
    const text = await llmTask(prompt, 2000)
    return NextResponse.json({ success: true, text })
  } catch (e: unknown) {
    console.error('[AI Copy] 错误:', e)
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
