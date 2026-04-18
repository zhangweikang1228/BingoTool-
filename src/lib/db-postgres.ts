/**
 * Vercel Postgres / Neon 数据库层
 * 支持 Serverless 环境的 PostgreSQL
 */
import { neon } from '@neondatabase/serverless'

// 获取数据库连接
function getSql() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL 环境变量未设置')
  }
  return neon(connectionString)
}

// ─────────────────────────────────────────────────────────
// 数据库初始化（首次部署时运行一次）
// ─────────────────────────────────────────────────────────
export async function initDatabase() {
  const sql = getSql()
  
  // 创建 users 表
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(20) UNIQUE,
      name VARCHAR(255),
      avatar TEXT,
      password_hash VARCHAR(255),
      role VARCHAR(20) DEFAULT 'user',
      plan VARCHAR(20) DEFAULT 'free',
      provider VARCHAR(50),
      github_id VARCHAR(255),
      wechat_openid VARCHAR(255),
      credits_image INT DEFAULT 100,
      credits_video INT DEFAULT 50,
      credits_text INT DEFAULT 200,
      credits_translate INT DEFAULT 200,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP
    )
  `
  
  // 创建 verification_codes 表
  await sql`
    CREATE TABLE IF NOT EXISTS verification_codes (
      phone VARCHAR(20) PRIMARY KEY,
      code VARCHAR(10) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  
  // 创建 api_keys 表
  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `
  
  // 创建 credit_configs 表
  await sql`
    CREATE TABLE IF NOT EXISTS credit_configs (
      id VARCHAR(255) PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      cost INT NOT NULL,
      description TEXT
    )
  `
  
  // 初始化额度配置
  await sql`
    INSERT INTO credit_configs (id, type, name, cost, description)
    VALUES 
      ('1', 'image', '商品图生成', 1, '生成一张商品主图'),
      ('2', 'video', '视频生成', 5, '生成一个视频'),
      ('3', 'text', '种草文案', 1, '生成一篇种草文案'),
      ('4', 'translate', '多语言翻译', 1, '翻译一段文案')
    ON CONFLICT (id) DO NOTHING
  `
  
  console.log('[Database] 数据库初始化完成')
}

// ─────────────────────────────────────────────────────────
// 用户操作
// ─────────────────────────────────────────────────────────
export const db = {
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
      const [user] = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`
      return user ? mapUser(user) : null
    },
    
    findByPhone: async (phone: string) => {
      const sql = getSql()
      const [user] = await sql`SELECT * FROM users WHERE phone = ${phone} LIMIT 1`
      return user ? mapUser(user) : null
    },
    
    findById: async (id: string) => {
      const sql = getSql()
      const [user] = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`
      return user ? mapUser(user) : null
    },
    
    update: async (id: string, data: Record<string, unknown>) => {
      const sql = getSql()
      // 构建更新字段
      const updates: string[] = []
      const values: unknown[] = []
      let paramIndex = 1
      
      for (const [key, value] of Object.entries(data)) {
        const dbKey = camelToSnake(key)
        updates.push(`${dbKey} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
      
      if (updates.length === 0) return null
      
      values.push(id)
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`
      
      const [updated] = await sql.query(query, values)
      return updated ? mapUser(updated) : null
    },
    
    getNonAdminUsers: async () => {
      const sql = getSql()
      const users = await sql`SELECT * FROM users WHERE role != 'admin' OR email = 'admin@bingotool.com'`
      return users.map(mapUser)
    },
    
    deductCredit: async (id: string, type: 'image' | 'video' | 'text' | 'translate', amount: number) => {
      const sql = getSql()
      const column = `credits_${type}`
      await sql`UPDATE users SET ${sql.unsafe(`${column} = ${column} - ${amount}`)} WHERE id = ${id} AND ${sql.unsafe(`${column} >= ${amount}`)}`
      return true
    },
    
    setCredit: async (id: string, type: 'image' | 'video' | 'text' | 'translate', amount: number) => {
      const sql = getSql()
      const column = `credits_${type}`
      await sql`UPDATE users SET ${sql.unsafe(`${column} = ${amount}`)} WHERE id = ${id}`
      return true
    }
  },
  
  // 验证码操作
  codes: {
    set: async (phone: string, code: string) => {
      const sql = getSql()
      await sql`
        INSERT INTO verification_codes (phone, code, expires_at)
        VALUES (${phone}, ${code}, NOW() + INTERVAL '5 minutes')
        ON CONFLICT (phone) DO UPDATE SET code = ${code}, expires_at = NOW() + INTERVAL '5 minutes'
      `
    },
    
    verify: async (phone: string, code: string) => {
      const sql = getSql()
      const [record] = await sql`
        SELECT * FROM verification_codes 
        WHERE phone = ${phone} AND expires_at > NOW()
        LIMIT 1
      `
      
      if (!record) return false
      
      if (record.code !== code) return false
      
      // 验证成功后删除
      await sql`DELETE FROM verification_codes WHERE phone = ${phone}`
      return true
    }
  },
  
  // 额度配置
  creditConfigs: {
    getAll: async () => {
      const sql = getSql()
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
      await sql`UPDATE credit_configs SET cost = ${cost} WHERE type = ${type}`
      return true
    }
  },
  
  // API Keys
  apiKeys: {
    find: async (key: string) => {
      const sql = getSql()
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
      const keyId = `bt_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
      await sql`
        INSERT INTO api_keys (id, user_id, name)
        VALUES (${keyId}, ${userId}, ${name})
      `
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

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
