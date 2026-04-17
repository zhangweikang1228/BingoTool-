'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const platforms = [
  { id: 'xiaohongshu', name: '小红书' },
  { id: 'douyin', name: '抖音' },
  { id: 'wechat', name: '微信公众号' },
  { id: 'weibo', name: '微博' },
]

const tones = [
  { id: 'casual', name: '轻松活泼' },
  { id: 'professional', name: '专业严谨' },
  { id: 'emotional', name: '情感共鸣' },
]

export default function TextGeneratePage() {
  const [productInfo, setProductInfo] = useState('')
  const [platform, setPlatform] = useState('xiaohongshu')
  const [tone, setTone] = useState('casual')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (!document.cookie.includes('user_id=')) {
      window.location.href = '/login'
    } else {
      setIsLoggedIn(true)
    }
  }, [])

  const generate = async () => {
    if (!productInfo) return
    
    setGenerating(true)
    
    const res = await fetch('/api/generate/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productInfo, platform, tone })
    })
    
    const data = await res.json()
    setResult(data.text || '这是一款非常实用的产品...\n\n【产品亮点】\n✨ 亮点1：设计精美\n✨ 亮点2：品质卓越\n✨ 亮点3：性价比高\n\n快来试试吧！')
    setGenerating(false)
  }

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
      <nav className="navbar">
        <div className="container">
          <Link href="/" className="logo">
            <div className="logo-icon">B</div>
            BingoTool
          </Link>
          <ul className="nav-links">
            <li><Link href="/dashboard">仪表盘</Link></li>
            <li><Link href="/generate/image">商品图</Link></li>
            <li><Link href="/generate/text" className="active">种草文案</Link></li>
            <li><Link href="/generate/model">虚拟模特</Link></li>
            <li><Link href="/generate/translate">翻译</Link></li>
          </ul>
          <button className="btn btn-secondary" onClick={handleLogout}>退出</button>
        </div>
      </nav>

      <div className="generate-page">
        <div className="page-header">
          <h1>✍️ 种草文案生成</h1>
          <p>输入商品信息，AI生成种草文案</p>
        </div>

        <div className="generate-container">
          {/* 输入面板 */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-icon">📝</div>
              <h3>输入商品信息</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label className="form-label">商品描述</label>
                <textarea
                  className="form-input"
                  placeholder="请输入商品名称、特点、卖点等信息..."
                  style={{ minHeight: '150px', resize: 'vertical' }}
                  value={productInfo}
                  onChange={(e) => setProductInfo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">发布平台</label>
                <select className="form-input" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  {platforms.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">文案风格</label>
                <select className="form-input" value={tone} onChange={(e) => setTone(e.target.value)}>
                  {tones.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <button 
                className="btn btn-primary"
                onClick={generate}
                disabled={!productInfo || generating}
              >
                {generating ? '⚡ 生成中...' : '🚀 开始生成'}
              </button>
            </div>
          </div>

          {/* 输出面板 */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-icon">✨</div>
              <h3>生成结果</h3>
            </div>
            <div className="panel-body">
              {generating ? (
                <div className="generating">
                  <div className="spinner"></div>
                  <span>AI正在创作中...</span>
                </div>
              ) : result ? (
                <>
                  <div className="output-preview">
                    <div className="output-content">{result}</div>
                  </div>
                  <div className="output-actions">
                    <button className="btn btn-success btn-sm" onClick={() => navigator.clipboard.writeText(result)}>📋 复制文案</button>
                    <button className="btn btn-secondary btn-sm" onClick={generate}>🔄 重新生成</button>
                  </div>
                </>
              ) : (
                <div className="output-preview" style={{ color: '#999' }}>
                  <div className="upload-icon">💡</div>
                  <p>输入商品信息，点击生成按钮</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
