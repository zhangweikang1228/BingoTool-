import { NextRequest, NextResponse } from 'next/server'
import { getGithubAuthUrl, encodeSession } from '@/lib/auth'
import { getUserByGithubId, createUser } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, req.url))
  }
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', req.url))
  }

  try {
    // 1. 用 code 换 GitHub 用户信息
    const ghUser = await exchangeGithubCode(code)

    // 2. 查找或创建用户
    let user = getUserByGithubId(ghUser.githubId)
    if (!user) {
      user = createUser({
        name:     ghUser.name,
        email:    ghUser.email,
        avatar:   ghUser.avatar,
        provider: 'github',
        githubId: ghUser.githubId,
        plan:     'free',
      })
    }

    // 3. 生成签名 session token
    const token = encodeSession({
      id:       user.id,
      name:     user.name,
      email:    user.email,
      avatar:   user.avatar,
      plan:     user.plan,
      provider: 'github',
    })

    // 4. 写 cookie 并跳转
    const redirectUrl = new URL('/dashboard', req.url)
    const res = NextResponse.redirect(redirectUrl)
    res.cookies.set('bingo_session', token, {
      httpOnly:  true,
      secure:    process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60,
      path: '/',
    })
    return res
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'auth_failed'
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(msg)}`, req.url))
  }
}

async function exchangeGithubCode(code: string) {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method:  'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })
  const data = await res.json() as { access_token?: string; error?: string }
  if (!data.access_token) throw new Error(data.error || 'Token exchange failed')

  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${data.access_token}`, 'User-Agent': 'BingoTool' }
  })
  const gh = await userRes.json() as { id?: number; login?: string; name?: string; email?: string; avatar_url?: string }
  return { githubId: String(gh.id), name: gh.name || gh.login || 'GitHub User', email: gh.email || `${gh.id}@github`, avatar: gh.avatar_url }
}
