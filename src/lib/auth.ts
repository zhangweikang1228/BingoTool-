/**
 * 自定义 JWT-free Auth 系统（轻量、零依赖）
 * 用 HMAC-SHA256 签名 + base64 cookie
 */
import { createHmac, randomBytes } from 'crypto'
import { cookies } from 'next/headers'

const SECRET   = process.env.NEXTAUTH_SECRET || 'bingo-tool-dev-secret-2024!'
const COOKIE   = 'bingo_session'
const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7天

export interface SessionUser {
  id:       string
  name:     string
  email:    string
  avatar?:  string
  plan:     'free' | 'pro'
  provider: 'github' | 'wechat' | 'email'
}

function sign(data: string): string {
  return createHmac('sha256', SECRET).update(data).digest('base64url')
}

export function encodeSession(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url')
  const sig     = sign(payload)
  return `${payload}.${sig}`
}

export function decodeSession(token: string): SessionUser | null {
  try {
    const [payload, sig] = token.split('.')
    if (!payload || !sig || sign(payload) !== sig) return null
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString()) as SessionUser
    return user
  } catch { return null }
}

// ─── GitHub OAuth ────────────────────────────────────────
export function getGithubAuthUrl(): string {
  const state = randomBytes(16).toString('hex')
  const params = new URLSearchParams({
    client_id:     process.env.GITHUB_CLIENT_ID     || '',
    redirect_uri: `${(process.env.NEXTAUTH_URL || 'http://localhost:3000')}/api/auth/github/callback`,
    scope:         'read:user user:email',
    state,
  })
  return `https://github.com/login/oauth/authorize?${params}&state=${state}`
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
    githubId:  String(gh.id),
    name:      gh.name || gh.login || 'GitHub User',
    email:     gh.email || `${gh.id}@github`,
    avatar:    gh.avatar_url,
    provider:  'github' as const,
  }
}

// ─── Session（App Router Server Component 用）────────────
export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE)?.value
  if (!token) return null
  return decodeSession(token)
}
