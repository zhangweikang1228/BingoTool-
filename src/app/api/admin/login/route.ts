import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// 管理员密码应从环境变量读取，禁止硬编码！
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bingotool.com'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 
  // 默认值仅用于开发环境，生产必须设置环境变量
  // 哈希算法：SHA256(密码 + 盐)
  // admin123 的示例哈希（仅开发用）
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'

// 简单的哈希验证（生产环境建议使用 bcrypt）
function verifyPassword(password: string, hash: string, salt = ''): boolean {
  const computed = crypto.createHash('sha256').update(password + salt).digest('hex')
  return computed === hash
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ success: false, message: '请输入账号和密码' }, { status: 400 })
    }
    
    // 从环境变量读取并验证
    if (email === ADMIN_EMAIL && verifyPassword(password, ADMIN_PASSWORD_HASH)) {
      const response = NextResponse.json({ success: true })
      response.cookies.set('is_admin', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 小时
        path: '/',
      })
      return response
    }
    
    return NextResponse.json({ success: false, message: '管理员账号或密码错误' }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.set('is_admin', '', { maxAge: 0, path: '/' })
  return response
}
