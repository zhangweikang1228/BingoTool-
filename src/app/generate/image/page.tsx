'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ImageGeneratePage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [style, setStyle] = useState('default')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // 检查登录状态
    const userId = document.cookie.includes('user_id=')
    if (!userId) {
      router.push('/login')
    } else {
      setIsLoggedIn(true)
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
    
    // 模拟生成
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟结果
    setResult('https://picsum.photos/800/600')
    setGenerating(false)
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
          <div className="logo">BingoTool</div>
          <ul className="nav-links">
            <li><a href="/dashboard">仪表盘</a></li>
            <li><a href="/generate/image" style={{ color: '#6366f1' }}>商品图</a></li>
            <li><a href="/generate/text">种草文案</a></li>
            <li><a href="/generate/model">虚拟模特</a></li>
            <li><a href="/generate/translate">翻译</a></li>
          </ul>
          <div>
            <button className="btn btn-secondary" onClick={() => {
              document.cookie = 'user_id=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
              router.push('/login')
            }}>退出登录</button>
          </div>
        </div>
      </nav>

      <div className="container generate-page">
        <div className="generate-header">
          <h1>商品图生成</h1>
          <p>上传商品图片，AI自动生成精美主图</p>
        </div>

        <div className="generate-container">
          {/* 输入面板 */}
          <div className="input-panel">
            <h3 className="panel-title">上传商品图片</h3>
            
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
                <img src={preview} alt="预览" className="output-image" />
              ) : (
                <>
                  <div className="icon">📷</div>
                  <p>点击或拖拽上传商品图片</p>
                  <p style={{ fontSize: '12px', color: '#999' }}>支持 JPG、PNG、WebP</p>
                </>
              )}
            </div>

            <div className="form-group">
              <label>选择风格</label>
              <select 
                className="select" 
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                <option value="default">默认风格</option>
                <option value="outdoor">户外场景</option>
                <option value="studio">摄影棚</option>
                <option value="lifestyle">生活场景</option>
              </select>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px' }}
              onClick={generate}
              disabled={!file || generating}
            >
              {generating ? '生成中...' : '生成商品图'}
            </button>
          </div>

          {/* 输出面板 */}
          <div className="output-panel">
            <h3 className="panel-title">生成结果</h3>
            
            {generating ? (
              <div className="generating">
                <div className="spinner"></div>
                <span>AI正在生成中，请稍候...</span>
              </div>
            ) : result ? (
              <div>
                <img src={result} alt="生成结果" className="output-image" />
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary">下载图片</button>
                  <button className="btn btn-secondary">重新生成</button>
                </div>
              </div>
            ) : (
              <div className="output-content" style={{ textAlign: 'center', color: '#999' }}>
                上传图片并点击生成，等待AI创作
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
