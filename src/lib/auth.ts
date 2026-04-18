/**
 * 自定义轻量级 Session 系统
 * Token = base64(userId) ，纯 HTTP Cookie，不依赖任何 JWT 库
 */
import { cookies } from 'next/headers'

const COOKIE   = 'b_session'
const EXPIRY   = 7 * 24 * 60 * 60 // 7天

export interface SessionUser {
  id:       string
  name:     string
  email:    string
  avatar?:  string
  plan:     'free' | 'pro'
  provider: string
}

// ─── 核心：编码/解码 userId ─────────────────────────────
function encodeId(id: string): string {
  return Buffer.from(id).toString('base64url')
}

function decodeId(token: string): string | null {
  try {
    const id = Buffer.from(token, 'base64url').toString()
    if (!id || id.length < 4) return null
    return id
  } catch { return null }
}

// ─── Session（从 cookie 读取 userId，再查 DB）─────────
export async function getSession(): Promise<SessionUser | null> {
  try {
    const token = cookies().get(COOKIE)?.value
    if (!token) return null
    const id = decodeId(token)
    if (!id) return null
    // 懒加载避免循环依赖
    const { getUserById } = await import('./db')
    const user = getUserById(id)
    if (!user) return null
    return {
      id: user.id,
      name: user.name || user.email || 'User',
      email: user.email || '',
      avatar: user.avatar,
      plan: user.plan,
      provider: user.provider || 'local',
    }
  } catch { return null }
}

// ─── 生成 Session cookie（登录后调用）──────────────
export async function setSession(userId: string): Promise<string> {
  return encodeId(userId)
}

// ─── GitHub OAuth ─────────────────────────────────────
import { randomBytes } from 'crypto'

export function getGithubAuthUrl(): string {
  const state = randomBytes(16).toString('hex')
  const params = new URLSearchParams({
    client_id:     process.env.GITHUB_CLIENT_ID     || '',
    redirect_uri: `${(process.env.NEXTAUTH_URL || 'http://localhost:3000')}/api/auth/github/callback`,
    scope:         'read:user user:email',
    state,
  })
  return `https://github.com/login/oauth/authorize?${params}`
}

export async function exchangeGithubCode(code: string) {
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
  return {
    githubId: String(gh.id),
    name:     gh.name || gh.login || 'GitHub User',
    email:    gh.email || `${gh.id}@github`,
    avatar:   gh.avatar_url,
    provider: 'github',
  }
}
