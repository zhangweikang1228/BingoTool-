import { getSession, encodeSession } from '../../../lib/auth'
import { getUserById, getUsageByUser, RATE_LIMITS } from '../../../lib/db'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  const user = session ? getUserById(session.id) : null
  if (!user) return <div style={{padding:40}}>用户不存在 <a href="/login">去登录</a></div>

  const limit = RATE_LIMITS[user.plan] || RATE_LIMITS.free
  const totalUsage = getUsageByUser(user.id)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 80px' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #e5e7eb', marginBottom: 28 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>🛒 BingoTool</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
          {user.avatar && <img src={user.avatar} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />}
          <span>{user.name}</span>
          <span style={{ background: 'linear-gradient(135deg, #fbbf24,#f59e0b)', color: 'white', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
            {user.plan === 'pro' ? '⭐ Pro' : 'Free'}
          </span>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', color: '#6b7280' }}>退出</button>
          </form>
        </div>
      </header>

      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>👋 你好，{user.name}！</h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>AI 电商内容工坊 · API 开放平台</p>
      </div>

      {/* 额度卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { label: '📸 商品主图', used: totalUsage.image || 0, color: '#4f46e5' },
          { label: '✍️ 种草文案', used: totalUsage.copy  || 0, color: '#10b981' },
          { label: '🎬 视频生成', used: totalUsage.video || 0, color: '#f59e0b' },
        ].map(item => (
          <div key={item.label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 16px', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 10 }}>{item.label}</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>
              <b style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.used}</b>
              <span style={{ color: '#9ca3af' }}> / {limit[item.label.includes('图') ? 'image' : item.label.includes('文案') ? 'copy' : 'video']} 次</span>
            </div>
            <div style={{ height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min((item.used / limit[item.label.includes('图') ? 'image' : item.label.includes('文案') ? 'copy' : 'video']) * 100, 100)}%`, height: '100%', background: item.color, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>每天 00:00 重置</div>
          </div>
        ))}
      </div>

      {/* 快速入口 */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🚀 快速入口</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { href: '/app', icon: '🛒', title: 'AI 内容工具', desc: '商品主图 · 文案 · 视频脚本' },
            { href: '/api-keys', icon: '🔑', title: 'API Key 管理', desc: '创建 · 查看 · 吊销密钥' },
            { href: '/usage', icon: '📊', title: '用量统计', desc: '详细调用记录' },
          ].map(item => (
            <a key={item.href} href={item.href} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, textDecoration: 'none', color: 'inherit', transition: 'all .2s', display: 'block' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 4px 14px rgba(0,0,0,.08)'; (e.currentTarget as HTMLElement).style.borderColor='#818cf8' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform=''; (e.currentTarget as HTMLElement).style.boxShadow=''; (e.currentTarget as HTMLElement).style.borderColor='#e5e7eb' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{item.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* API 调用示例 */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🔌 API 调用示例</h3>
        <pre style={{ background: '#1e1e2e', color: '#a5f3fc', borderRadius: 12, padding: 18, fontSize: 12, overflowX: 'auto', lineHeight: 1.7 }}>
{`# 调用方式
curl -X POST https://your-domain.com/api/ai/copy \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${user.apiKeys[0]?.key || 'YOUR_API_KEY'}" \\
  -d '{"product": "商品描述", "platform": "xiaohongshu"}'

# 响应
{"success": true, "text": "生成的种草文案..."}`}
        </pre>
      </div>
    </div>
  )
}
