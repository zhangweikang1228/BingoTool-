/**
 * 轻量级数据存储（生产环境建议换 PostgreSQL/MySQL）
 * 所有数据存储在 /tmp/billing_*.json
 */
import fs from 'fs'
import path from 'path'

const DATA_DIR = '/tmp/billing'
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

function getFile(name: string): any {
  const file = path.join(DATA_DIR, `${name}.json`)
  if (!fs.existsSync(file)) return []
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

function setFile(name: string, data: unknown) {
  const file = path.join(DATA_DIR, `${name}.json`)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export interface User {
  id: string; name: string; email: string; avatar?: string
  provider: 'github' | 'wechat' | 'email'
  wechatOpenId?: string; githubId?: string
  apiKeys: ApiKey[]; createdAt: string; plan: 'free' | 'pro'
}
export interface ApiKey {
  id: string; key: string; name: string; createdAt: string; lastUsedAt?: string; isActive: boolean
}
export interface UsageRecord {
  id: string; userId: string; apiKeyId: string
  module: 'image' | 'copy' | 'video'; tokens?: number
  createdAt: string; ip: string; userAgent: string
}

export function getUsers(): User[] { return getFile('users') }
export function getUserById(id: string): User | undefined { return getUsers().find(u => u.id === id) }
export function getUserByGithubId(githubId: string): User | undefined { return getUsers().find(u => u.githubId === githubId) }
export function getUserByWechatOpenId(openId: string): User | undefined { return getUsers().find(u => u.wechatOpenId === openId) }

export function createUser(data: Omit<User, 'id' | 'apiKeys' | 'createdAt'>): User {
  const users = getUsers()
  const user: User = { ...data, id: `user_${Date.now()}`, apiKeys: [], createdAt: new Date().toISOString() }
  users.push(user); setFile('users', users)
  return user
}

export function updateUser(id: string, data: Partial<User>): User | null {
  const users = getUsers(); const idx = users.findIndex(u => u.id === id)
  if (idx === -1) return null
  users[idx] = { ...users[idx], ...data }; setFile('users', users)
  return users[idx]
}

export function createApiKey(userId: string, name: string): { key: string; apiKey: ApiKey } {
  const crypto = require('crypto')
  const key = `bk_${crypto.randomBytes(24).toString('hex')}`
  const apiKey: ApiKey = { id: `key_${Date.now()}`, key, name, createdAt: new Date().toISOString(), isActive: true }
  const users = getUsers(); const user = users.find(u => u.id === userId)
  if (user) { user.apiKeys.push(apiKey); setFile('users', users) }
  return { key, apiKey }
}

export function revokeApiKey(userId: string, keyId: string): boolean {
  const users = getUsers(); const user = users.find(u => u.id === userId)
  if (!user) return false
  const k = user.apiKeys.find(k => k.id === keyId)
  if (k) { k.isActive = false; setFile('users', users) }
  return true
}

export function findApiKey(key: string): { user: User; apiKey: ApiKey } | null {
  for (const user of getUsers()) {
    const apiKey = user.apiKeys.find(k => k.key === key && k.isActive)
    if (apiKey) return { user, apiKey }
  }
  return null
}

export function touchApiKey(userId: string, keyId: string) {
  const users = getUsers(); const user = users.find(u => u.id === userId)
  const k = user?.apiKeys.find(k => k.id === keyId)
  if (k) { k.lastUsedAt = new Date().toISOString(); setFile('users', users) }
}

export function recordUsage(userId: string, apiKeyId: string, module: string, tokens: number, ip: string, ua: string) {
  const records: UsageRecord[] = getFile('usage')
  records.push({ id: `ur_${Date.now()}`, userId, apiKeyId, module: module as any, tokens, createdAt: new Date().toISOString(), ip, userAgent: ua })
  if (records.length > 10000) records.splice(0, records.length - 10000)
  setFile('usage', records)
}

export function getUsageByUser(userId: string, days = 30): Record<string, number> {
  const records: UsageRecord[] = getFile('usage')
  const cutoff = new Date(Date.now() - days * 86400000).toISOString()
  const map: Record<string, number> = {}
  for (const r of records) {
    if (r.userId !== userId || r.createdAt < cutoff) continue
    map[r.module] = (map[r.module] || 0) + (r.tokens || 1)
  }
  return map
}

export function getUsageByDay(userId: string, days = 7): Array<{ date: string; image: number; copy: number; video: number }> {
  const records: UsageRecord[] = getFile('usage')
  const result: Record<string, any> = {}
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    result[d] = { image: 0, copy: 0, video: 0 }
  }
  for (const r of records) {
    if (r.userId !== userId) continue
    const d = r.createdAt.slice(0, 10)
    if (result[d]) result[d][r.module] = (result[d][r.module] || 0) + (r.tokens || 1)
  }
  return Object.keys(result).sort().map(date => ({ date, ...result[date] }))
}

export const RATE_LIMITS: Record<string, { image: number; copy: number; video: number; windowMs: number }> = {
  free: { image: 20,  copy: 50,  video: 5,  windowMs: 86400000 },
  pro:  { image: 500, copy: 2000, video: 100, windowMs: 86400000 },
}

export function getUserLimit(user: User) { return RATE_LIMITS[user.plan] || RATE_LIMITS.free }

export function checkRateLimit(user: User): { allowed: boolean; remaining: number; limit: number } {
  const usage = getUsageByUser(user.id)
  const limit = getUserLimit(user)
  const remaining = Math.min(
    limit.image - (usage.image || 0),
    limit.copy  - (usage.copy  || 0),
    limit.video - (usage.video || 0),
  )
  return { allowed: remaining > 0, remaining: Math.max(0, remaining), limit: limit.image }
}
