// 简单的内存数据库，用于演示
// 在生产环境中应使用真实的数据库

export interface User {
  id: string
  email?: string
  phone?: string
  password: string
  role: 'user' | 'admin'
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

// 默认管理员账号
const defaultAdmin: User = {
  id: 'admin-001',
  email: 'admin@bingotool.com',
  password: 'admin123', // 实际应该加密存储
  role: 'admin',
  credits: { image: 999999, video: 999999, text: 999999, translate: 999999 },
  createdAt: new Date()
}

// 初始化管理员
users.set('admin@bingotool.com', defaultAdmin)
users.set('admin-001', defaultAdmin)

// 数据库操作
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
  }
}
