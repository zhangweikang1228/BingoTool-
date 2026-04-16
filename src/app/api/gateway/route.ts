import { NextRequest, NextResponse } from 'next/server'
import { findApiKey, checkRateLimit } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({ service: 'BingoTool API', version: '1.0', docs: '/api/docs' })
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')
  const ip   = req.headers.get('x-forwarded-for') || req.ip || 'unknown'
  const ua   = req.headers.get('user-agent') || ''

  if (!apiKey) return NextResponse.json({ error: '缺少 API Key，请添加 Header: x-api-key: your_key' }, { status: 401 })

  const found = findApiKey(apiKey)
  if (!found) return NextResponse.json({ error: '无效的 API Key' }, { status: 403 })

  const { user, apiKey: keyMeta } = found
  const { allowed, remaining } = checkRateLimit(user)

  if (!allowed) {
    return NextResponse.json({
      error: '今日额度已用完',
      code: 'RATE_LIMIT_EXCEEDED',
      remaining: 0,
      detail: '免费额度：图片20次/天，文案50次/天，视频5次/天'
    }, { status: 429 })
  }

  return NextResponse.json({
    allowed: true,
    remaining,
    user: { id: user.id, name: user.name, plan: user.plan },
    apiKey: { id: keyMeta.id, name: keyMeta.name },
  })
}
