'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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
        <p style={{ color: '#86868b' }}>正在跳转登录页...</p>
      </div>
    )
  }

  const features = [
    {
      id: 'image',
      icon: '🖼️',
      title: '商品图生成',
      desc: 'AI自动生成精美商品主图',
      gradient: 'gradient-1',
      href: '/generate/image'
    },
    {
      id: 'text',
      icon: '✍️',
      title: '种草文案',
      desc: '智能创作种草内容',
      gradient: 'gradient-2',
      href: '/generate/text'
    },
    {
      id: 'model',
      icon: '👗',
      title: '虚拟模特',
      desc: 'AI模特试穿效果',
      gradient: 'gradient-3',
      href: '/generate/model'
    },
    {
      id: 'translate',
      icon: '🌐',
      title: '多语言翻译',
      desc: '一键翻译15+语种',
      gradient: 'gradient-4',
      href: '/generate/translate'
    },
  ]

  return (
    <>
      <nav className="navbar">
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
        
        <div className="nav-actions">
          <button className="btn btn-secondary" onClick={handleLogout}>
            退出
          </button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <h1>欢迎使用 BingoTool</h1>
          <p>选择功能开始创作</p>
        </div>

        <div className="cards-grid">
          {features.map((f) => (
            <Link key={f.id} href={f.href} className={`card ${f.gradient}`}>
              <div className="card-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="card-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>

      <footer className="footer">
        © 2024 BingoTool. All rights reserved.
      </footer>
    </>
  )
}
