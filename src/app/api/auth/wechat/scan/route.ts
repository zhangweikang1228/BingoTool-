import { NextRequest, NextResponse } from 'next/server'
import { getUserByWechatOpenId, createUser } from '../../../../../lib/db'
import { v4 as uuidv4 } from 'uuid'

const pendingScans: Record<string, { openid: string; nickname: string; avatar: string; createdAt: number }> = {}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  if (action === 'create') {
    const sessionId = uuidv4()
    // 真实环境：调用微信开放平台获取带参数的二维码
    // 演示模式：返回模拟二维码
    const wxAppId = process.env.WX_APP_ID || 'YOUR_WX_APP_ID'
    const redirectUri = encodeURIComponent(process.env.WX_REDIRECT_URI || 'http://localhost:3000/api/auth/wechat/callback')
    const qrUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${wxAppId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${sessionId}#wechat_redirect`
    return NextResponse.json({ sessionId, qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}` })
  }
  if (action === 'poll') {
    const sessionId = searchParams.get('sessionId')
    if (!sessionId || !pendingScans[sessionId]) return NextResponse.json({ status: 'waiting' })
    const scan = pendingScans[sessionId]
    if (Date.now() - scan.createdAt > 300000) { delete pendingScans[sessionId]; return NextResponse.json({ status: 'expired' }) }
    let user = getUserByWechatOpenId(scan.openid)
    if (!user) user = createUser({ name: scan.nickname, email: `${scan.openid}@wechat`, avatar: scan.avatar, provider: 'wechat', wechatOpenId: scan.openid })
    delete pendingScans[sessionId]
    return NextResponse.json({ status: 'confirmed', user: { id: user.id, name: user.name, avatar: user.avatar } })
  }
  return NextResponse.json({ error: 'invalid action' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const { sessionId, openid, nickname, avatar } = await req.json()
  if (!sessionId || !openid) return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  pendingScans[sessionId] = { openid, nickname: nickname || '微信用户', avatar: avatar || '', createdAt: Date.now() }
  return NextResponse.json({ status: 'ok' })
}
