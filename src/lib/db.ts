// 简单的内存数据库，用于演示
// 在生产环境中应使用真实的数据库

export interface User {
  id: string
  email?: string
  phone?: string
  name?: string
  avatar?: string
  password: string
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
  cost: number // 每次消耗的额度
  description: string
}

// 内存存储
let users: Map<string, User> = new Map()
let creditConfigs: CreditConfig[] = [
  { id: '1', type: 'image', name: '商品图生成', cost: 1, description: '生成一张商品主图' },
  { id: '2', type: 'video', name: '视频生成', cost: 5, description: '生成一个视频' },
  { id: '3', type: 'text', name: '种草文案', cost: 1, description: '生成一篇种草文案' },
  { id: '4', type: 'translate', name: '多语言翻译', cost: 1, description: '翻译一段文案' },
]

// 验证码存储
let verificationCodes: Map<string, { code: string; expires: number }> = new Map()

// GitHub/微信用户映射
let githubUsers: Map<string, string> = new Map() // githubId -> userId
let wechatUsers: Map<string, string> = new Map() // wechatOpenId -> userId

// API Key 存储（演示用）
let apiKeys: Map<string, { userId: string; name: string; created: Date }> = new Map()

// 初始化一个演示 API Key
apiKeys.set('demo-api-key-12345', {
  userId: 'admin-001',
  name: 'Demo API Key',
  created: new Date()
})

// 默认管理员账号
const defaultAdmin: User = {
  id: 'admin-001',
  email: 'admin@bingotool.com',
  password: 'admin123', // 实际应该加密存储
  role: 'admin',
  plan: 'pro',
  credits: { image: 999999, video: 999999, text: 999999, translate: 999999 },
  createdAt: new Date()
}

// 初始化管理员
users.set('admin@bingotool.com', defaultAdmin)
users.set('admin-001', defaultAdmin)

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
      const key = `bt_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
      apiKeys.set(key, { userId, name, created: new Date() })
      return key
    },
    checkRateLimit: (key: string, limit: number = 100): boolean => {
      // 演示模式：不做限流检查
      return true
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
}): User {
  const user = db.users.create({
    ...data,
    password: '',
    role: 'user',
    plan: 'free',
    credits: { image: 100, video: 50, text: 200, translate: 200 }
  })
  // 如果有 OAuth ID，建立映射
  return user
}

export function findApiKey(key: string) {
  return db.apiKeys.find(key)
}

export function checkRateLimit(key: string, limit?: number) {
  return db.apiKeys.checkRateLimit(key, limit)
}
