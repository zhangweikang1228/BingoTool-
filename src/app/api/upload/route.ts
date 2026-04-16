import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '未找到文件，请选择要上传的图片' }, { status: 400 })
    }

    // 限制文件类型和大小（10MB）
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: '不支持的文件类型，请上传 JPG/PNG/WebP/GIF 图片' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '文件过大，请上传小于 10MB 的图片' }, { status: 400 })
    }

    // ⚠️ 注意：图片上传依赖内部API（uploadgate.minimaxi.com）
    // 当前部署环境（Vercel）无法访问该域名，因此暂不可用
    // 如需使用上传功能，请联系管理员配置可公网访问的上传服务
    return NextResponse.json({
      error: 'upload_unavailable',
      message: '图片上传功能当前环境暂时不可用',
      detail: '请联系管理员配置公网可访问的上传服务',
      hint: '可直接使用 /api/ai/image 接口通过 URL 生成图片，无需先上传',
    }, { status: 503 })
  } catch (e: unknown) {
    return NextResponse.json({ error: '服务端处理错误，请重试' }, { status: 500 })
  }
}
