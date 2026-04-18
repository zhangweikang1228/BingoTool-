/**
 * 自定义轻量级 Session 系统
 * Token = base64(userId:timestamp) ，带 HTTP-only Cookie 防 XSS
 */
import { cookies } from 'next/headers'

const COOKIE_NAME = 'b_session'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7天

export interface SessionUser {
  id:       string
  name:     string
  email:    string
  avatar?:  string
  plan:     'free' | 'pro'
  provider: string
}

// ─── 核心：编码/解码 session token ─────────────────────────
function encodeToken(id: string): string {
  // 使用 btoa（浏览器兼容的 base64编码）
  return Buffer.from(`${id}:${Date.now()}`).toString('base64url')
}

function decodeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const [id] = decoded.split(':')
    if (!id || id.length < 4) return null
    return id
  } catch { return null }
}

// ─── Session（从 cookie 读取 userId，再查 DB）─────────
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    
    const id = decodeToken(token)
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
  return encodeToken(userId)
}

// ─── 清除 Session ───────────────────────────────────
export async function clearSession(): Promise<void> {
  // Cookie 清除由调用方处理
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

// ─── 密码哈希工具（使用 PBKDF2）─────────────────────
// 使用 Node.js 的 crypto 模块
import crypto from 'crypto'

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const useSalt = salt || crypto.randomBytes(16).toString('hex')
  // 使用同步 PBKDF2（需要 Node.js 环境）
  const hash = crypto.pbkdf2Sync(password, useSalt, 100000, 64, 'sha512').toString('hex')
  return { hash, salt: useSalt }
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const { hash: computedHash } = hashPassword(password, salt)
    // 使用 timingSafeEqual 防止时序攻击
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'))
  } catch {
    return false
  }
}
