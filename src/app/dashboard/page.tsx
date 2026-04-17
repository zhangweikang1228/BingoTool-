'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (!document.cookie.includes('user_id=')) {
      window.location.href = '/login'
    } else {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogout = () => {
    document.cookie = 'user_id=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
    window.location.href = '/login'
  }

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>正在跳转登录页...</p>
      </div>
    )
  }

  return (
    <>
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="container">
          <Link href="/" className="logo">
            <div className="logo-icon">B</div>
            BingoTool
          </Link>
          <ul className="nav-links">
            <li><Link href="/dashboard" className="active">仪表盘</Link></li>
            <li><Link href="/generate/image">商品图</Link></li>
            <li><Link href="/generate/text">种草文案</Link></li>
            <li><Link href="/generate/model">虚拟模特</Link></li>
            <li><Link href="/generate/translate">翻译</Link></li>
          </ul>
          <div className="nav-user">
            <div className="nav-avatar">V</div>
            <button className="btn btn-secondary" onClick={handleLogout}>退出</button>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>欢迎回来 👋</h1>
          <p>今天想创作什么内容？</p>
        </div>

        {/* 统计卡片 */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon blue">📊</div>
            <div className="label">今日剩余次数</div>
            <div className="value primary">{stats.remainingToday}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon green">✅</div>
            <div className="label">今日已使用</div>
            <div className="value success">{stats.usedToday}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon purple">📈</div>
            <div className="label">总生成次数</div>
            <div className="value">{stats.totalGenerations}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon orange">👑</div>
            <div className="label">会员状态</div>
            <div className="value warning" style={{ fontSize: '18px' }}>
              {stats.memberType === 'free' ? '免费版' : 'VIP'}
            </div>
          </div>
        </div>

        {/* 快捷入口 */}
        <div className="quick-actions">
          <h2>快捷生成</h2>
          <div className="quick-actions-grid">
            <Link href="/generate/image" className="quick-action-card">
              <div className="quick-action-icon">🖼️</div>
              <h4>商品图</h4>
            </Link>
            <Link href="/generate/text" className="quick-action-card">
              <div className="quick-action-icon">✍️</div>
              <h4>种草文案</h4>
            </Link>
            <Link href="/generate/model" className="quick-action-card">
              <div className="quick-action-icon">👗</div>
              <h4>虚拟模特</h4>
            </Link>
            <Link href="/generate/translate" className="quick-action-card">
              <div className="quick-action-icon">🌐</div>
              <h4>翻译</h4>
            </Link>
          </div>
        </div>

        {/* 创作历史 */}
        <div className="history-section">
          <h2>创作历史</h2>
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <span className="history-type">{item.type}</span>
                <div className="history-info">
                  <div className="history-content">{item.content}</div>
                  <div className="history-time">{item.time}</div>
                </div>
                <a href="#" className="history-link">查看详情 →</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
