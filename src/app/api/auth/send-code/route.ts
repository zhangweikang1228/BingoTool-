import { NextResponse } from 'next/server'

// 模拟验证码存储（生产环境用Redis）
const codeStore = new Map()

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()
    
    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: '请输入正确的手机号' },
        { status: 400 }
      )
    }
    
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 存储验证码（5分钟有效期）
    codeStore.set(phone, {
      code,
      expires: Date.now() + 5 * 60 * 1000
    })
    
    // TODO: 实际发送短信
    console.log(`[模拟短信] 发送给 ${phone}，验证码：${code}`)
    
    return NextResponse.json({
      success: true,
      message: '验证码已发送'
    })
  } catch (error) {
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
