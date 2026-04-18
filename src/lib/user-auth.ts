/**
 * 用户认证验证工具
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getSession } from './auth'

const SESSION_COOKIE = 'b_session'

/**
 * 检查请求是否来自已登录的用户
 */
export async function requireAuth(): Promise<{ isAuth: boolean; userId?: string; error?: NextResponse }> {
  try {
    const session = await getSession()
    
    if (!session) {
      return {
        isAuth: false,
        error: NextResponse.json(
          { success: false, message: '请先登录' },
          { status: 401 }
        )
      }
    }
    
    return { isAuth: true, userId: session.id }
  } catch (error) {
    console.error('[User Auth] 验证失败:', error)
    return {
      isAuth: false,
      error: NextResponse.json(
        { success: false, message: '认证检查失败' },
        { status: 500 }
      )
    }
  }
}

/**
 * 可选的认证检查（不强制要求登录）
 */
export async function getOptionalAuth(): Promise<{ isAuth: boolean; userId?: string }> {
  try {
    const session = await getSession()
    if (!session) {
      return { isAuth: false }
    }
    return { isAuth: true, userId: session.id }
  } catch (error) {
    console.error('[User Auth] 获取会话失败:', error)
    return { isAuth: false }
  }
}
