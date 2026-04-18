import { NextRequest, NextResponse } from 'next/server'

// 演示模式 - 接受任意非空凭证
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, phone, password, code, mode } = body

    // 演示模式：简单的验证
    if (mode === 'login') {
      if (email && password && password.length >= 8) {
        // 登录成功，设置 cookie
        const response = NextResponse.json({ success: true })
        response.cookies.set('session', Buffer.from(`${email}:${Date.now()}`).toString('base64'), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 天
          path: '/',
        })
        return response
      }
      if (phone && code) {
        // 手机验证码登录
        const response = NextResponse.json({ success: true })
        response.cookies.set('session', Buffer.from(`phone:${phone}:${Date.now()}`).toString('base64'), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
        return response
      }
    }

    if (mode === 'register') {
      if (email && password && password.length >= 8) {
        const response = NextResponse.json({ success: true })
        response.cookies.set('session', Buffer.from(`${email}:${Date.now()}`).toString('base64'), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
        return response
      }
    }

    return NextResponse.json({ success: false, message: '请填写完整信息' }, { status: 400 })
  } catch {
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 })
  }
}
