import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

// 获取额度配置（需要管理员权限）
export async function GET() {
  // 检查管理员权限
  const { isAdmin, error } = await requireAdmin()
  if (!isAdmin) return error!
  
  try {
    const configs = db.creditConfigs.getAll()
    
    return NextResponse.json({
      success: true,
      configs
    })
  } catch (error) {
    console.error('获取配置失败:', error)
    return NextResponse.json(
      { success: false, message: '获取失败' },
      { status: 500 }
    )
  }
}

// 更新额度配置（需要管理员权限）
export async function PUT(request: Request) {
  // 检查管理员权限
  const { isAdmin, error } = await requireAdmin()
  if (!isAdmin) return error!
  
  try {
    const { type, cost } = await request.json()
    
    if (!type || cost === undefined) {
      return NextResponse.json(
        { success: false, message: '参数不完整' },
        { status: 400 }
      )
    }
    
    const success = db.creditConfigs.update(type, cost)
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: '配置类型不存在' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: '配置更新成功'
    })
  } catch (error) {
    console.error('更新配置失败:', error)
    return NextResponse.json(
      { success: false, message: '更新失败' },
      { status: 500 }
    )
  }
}
