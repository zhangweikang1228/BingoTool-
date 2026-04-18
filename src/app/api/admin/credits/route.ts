import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

// 更新用户额度（需要管理员权限）
export async function PUT(request: Request) {
  // 检查管理员权限
  const { isAdmin, error } = await requireAdmin()
  if (!isAdmin) return error!
  
  try {
    const { userId, credits } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: '用户ID不能为空' },
        { status: 400 }
      )
    }
    
    const user = db.users.findById(userId)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }
    
    // 更新额度
    if (credits.image !== undefined) {
      db.users.setCredit(userId, 'image', credits.image)
    }
    if (credits.video !== undefined) {
      db.users.setCredit(userId, 'video', credits.video)
    }
    if (credits.text !== undefined) {
      db.users.setCredit(userId, 'text', credits.text)
    }
    if (credits.translate !== undefined) {
      db.users.setCredit(userId, 'translate', credits.translate)
    }
    
    return NextResponse.json({
      success: true,
      message: '额度更新成功'
    })
  } catch (error) {
    console.error('更新额度失败:', error)
    return NextResponse.json(
      { success: false, message: '更新失败' },
      { status: 500 }
    )
  }
}
