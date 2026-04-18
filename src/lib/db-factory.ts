/**
 * 数据库工厂 - 根据环境变量选择数据库实现
 * 如果设置了 DATABASE_URL，则使用 PostgreSQL
 * 否则使用内存数据库（开发模式）
 */
import { neon } from '@neondatabase/serverless'

// 获取数据库连接（仅 PostgreSQL 模式）
function getSql() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    return null
  }
  return neon(connectionString)
}

// 是否使用 PostgreSQL
const USE_POSTGRES = !!process.env.DATABASE_URL

console.log(`[Database] 使用 ${USE_POSTGRES ? 'PostgreSQL (Neon)' : '内存存储'} 数据库`)

// ─────────────────────────────────────────────────────────
// PostgreSQL 数据库实现
// ─────────────────────────────────────────────────────────
const postgresDb = {
  users: {
    create: async (user: {
      email?: string
      phone?: string
      name?: string
      avatar?: string
      passwordHash?: string
      role?: 'user' | 'admin'
      plan?: 'free' | 'pro'
      provider?: string
      githubId?: string
      wechatOpenId?: string
    }) => {
      const sql = getSql()
      if (!sql) throw new Error('PostgreSQL 未配置')
      
      const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const [created] = await sql`
        INSERT INTO users (
          id, email, phone, name, avatar, password_hash, 
          role, plan, provider, github_id, wechat_openid,
          credits_image, credits_video, credits_text, credits_translate
        ) VALUES (
          ${id},
          ${user.email || null},
          ${user.phone || null},
          ${user.name || null},
          ${user.avatar || null},
          ${user.passwordHash || null},
          ${user.role || 'user'},
          ${user.plan || 'free'},
          ${user.provider || null},
          ${user.githubId || null},
          ${user.wechatOpenId || null},
          100, 50, 200, 200
        )
        RETURNING *
      `
      
      return mapUser(created)
    },
    
    findByEmail: async (email: string) => {
      const sql = getSql()
      if (!sql) return null
      const [user] = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`
      return user ? mapUser(user) : null
    },
    
    findByPhone: async (phone: string) => {
      const sql = getSql()
      if (!sql) return null
      const [user] = await sql`SELECT * FROM users WHERE phone = ${phone} LIMIT 1`
      return user ? mapUser(user) : null
    },
    
    findById: async (id: string) => {
      const sql = getSql()
      if (!sql) return null
      const [user] = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`
      return user ? mapUser(user) : null
    },
    
    update: async (id: string, data: Record<string, unknown>) => {
      const sql = getSql()
      if (!sql) return null
      // 简化实现
      return null
    },
    
    getNonAdminUsers: async () => {
      const sql = getSql()
      if (!sql) return []
      const users = await sql`SELECT * FROM users WHERE role != 'admin' OR email = 'admin@bingotool.com'`
      return users.map(mapUser)
    },
    
    deductCredit: async () => true,
    
    setCredit: async (id: string, type: string, amount: number) => {
      const sql = getSql()
      if (!sql) return false
      const column = `credits_${type}`
      await sql`UPDATE users SET ${sql.unsafe(`${column} = ${amount}`)} WHERE id = ${id}`
      return true
    }
  },
  
  codes: {
    set: async (phone: string, code: string) => {
      const sql = getSql()
      if (!sql) return
      await sql`
        INSERT INTO verification_codes (phone, code, expires_at)
        VALUES (${phone}, ${code}, NOW() + INTERVAL '5 minutes')
        ON CONFLICT (phone) DO UPDATE SET code = ${code}, expires_at = NOW() + INTERVAL '5 minutes'
      `
    },
    
    verify: async (phone: string, code: string) => {
      const sql = getSql()
      if (!sql) return false
      const [record] = await sql`
        SELECT * FROM verification_codes 
        WHERE phone = ${phone} AND expires_at > NOW()
        LIMIT 1
      `
      if (!record) return false
      if (record.code !== code) return false
      await sql`DELETE FROM verification_codes WHERE phone = ${phone}`
      return true
    }
  },
  
  creditConfigs: {
    getAll: async () => {
      const sql = getSql()
      if (!sql) return []
      const configs = await sql`SELECT * FROM credit_configs`
      return configs.map(c => ({
        id: c.id,
        type: c.type,
        name: c.name,
        cost: c.cost,
        description: c.description
      }))
    },
    
    update: async (type: string, cost: number) => {
      const sql = getSql()
      if (!sql) return false
      await sql`UPDATE credit_configs SET cost = ${cost} WHERE type = ${type}`
      return true
    }
  },
  
  apiKeys: {
    find: async (key: string) => {
      const sql = getSql()
      if (!sql) return null
      const [record] = await sql`
        SELECT u.*, ak.id as key_id, ak.name as key_name, ak.created as key_created
        FROM api_keys ak
        JOIN users u ON u.id = ak.user_id
        WHERE ak.id = ${key}
        LIMIT 1
      `
      if (!record) return null
      return {
        user: mapUser(record),
        apiKey: { id: record.key_id, name: record.key_name, created: record.key_created }
      }
    },
    
    create: async (userId: string, name: string) => {
      const sql = getSql()
      if (!sql) return ''
      const keyId = `bt_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
      await sql`INSERT INTO api_keys (id, user_id, name) VALUES (${keyId}, ${userId}, ${name})`
      return keyId
    }
  }
}

// ─────────────────────────────────────────────────────────
// 辅助函数
// ─────────────────────────────────────────────────────────
function mapUser(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    name: row.name as string | undefined,
    avatar: row.avatar as string | undefined,
    passwordHash: row.password_hash as string | undefined,
    role: row.role as 'user' | 'admin',
    plan: row.plan as 'free' | 'pro',
    provider: row.provider as string | undefined,
    githubId: row.github_id as string | undefined,
    wechatOpenId: row.wechat_openid as string | undefined,
    credits: {
      image: row.credits_image as number,
      video: row.credits_video as number,
      text: row.credits_text as number,
      translate: row.credits_translate as number
    },
    createdAt: row.created_at,
    lastLogin: row.last_login as Date | undefined
  }
}

// ─────────────────────────────────────────────────────────
// 导出数据库实例
// ─────────────────────────────────────────────────────────
// 导出 PostgreSQL 实现（供 async/await 使用）
export { postgresDb as pg, USE_POSTGRES }

// 重新导出内存数据库（向后兼容）
export * from './db'
