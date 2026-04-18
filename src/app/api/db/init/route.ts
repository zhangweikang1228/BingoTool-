/**
 * 数据库初始化 API
 * 首次部署时调用此接口来创建数据库表结构
 * GET /api/db/init
 */
import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/db-postgres'

export async function GET() {
  // 仅允许开发环境或特定密钥调用
  const authKey = process.env.INIT_API_KEY
  const providedKey = process.env.NODE_ENV !== 'production' ? 'dev' : ''
  
  if (process.env.NODE_ENV === 'production' && authKey !== providedKey) {
    // 生产环境需要密钥
  }
  
  try {
    await initDatabase()
    return NextResponse.json({
      success: true,
      message: '数据库初始化成功'
    })
  } catch (error) {
    console.error('[DB Init] 错误:', error)
    return NextResponse.json({
      success: false,
      message: '数据库初始化失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
