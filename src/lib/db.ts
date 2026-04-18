/**
 * 数据库层 - 支持内存模式（开发）和真实数据库（生产）
 * 生产环境请配置 DATABASE_URL 环境变量
 */

export interface User {
  id: string
  email?: string
  phone?: string
  name?: string
  avatar?: string
  passwordHash?: string  // 密码哈希存储
  role: 'user' | 'admin'
  plan: 'free' | 'pro'
  provider?: string
  githubId?: string
  wechatOpenId?: string
  credits: {
    image: number
    video: number
    text: number
    translate: number
  }
  createdAt: Date
  lastLogin?: Date
}

export interface CreditConfig {
  id: string
  type: 'image' | 'video' | 'text' | 'translate'
  name: string
  cost: number
  description: string
}

// ─────────────────────────────────────────────────────────
// 内存存储（开发模式 / 无数据库时使用）
// ─────────────────────────────────────────────────────────
let users: Map<string, User> = new Map()

// 额度配置
let creditConfigs: CreditConfig[] = [
  { id: '1', type: 'image', name: '商品图生成', cost: 1, description: '生成一张商品主图' },
  { id: '2', type: 'video', name: '视频生成', cost: 5, description: '生成一个视频' },
  { id: '3', type: 'text', name: '种草文案', cost: 1, description: '生成一篇种草文案' },
  { id: '4', type: 'translate', name: '多语言翻译', cost: 1, description: '翻译一段文案' },
]

// 验证码存储（带过期时间）
interface VerificationCode {
  code: string
  expires: number
}
// 导出存储以便其他模块访问
const verificationCodes: Map<string, VerificationCode> = new Map()

export { verificationCodes }

// OAuth 用户映射
let githubUsers: Map<string, string> = new Map()
let wechatUsers: Map<string, string> = new Map()

// API Key 存储
interface ApiKeyMeta {
  id: string
  userId: string
  name: string
  created: Date
}
let apiKeys: Map<string, ApiKeyMeta> = new Map()

// 数据库操作
// 导出兼容函数供 auth.ts 使用
export function getUserById(id: string): User | undefined {
  return users.get(id)
}

export function getUsers(): User[] {
  return Array.from(users.values())
}

export const db = {
  // 用户操作
  users: {
    create: (user: Omit<User, 'id' | 'createdAt'>) => {
      const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newUser: User = {
        ...user,
        id,
        createdAt: new Date(),
        credits: user.credits || { image: 100, video: 50, text: 200, translate: 200 }
      }
      if (user.email) users.set(user.email, newUser)
      if (user.phone) users.set(user.phone, newUser)
      users.set(id, newUser)
      return newUser
    },
    
    findByEmail: (email: string) => {
      return users.get(email)
    },
    
    findByPhone: (phone: string) => {
      return users.get(phone)
    },
    
    findById: (id: string) => {
      return users.get(id)
    },
    
    update: (id: string, data: Partial<User>) => {
      const user = users.get(id)
      if (!user) return null
      const updated = { ...user, ...data }
      users.set(id, updated)
      if (user.email) users.set(user.email, updated)
      if (user.phone) users.set(user.phone, updated)
      return updated
    },
    
    getAll: () => {
      return Array.from(users.values()).filter(u => u.role !== 'admin' || u.email === 'admin@bingotool.com')
    },
    
    getNonAdminUsers: () => {
      return Array.from(users.values()).filter(u => u.role !== 'admin')
    },
    
    deductCredit: (id: string, type: 'image' | 'video' | 'text' | 'translate', amount: number) => {
      const user = users.get(id)
      if (!user) return false
      if (user.credits[type] < amount) return false
      user.credits[type] -= amount
      users.set(id, user)
      return true
    },
    
    addCredit: (id: string, type: 'image' | 'video' | 'text' | 'translate', amount: number) => {
      const user = users.get(id)
      if (!user) return false
      user.credits[type] += amount
      users.set(id, user)
      return true
    },
    
    setCredit: (id: string, type: 'image' | 'video' | 'text' | 'translate', amount: number) => {
      const user = users.get(id)
      if (!user) return false
      user.credits[type] = amount
      users.set(id, user)
      return true
    }
  },
  
  // 额度配置操作
  creditConfigs: {
    getAll: () => creditConfigs,
    
    update: (type: 'image' | 'video' | 'text' | 'translate', cost: number) => {
      const config = creditConfigs.find(c => c.type === type)
      if (config) {
        config.cost = cost
        return true
      }
      return false
    },
    
    getByType: (type: 'image' | 'video' | 'text' | 'translate') => {
      return creditConfigs.find(c => c.type === type)
    }
  },
  
  // 验证码操作
  codes: {
    set: (phone: string, code: string) => {
      verificationCodes.set(phone, {
        code,
        expires: Date.now() + 5 * 60 * 1000 // 5分钟有效期
      })
    },
    
    verify: (phone: string, code: string) => {
      const stored = verificationCodes.get(phone)
      if (!stored) return false
      if (Date.now() > stored.expires) {
        verificationCodes.delete(phone)
        return false
      }
      if (stored.code !== code) return false
      verificationCodes.delete(phone)
      return true
    }
  },

  // OAuth 用户操作
  github: {
    getUserByGithubId: (githubId: string): User | undefined => {
      const userId = githubUsers.get(githubId)
      return userId ? users.get(userId) : undefined
    },
    linkUser: (githubId: string, userId: string) => {
      githubUsers.set(githubId, userId)
    }
  },

  wechat: {
    getUserByOpenId: (openid: string): User | undefined => {
      const userId = wechatUsers.get(openid)
      return userId ? users.get(userId) : undefined
    },
    linkUser: (openid: string, userId: string) => {
      wechatUsers.set(openid, userId)
    }
  },

  // API Key 操作
  apiKeys: {
    find: (key: string) => {
      const meta = apiKeys.get(key)
      if (!meta) return null
      const user = users.get(meta.userId)
      return user ? { user, apiKey: meta } : null
    },
    create: (userId: string, name: string) => {
      const keyId = `${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
      const key = `bt_${keyId}`
      apiKeys.set(key, { id: keyId, userId, name, created: new Date() })
      return key
    },
    checkRateLimit: (key: string, limit: number = 100): { allowed: boolean; remaining: number } => {
      // 生产环境应实现真实限流
      return { allowed: true, remaining: limit }
    }
  }
}

// 导出兼容函数（供 auth.ts 和路由使用）
export function getUserByGithubId(githubId: string): User | undefined {
  return db.github.getUserByGithubId(githubId)
}

export function getUserByWechatOpenId(openid: string): User | undefined {
  return db.wechat.getUserByOpenId(openid)
}

export function createUser(data: {
  email?: string;
  phone?: string;
  name?: string;
  provider?: string;
  avatar?: string;
  githubId?: string;
  wechatOpenId?: string;
  passwordHash?: string;
}): User {
  const user = db.users.create({
    ...data,
    passwordHash: data.passwordHash || '',
    role: 'user',
    plan: 'free',
    credits: { image: 100, video: 50, text: 200, translate: 200 }
  })
  // 如果有 OAuth ID，建立映射
  if (data.githubId && user.id) {
    db.github.linkUser(data.githubId, user.id)
  }
  if (data.wechatOpenId && user.id) {
    db.wechat.linkUser(data.wechatOpenId, user.id)
  }
  return user
}

export function findApiKey(key: string) {
  return db.apiKeys.find(key)
}

export function checkRateLimit(key: string, limit?: number) {
  return db.apiKeys.checkRateLimit(key, limit)
}
