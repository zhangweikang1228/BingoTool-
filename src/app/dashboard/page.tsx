import Link from 'next/link'

// 模拟数据
const stats = {
  totalGenerations: 156,
  usedToday: 12,
  remainingToday: 8,
  memberType: 'free'
}

const history = [
  { id: 1, type: '文案', content: '小红书风格种草文案 - 连衣裙', time: '10分钟前' },
  { id: 2, type: '商品图', content: '背景替换 - 运动鞋', time: '30分钟前' },
  { id: 3, type: '翻译', content: '英文翻译 - 美妆产品描述', time: '1小时前' },
  { id: 4, type: '文案', content: '抖音带货话术 - 零食', time: '2小时前' },
  { id: 5, type: '模特', content: '虚拟模特试穿 - T恤', time: '3小时前' },
]

export default function DashboardPage() {
  return (
    <>
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="container">
          <div className="logo">BingoTool</div>
          <ul className="nav-links">
            <li><Link href="/dashboard" style={{ color: '#6366f1' }}>仪表盘</Link></li>
            <li><Link href="/generate/image">商品图</Link></li>
            <li><Link href="/generate/text">种草文案</Link></li>
            <li><Link href="/generate/model">虚拟模特</Link></li>
            <li><Link href="/generate/translate">翻译</Link></li>
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#666' }}>138****8888</span>
            <button className="btn btn-secondary">升级会员</button>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="container dashboard">
        <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>欢迎回来</h1>

        {/* 统计卡片 */}
        <div className="stats">
          <div className="stat-card">
            <div className="label">今日剩余次数</div>
            <div className="value" style={{ color: '#6366f1' }}>{stats.remainingToday}</div>
          </div>
          <div className="stat-card">
            <div className="label">今日已使用</div>
            <div className="value">{stats.usedToday}</div>
          </div>
          <div className="stat-card">
            <div className="label">总生成次数</div>
            <div className="value">{stats.totalGenerations}</div>
          </div>
          <div className="stat-card">
            <div className="label">会员状态</div>
            <div className="value" style={{ fontSize: '20px' }}>
              {stats.memberType === 'free' ? '免费版' : 'VIP'}
            </div>
          </div>
        </div>

        {/* 快捷入口 */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>快捷生成</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <Link href="/generate/image" style={{ textDecoration: 'none' }}>
              <div className="feature-card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div className="feature-icon">🖼️</div>
                <h3>商品图</h3>
              </div>
            </Link>
            <Link href="/generate/text" style={{ textDecoration: 'none' }}>
              <div className="feature-card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div className="feature-icon">✍️</div>
                <h3>种草文案</h3>
              </div>
            </Link>
            <Link href="/generate/model" style={{ textDecoration: 'none' }}>
              <div className="feature-card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div className="feature-icon">👗</div>
                <h3>虚拟模特</h3>
              </div>
            </Link>
            <Link href="/generate/translate" style={{ textDecoration: 'none' }}>
              <div className="feature-card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div className="feature-icon">🌐</div>
                <h3>翻译</h3>
              </div>
            </Link>
          </div>
        </div>

        {/* 创作历史 */}
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>创作历史</h2>
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <span className="type">{item.type}</span>
                <div className="info">
                  <div>{item.content}</div>
                  <div className="time">{item.time}</div>
                </div>
                <Link href="#" className="action">查看详情</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
