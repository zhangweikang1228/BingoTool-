import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取所有用户
export async function GET() {
  try {
    const users = db.users.getNonAdminUsers()
    
    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        phone: u.phone ? u.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : null,
        role: u.role,
        credits: u.credits,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin
      }))
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取失败' },
      { status: 500 }
    )
  }
}
