/**
 * 管理员权限验证工具
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ADMIN_COOKIE = 'is_admin'

/**
 * 检查请求是否来自已登录的管理员
 */
export async function requireAdmin(): Promise<{ isAdmin: boolean; error?: NextResponse }> {
  try {
    const cookieStore = cookies()
    const adminCookie = cookieStore.get(ADMIN_COOKIE)
    
    if (!adminCookie || !adminCookie.value) {
      return {
        isAdmin: false,
        error: NextResponse.json(
          { success: false, message: '未授权访问' },
          { status: 401 }
        )
      }
    }
    
    // 在生产环境中，应该验证 session token 是否有效
    // 这里仅检查 cookie 存在性
    if (process.env.NODE_ENV === 'production') {
      // 生产环境应该有一个有效的会话存储来验证 token
      // 目前简化为检查 cookie 存在性
    }
    
    return { isAdmin: true }
  } catch (error) {
    console.error('[Admin Auth] 验证失败:', error)
    return {
      isAdmin: false,
      error: NextResponse.json(
        { success: false, message: '认证检查失败' },
        { status: 500 }
      )
    }
  }
}
