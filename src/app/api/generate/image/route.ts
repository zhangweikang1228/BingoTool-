import { NextResponse } from 'next/server'

// 模拟AI图片生成
export async function POST(request: Request) {
  try {
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 返回随机图片（实际项目会调用AI绘图API）
    const imageUrl = `https://picsum.photos/800/600?random=${Date.now()}`
    
    return NextResponse.json({
      success: true,
      url: imageUrl
    })
  } catch (error) {
    return NextResponse.json(
      { error: '生成失败' },
      { status: 500 }
    )
  }
}
