import { NextResponse } from 'next/server'
import { pg, USE_POSTGRES } from '@/lib/db-factory'
import crypto from 'crypto'

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
    const code = crypto.randomInt(100000, 999999).toString()
    
    // 存储验证码到数据库
    await pg.codes.set(phone, code)
    
    console.log('[发送验证码] 手机号:', phone, '验证码:', code)
    console.log('[发送验证码] 存储方式:', USE_POSTGRES ? 'PostgreSQL' : '内存')
    
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
