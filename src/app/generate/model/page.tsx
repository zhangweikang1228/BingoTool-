'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const models = [
  { id: 'asian-female', name: '亚洲女性' },
  { id: 'asian-male', name: '亚洲男性' },
  { id: 'western-female', name: '欧美女性' },
  { id: 'western-male', name: '欧美男性' },
  { id: 'african-female', name: '非洲女性' },
]

const scenes = [
  { id: 'studio', name: '摄影棚' },
  { id: 'outdoor', name: '户外场景' },
  { id: 'urban', name: '城市街景' },
  { id: 'beach', name: '海边沙滩' },
]

export default function ModelGeneratePage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [model, setModel] = useState('asian-female')
  const [scene, setScene] = useState('studio')
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
    await new Promise(resolve => setTimeout(resolve, 3000))
    setResult('https://picsum.photos/600/800')
    setGenerating(false)
  }

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
          <li><Link href="/generate/text">种草文案</Link></li>
          <li><Link href="/generate/model" className="active">虚拟模特</Link></li>
          <li><Link href="/generate/translate">翻译</Link></li>
        </ul>
        <div className="nav-actions">
          <button className="btn btn-secondary" onClick={handleLogout}>退出</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <h1>👗 虚拟模特试穿</h1>
          <p>上传服装图片，AI生成模特上身效果图</p>
        </div>

        <div className="generate-container">
          {/* 输入面板 */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-icon">👕</div>
              <h3>上传服装图片</h3>
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
                    <div className="upload-icon">👗</div>
                    <p>点击或拖拽上传服装图片</p>
                    <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>建议纯色背景，效果更佳</p>
                  </>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">选择模特</label>
                <select className="form-select" value={model} onChange={(e) => setModel(e.target.value)}>
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">选择场景</label>
                <select className="form-select" value={scene} onChange={(e) => setScene(e.target.value)}>
                  {scenes.map(s => (
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
                  <span>AI模特试穿中，请稍候...</span>
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
                  <div className="upload-icon">👤</div>
                  <p>上传服装图片，点击生成按钮</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
