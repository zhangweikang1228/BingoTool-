'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const styles = [
  { id: 'default', name: '默认风格' },
  { id: 'outdoor', name: '户外场景' },
  { id: 'studio', name: '摄影棚' },
  { id: 'lifestyle', name: '生活场景' },
]

export default function ImageGeneratePage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [style, setStyle] = useState('default')
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
    }
  }

  const generate = async () => {
    if (!file) return
    
    setGenerating(true)
    setResult('')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    setResult('https://picsum.photos/800/600')
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
            <li><Link href="/generate/image" className="active">商品图</Link></li>
            <li><Link href="/generate/text">种草文案</Link></li>
            <li><Link href="/generate/model">虚拟模特</Link></li>
            <li><Link href="/generate/translate">翻译</Link></li>
          </ul>
          <button className="btn btn-secondary" onClick={handleLogout}>退出</button>
        </div>
      </nav>

      <div className="generate-page">
        <div className="page-header">
          <h1>🖼️ 商品图生成</h1>
          <p>上传商品图片，AI自动生成精美主图</p>
        </div>

        <div className="generate-container">
          {/* 输入面板 */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-icon">📤</div>
              <h3>上传商品图片</h3>
            </div>
            <div className="panel-body">
              <div className="upload-area" style={{ position: 'relative' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    opacity: 0, 
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }}
                />
                {preview ? (
                  <img src={preview} alt="预览" style={{ maxWidth: '100%', borderRadius: '12px' }} />
                ) : (
                  <>
                    <div className="upload-icon">📷</div>
                    <p>点击或拖拽上传商品图片</p>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>支持 JPG、PNG、WebP</p>
                  </>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">选择风格</label>
                <select 
                  className="form-input"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                >
                  {styles.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <button 
                className="btn btn-primary"
                onClick={generate}
                disabled={!file || generating}
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
                  <span>AI正在生成中，请稍候...</span>
                </div>
              ) : result ? (
                <>
                  <div className="output-preview">
                    <img src={result} alt="生成结果" />
                  </div>
                  <div className="output-actions">
                    <button className="btn btn-success btn-sm">💾 下载图片</button>
                    <button className="btn btn-secondary btn-sm" onClick={generate}>🔄 重新生成</button>
                  </div>
                </>
              ) : (
                <div className="output-preview" style={{ color: '#999' }}>
                  <div className="upload-icon">🎨</div>
                  <p>上传图片并点击生成，等待AI创作</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
