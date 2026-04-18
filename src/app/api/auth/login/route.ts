import { NextRequest, NextResponse } from 'next/server'
import { db, verificationCodes } from '@/lib/db'
import { pg, USE_POSTGRES } from '@/lib/db-factory'
import { setSession } from '@/lib/auth'
import { hashPassword } from '@/lib/auth'
import crypto from 'crypto'

const COOKIE_NAME = 'b_session'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, phone, password, code, mode } = body

    console.log('[Auth Login] 请求:', { mode, hasEmail: !!email, hasPhone: !!phone, hasCode: !!code, usePostgres: USE_POSTGRES })

    if (mode === 'login') {
      // 邮箱登录
      if (email && password) {
        // 尝试从数据库查找用户
        let user = null
        if (USE_POSTGRES) {
          user = await pg.users.findByEmail(email)
        } else {
          user = db.users.findByEmail(email)
        }
        
        if (user && user.passwordHash) {
          // 验证密码
          const isValid = verifyUserPassword(password, user.passwordHash)
          if (isValid) {
            // 登录成功
            const token = await setSession(user.id)
            const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
            response.cookies.set(COOKIE_NAME, token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7,
              path: '/',
            })
            return response
          }
        }
        return NextResponse.json({ success: false, message: '账号或密码错误' }, { status: 401 })
      }
      
      // 手机验证码登录
      if (phone && code) {
        console.log('[Auth Login] 手机验证码登录, 手机:', phone, '验证码:', code)
        
        // 验证验证码
        let isValidCode = false
        if (USE_POSTGRES) {
          isValidCode = await pg.codes.verify(phone, code)
        } else {
          const storedData = verificationCodes.get(phone)
          if (storedData && Date.now() <= storedData.expires && storedData.code === code) {
            verificationCodes.delete(phone)
            isValidCode = true
          }
        }
        
        if (!isValidCode) {
          console.log('[Auth Login] 验证码验证失败')
          return NextResponse.json({ success: false, message: '验证码错误或已过期' }, { status: 400 })
        }
        
        // 查找或创建用户
        let user = null
        if (USE_POSTGRES) {
          user = await pg.users.findByPhone(phone)
          if (!user) {
            user = await pg.users.create({
              phone,
              passwordHash: '',
              role: 'user',
              plan: 'free',
            })
          }
        } else {
          user = db.users.findByPhone(phone)
          if (!user) {
            user = db.users.create({
              phone,
              passwordHash: '',
              role: 'user',
              plan: 'free',
              credits: { image: 100, video: 50, text: 200, translate: 200 }
            })
          }
        }
        
        // 设置 session
        const token = await setSession(user!.id)
        const response = NextResponse.json({ success: true, user: { id: user!.id, name: user!.name, phone: user!.phone } })
        response.cookies.set(COOKIE_NAME, token, {
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
      // 手机号 + 验证码注册
      if (phone && code) {
        console.log('[Auth Register] 手机号注册, 手机:', phone)
        
        // 验证验证码
        let isValidCode = false
        if (USE_POSTGRES) {
          isValidCode = await pg.codes.verify(phone, code)
        } else {
          const storedData = verificationCodes.get(phone)
          if (storedData && Date.now() <= storedData.expires && storedData.code === code) {
            verificationCodes.delete(phone)
            isValidCode = true
          }
        }
        
        if (!isValidCode) {
          return NextResponse.json({ success: false, message: '验证码错误或已过期' }, { status: 400 })
        }
        
        // 检查手机号是否已注册
        let existingUser = null
        if (USE_POSTGRES) {
          existingUser = await pg.users.findByPhone(phone)
        } else {
          existingUser = db.users.findByPhone(phone)
        }
        
        if (existingUser) {
          return NextResponse.json({ success: false, message: '该手机号已注册，请直接登录' }, { status: 400 })
        }
        
        // 创建新用户
        let user = null
        const hashedPassword = password ? hashPassword(password, crypto.randomBytes(16).toString('hex')).hash : ''
        
        if (USE_POSTGRES) {
          user = await pg.users.create({
            phone,
            passwordHash: hashedPassword,
            role: 'user',
            plan: 'free',
          })
        } else {
          user = db.users.create({
            phone,
            passwordHash: hashedPassword,
            role: 'user',
            plan: 'free',
            credits: { image: 100, video: 50, text: 200, translate: 200 }
          })
        }
        
        // 设置 session
        const token = await setSession(user!.id)
        const response = NextResponse.json({ success: true, user: { id: user!.id, name: user!.name, phone: user!.phone } })
        response.cookies.set(COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
        return response
      }
      
      // 邮箱 + 密码注册
      if (email && password) {
        // 检查邮箱是否已注册
        let existingUser = null
        if (USE_POSTGRES) {
          existingUser = await pg.users.findByEmail(email)
        } else {
          existingUser = db.users.findByEmail(email)
        }
        
        if (existingUser) {
          return NextResponse.json({ success: false, message: '该邮箱已被注册' }, { status: 400 })
        }
        
        // 创建新用户
        const salt = crypto.randomBytes(16).toString('hex')
        const { hash } = hashPassword(password, salt)
        
        let user = null
        if (USE_POSTGRES) {
          user = await pg.users.create({
            email,
            passwordHash: hash,
            role: 'user',
            plan: 'free',
          })
        } else {
          user = db.users.create({
            email,
            passwordHash: hash,
            role: 'user',
            plan: 'free',
            credits: { image: 100, video: 50, text: 200, translate: 200 }
          })
        }
        
        // 设置 session
        const token = await setSession(user!.id)
        const response = NextResponse.json({ success: true, user: { id: user!.id, name: user!.name, email: user!.email } })
        response.cookies.set(COOKIE_NAME, token, {
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
  } catch (error) {
    console.error('[Auth Login] 错误:', error)
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 })
  }
}

// 简单的密码验证（开发模式）
function verifyUserPassword(password: string, storedHash: string): boolean {
  return storedHash === password || storedHash.length === 0
}
