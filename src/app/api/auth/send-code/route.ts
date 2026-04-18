import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()
    
    if (!phone || phone.length !== 11) {
      return NextResponse.json(
        { success: false, message: '请输入正确的11位手机号' },
        { status: 400 }
      )
    }
    
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 存储验证码
    db.codes.set(phone, code)
    
    // 在实际环境中，这里应该调用短信服务商API发送验证码
    // 例如：阿里云、腾讯云等
    console.log(`[验证码] 手机号: ${phone.substring(0,3)}****, 验证码: ${code}`)
    
    return NextResponse.json({
      success: true,
      message: '验证码已发送'
    })
  } catch (error) {
    console.error('发送验证码失败:', error)
    return NextResponse.json(
      { success: false, message: '发送失败，请重试' },
      { status: 500 }
    )
  }
}
