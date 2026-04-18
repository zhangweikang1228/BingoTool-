'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const styles = [
  { id: 'default', name: '默认风格' },
  { id: 'outdoor', name: '户外场景' },
  { id: 'studio', name: '摄影棚' },
  { id: 'lifestyle', name: '生活场景' },
]

export default function ImageGeneratePage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [style, setStyle] = useState('default')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')

  // 检查登录状态
  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, c) => {
      const [k, v] = c.trim().split('=')
      acc[k] = v
      return acc
    }, {} as Record<string, string>)
    
    // 检查 b_session cookie（与 auth.ts 中定义的保持一致）
    if (!cookies['b_session']) {
      router.push('/login')
    }
  }, [router])

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
    
    // 调用后端 API
    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (res.status === 401) {
        router.push('/login')
        return
      }
      
      const data = await res.json()
      if (data.url) {
        setResult(data.url)
      }
    } catch (error) {
      console.error('[Image Generate] 错误:', error)
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
          <li><Link href="/generate/image" className="active">商品图</Link></li>
          <li><Link href="/generate/text">种草文案</Link></li>
          <li><Link href="/generate/model">虚拟模特</Link></li>
          <li><Link href="/generate/translate">翻译</Link></li>
        </ul>
        <div className="nav-actions">
          <button className="btn btn-secondary" onClick={handleLogout}>退出</button>
        </div>
      </nav>

      <div className="page-content">
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
              <div className="upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {preview ? (
                  <img src={preview} alt="预览" />
                ) : (
                  <>
                    <div className="upload-icon">📷</div>
                    <p>点击或拖拽上传商品图片</p>
                    <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>支持 JPG、PNG、WebP</p>
                  </>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">选择风格</label>
                <select 
                  className="form-select"
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
                style={{ width: '100%' }}
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
                <div className="output-preview">
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
