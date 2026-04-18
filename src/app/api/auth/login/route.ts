import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email, phone, password, code, mode } = await request.json()
    
    if (mode === 'register') {
      // 注册逻辑
      if (email) {
        // 邮箱注册
        if (!password || password.length < 8) {
          return NextResponse.json(
            { success: false, message: '密码至少8位' },
            { status: 400 }
          )
        }
        
        // 检查邮箱是否已存在
        const existingUser = db.users.findByEmail(email)
        if (existingUser) {
          return NextResponse.json(
            { success: false, message: '该邮箱已被注册' },
            { status: 400 }
          )
        }
        
        // 创建新用户
        const newUser = db.users.create({
          email,
          password,
          role: 'user',
          credits: { image: 100, video: 50, text: 200, translate: 200 }
        })
        
        // 直接登录成功，返回用户信息
        return NextResponse.json({
          success: true,
          message: '注册成功',
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            credits: newUser.credits
          }
        })
      } else if (phone) {
        // 手机注册
        if (!code) {
          return NextResponse.json(
            { success: false, message: '请输入验证码' },
            { status: 400 }
          )
        }
        
        // 验证验证码
        if (!db.codes.verify(phone, code)) {
          return NextResponse.json(
            { success: false, message: '验证码错误或已过期' },
            { status: 400 }
          )
        }
        
        // 检查手机号是否已存在
        const existingUser = db.users.findByPhone(phone)
        if (existingUser) {
          return NextResponse.json(
            { success: false, message: '该手机号已被注册' },
            { status: 400 }
          )
        }
        
        if (!password || password.length < 8) {
          return NextResponse.json(
            { success: false, message: '密码至少8位' },
            { status: 400 }
          )
        }
        
        // 创建新用户
        const newUser = db.users.create({
          phone,
          password,
          role: 'user',
          credits: { image: 100, video: 50, text: 200, translate: 200 }
        })
        
        return NextResponse.json({
          success: true,
          message: '注册成功',
          user: {
            id: newUser.id,
            phone: newUser.phone,
            role: newUser.role,
            credits: newUser.credits
          }
        })
      }
    } else {
      // 登录逻辑
      if (email) {
        // 邮箱登录
        const user = db.users.findByEmail(email)
        if (!user) {
          return NextResponse.json(
            { success: false, message: '账号或密码错误' },
            { status: 401 }
          )
        }
        
        if (user.password !== password) {
          return NextResponse.json(
            { success: false, message: '账号或密码错误' },
            { status: 401 }
          )
        }
        
        // 更新最后登录时间
        db.users.update(user.id, { lastLogin: new Date() })
        
        return NextResponse.json({
          success: true,
          message: '登录成功',
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            credits: user.credits
          }
        })
      } else if (phone) {
        // 手机登录
        if (!code) {
          return NextResponse.json(
            { success: false, message: '请输入验证码' },
            { status: 400 }
          )
        }
        
        // 验证验证码
        if (!db.codes.verify(phone, code)) {
          return NextResponse.json(
            { success: false, message: '验证码错误或已过期' },
            { status: 400 }
          )
        }
        
        const user = db.users.findByPhone(phone)
        if (!user) {
          return NextResponse.json(
            { success: false, message: '该手机号未注册' },
            { status: 401 }
          )
        }
        
        // 更新最后登录时间
        db.users.update(user.id, { lastLogin: new Date() })
        
        return NextResponse.json({
          success: true,
          message: '登录成功',
          user: {
            id: user.id,
            phone: user.phone,
            role: user.role,
            credits: user.credits
          }
        })
      }
    }
    
    return NextResponse.json(
      { success: false, message: '参数错误' },
      { status: 400 }
    )
  } catch (error) {
    console.error('登录失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}
