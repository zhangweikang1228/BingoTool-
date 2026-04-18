import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { db } from '@/lib/db'
import crypto from 'crypto'

// 管理员凭证从环境变量读取
function getAdminCredentials(): { email: string; hash: string; salt: string } | null {
  const email = process.env.ADMIN_EMAIL
  const hash = process.env.ADMIN_PASSWORD_HASH
  const salt = process.env.ADMIN_PASSWORD_SALT
  
  // 生产环境必须有完整配置
  if (process.env.NODE_ENV === 'production') {
    if (!email || !hash || !salt) {
      console.error('[Admin Auth] 警告：生产环境缺少管理员环境变量配置')
      return null
    }
    return { email, hash, salt }
  }
  
  // 开发环境使用环境变量或默认配置
  if (email && hash && salt) {
    return { email, hash, salt }
  }
  
  // 开发环境默认配置（仅用于本地开发！）
  const devSalt = 'dev-salt-do-not-use-in-production'
  const { hash: devHash } = hashPassword('admin123', devSalt)
  return { email: 'admin@bingotool.com', hash: devHash, salt: devSalt }
}

// 初始化默认管理员（开发模式）
function initDevAdmin() {
  const devSalt = 'dev-salt-do-not-use-in-production'
  const { hash } = hashPassword('admin123', devSalt)
  
  const existingAdmin = db.users.findByEmail('admin@bingotool.com')
  if (!existingAdmin) {
    db.users.create({
      email: 'admin@bingotool.com',
      passwordHash: hash,
      name: 'Admin',
      role: 'admin',
      plan: 'pro',
      credits: { image: 999999, video: 999999, text: 999999, translate: 999999 }
    })
    console.log('[Admin] 开发模式管理员已初始化: admin@bingotool.com / admin123')
  }
}

// 开发模式初始化
if (process.env.NODE_ENV !== 'production') {
  initDevAdmin()
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ success: false, message: '请输入账号和密码' }, { status: 400 })
    }
    
    const credentials = getAdminCredentials()
    if (!credentials) {
      return NextResponse.json({ success: false, message: '服务器未配置管理员账号' }, { status: 500 })
    }
    
    // 验证管理员凭证
    const user = db.users.findByEmail(email)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: '管理员账号或密码错误' }, { status: 401 })
    }
    
    // 验证密码
    const isValid = user.passwordHash && verifyPassword(password, user.passwordHash, credentials.salt)
    if (!isValid) {
      return NextResponse.json({ success: false, message: '管理员账号或密码错误' }, { status: 401 })
    }
    
    // 更新最后登录时间
    db.users.update(user.id, { lastLogin: new Date() })
    
    // 生成安全的会话标识
    const sessionToken = crypto.randomBytes(32).toString('hex')
    
    const response = NextResponse.json({ success: true, message: '登录成功' })
    response.cookies.set('is_admin', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 小时
      path: '/',
    })
    return response
  } catch (error) {
    console.error('[Admin Login] 错误:', error)
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: '已退出登录' })
  response.cookies.set('is_admin', '', { maxAge: 0, path: '/' })
  return response
}
