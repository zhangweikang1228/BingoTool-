import { NextResponse } from 'next/server'

// 模拟AI文案生成
const generateCopy = (productInfo: string, platform: string, tone: string): string => {
  const platformNames: Record<string, string> = {
    'xiaohongshu': '小红书',
    'douyin': '抖音',
    'wechat': '微信公众号',
    'weibo': '微博'
  }
  
  const toneStyles: Record<string, { emoji: string; style: string }> = {
    'casual': { emoji: '✨', style: '轻松活泼，适合年轻人' },
    'professional': { emoji: '📌', style: '专业严谨，适合功能性产品' },
    'emotional': { emoji: '💕', style: '情感共鸣，适合情感类消费' }
  }
  
  const pName = platformNames[platform] || '社交媒体'
  const tStyle = toneStyles[tone] || toneStyles['casual']
  
  // 简单的文案生成逻辑
  const copy = `【${pName}种草文案】

${tStyle.emoji} ${tStyle.style} ${tStyle.emoji}

${productInfo}

---
💰 产品亮点：

✨ 设计精美，颜值担当
✨ 品质卓越，值得信赖  
✨ 性价比高，超值之选

📍 使用场景：
适合日常使用，送礼自用两相宜

👍 用户好评：
"用了之后真的爱上了！"
"品质超预期，会回购！"

🏷️ 热门标签：
#好物推荐 #种草 #必买清单 #生活好物

📢 赶紧入手吧，点击下方链接查看详情！`

  return copy
}

export async function POST(request: Request) {
  try {
    const { productInfo, platform, tone } = await request.json()
    
    if (!productInfo) {
      return NextResponse.json(
        { error: '请输入商品信息' },
        { status: 400 }
      )
    }
    
    // 模拟AI处理时间
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const text = generateCopy(productInfo, platform || 'xiaohongshu', tone || 'casual')
    
    return NextResponse.json({
      success: true,
      text
    })
  } catch (error) {
    return NextResponse.json(
      { error: '生成失败' },
      { status: 500 }
    )
  }
}
