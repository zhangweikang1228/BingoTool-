import { getSession } from '../../../lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return <div style={{padding:40}}>未登录 <a href="/login">去登录</a></div>

  const user = db.users.findById(session.id)
  if (!user) return <div style={{padding:40}}>用户不存在 <a href="/login">去登录</a></div>

  const credits = user.credits

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 80px' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #e5e7eb', marginBottom: 28 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>🛒 BingoTool</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
          {session.avatar && <img src={session.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />}
          <span style={{ fontWeight: 600 }}>{session.name}</span>
          <span style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: 'white', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
            {user.role === 'admin' ? '⭐ Admin' : 'Free'}
          </span>
          <a href="/login" style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>退出</a>
        </div>
      </header>

      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>👋 你好，{session.name}！</h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>AI 电商内容工坊</p>
      </div>

      {/* Quota cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { key: 'image', label: '📸 商品主图', used: 0, total: credits.image, color: '#4f46e5' },
          { key: 'video', label: '🎬 视频生成', used: 0, total: credits.video, color: '#f59e0b' },
          { key: 'text', label: '✍️ 种草文案', used: 0, total: credits.text, color: '#10b981' },
          { key: 'translate', label: '🌐 多语言翻译', used: 0, total: credits.translate, color: '#ec4899' },
        ].map(item => (
          <div key={item.key} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 16px', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 10 }}>{item.label}</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>
              <b style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.total}</b>
              <span style={{ color: '#9ca3af' }}> 额度</span>
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>剩余额度</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🚀 快速入口</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { href: '/generate/image', icon: '🖼️', title: '商品图生成', desc: 'AI 生成商品主图' },
            { href: '/generate/video', icon: '🎬', title: '视频生成', desc: 'AI 生成展示视频' },
            { href: '/generate/text', icon: '✍️', title: '种草文案', desc: '生成营销文案' },
            { href: '/generate/translate', icon: '🌐', title: '多语言翻译', desc: '翻译商品描述' },
          ].map(item => (
            <a key={item.href} href={item.href} style={{
              background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18,
              textDecoration: 'none', color: 'inherit', display: 'block',
              transition: 'all .2s',
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{item.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
