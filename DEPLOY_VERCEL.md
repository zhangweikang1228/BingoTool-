# Vercel + Neon PostgreSQL 部署指南

## 步骤 1: 创建 Neon 数据库

1. 访问 [Neon.tech](https://neon.tech)
2. 注册账号并登录
3. 点击 "New Project" 创建项目
4. 复制连接字符串（Connection string）

## 步骤 2: 配置 Vercel 环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `DATABASE_URL` | Neon 连接字符串 |
| `ADMIN_EMAIL` | 管理员邮箱 |
| `ADMIN_PASSWORD_HASH` | 密码哈希 |
| `ADMIN_PASSWORD_SALT` | 密码盐值 |
| `GITHUB_CLIENT_ID` | GitHub OAuth ID (可选) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Secret (可选) |

## 步骤 3: 生成管理员密码哈希

在本地运行以下 Node.js 代码生成密码哈希：

```javascript
const crypto = require('crypto')

const password = 'your-admin-password'  // 替换为你的密码
const salt = crypto.randomBytes(16).toString('hex')
const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')

console.log('密码:', password)
console.log('HASH:', hash)
console.log('SALT:', salt)
```

## 步骤 4: 部署到 Vercel

```bash
npm run build
vercel --prod
```

## 步骤 5: 初始化数据库

部署完成后，访问以下 URL 初始化数据库表：

```
https://your-project.vercel.app/api/db/init
```

## 步骤 6: 创建管理员账号

由于使用的是 Neon PostgreSQL（持久化数据库），管理员账号需要通过代码创建。

在 Vercel Functions 日志中查看初始化是否成功，然后通过以下方式创建管理员：

1. 使用 GitHub OAuth 登录（会自动创建用户）
2. 或者修改代码添加管理员初始化逻辑

## 本地开发

本地使用 Neon 数据库：

1. 在 Neon 控制台获取连接字符串
2. 创建 `.env.local` 文件：

```bash
DATABASE_URL=postgresql://...
```

3. 运行开发服务器：

```bash
npm run dev
```

4. 初始化本地数据库（可选）：

```bash
curl http://localhost:3000/api/db/init
```

## 注意事项

- Neon 免费额度：每月 0.5GB 存储，100 小时使用
- 数据库连接使用 SSL，需要 `?sslmode=require`
- 冷启动可能需要几秒钟
