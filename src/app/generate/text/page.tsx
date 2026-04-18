'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [productInfo, setProductInfo] = useState('')
  const [platform, setPlatform] = useState('xiaohongshu')
  const [tone, setTone] = useState('casual')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')

  // 检查登录状态
  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, c) => {
      const [k, v] = c.trim().split('=')
      acc[k] = v
      return acc
    }, {} as Record<string, string>)
    
    if (!cookies['b_session']) {
      router.push('/login')
    }
  }, [router])

  const generate = async () => {
    if (!productInfo) return
    
    setGenerating(true)
    
    // 调用后端 API
    try {
      const res = await fetch('/api/generate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productInfo, platform, tone })
      })
      
      if (res.status === 401) {
        router.push('/login')
        return
      }
      
      const data = await res.json()
      if (data.text) {
        setResult(data.text)
      }
    } catch (error) {
      console.error('[Text Generate] 错误:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'b_session=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
    router.push('/login')
  }

  return (
    <>
      <nav className="navbar">
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
        <div className="nav-actions">
          <button className="btn btn-secondary" onClick={handleLogout}>退出</button>
        </div>
      </nav>

      <div className="page-content">
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
                  className="form-textarea"
                  placeholder="请输入商品名称、特点、卖点等信息..."
                  value={productInfo}
                  onChange={(e) => setProductInfo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">发布平台</label>
                <select className="form-select" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  {platforms.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">文案风格</label>
                <select className="form-select" value={tone} onChange={(e) => setTone(e.target.value)}>
                  {tones.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <button 
                className="btn btn-primary"
                style={{ width: '100%' }}
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
                <div className="output-preview">
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
