import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 模拟验证码存储（与 send-code 共享，生产环境用Redis）
const codeStore = new Map()

// 模拟用户数据
const users = new Map()

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json()
    
    // 验证手机号
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: '请输入正确的手机号' },
        { status: 400 }
      )
    }
    
    // 验证验证码
    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: '请输入6位验证码' },
        { status: 400 }
      )
    }
    
    // 检查验证码是否正确
    const stored = codeStore.get(phone)
    if (!stored || stored.code !== code) {
      return NextResponse.json(
        { error: '验证码错误' },
        { status: 401 }
      )
    }
    
    // 检查验证码是否过期
    if (Date.now() > stored.expires) {
      return NextResponse.json(
        { error: '验证码已过期' },
        { status: 401 }
      )
    }
    
    // 删除已使用的验证码
    codeStore.delete(phone)
    
    // 创建或获取用户
    if (!users.has(phone)) {
      users.set(phone, {
        id: `user_${Date.now()}`,
        phone,
        createdAt: new Date().toISOString()
      })
    }
    
    const user = users.get(phone)
    
    // 设置Cookie（简化版，生产环境用JWT）
    const cookieStore = await cookies()
    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7天
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
