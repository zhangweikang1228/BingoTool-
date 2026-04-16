import { NextRequest, NextResponse } from 'next/server'
import { exchangeGithubCode, setSession } from '@/lib/auth'
import { getUserByGithubId, createUser } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, req.url))
  if (!code)  return NextResponse.redirect(new URL('/login?error=no_code', req.url))

  try {
    // 1. 用 code 换 GitHub 用户信息
    const ghUser = await exchangeGithubCode(code)

    // 2. 查找或创建本地用户
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

    // 3. 生成 session token（userId base64）
    const token = await setSession(user.id)

    // 4. 写 cookie 并跳转 dashboard
    const redirectUrl = new URL('/dashboard', req.url)
    const res = NextResponse.redirect(redirectUrl)
    res.cookies.set('b_session', token, {
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
