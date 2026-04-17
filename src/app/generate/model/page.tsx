'use client'

import { useState } from 'react'
import Link from 'next/link'

const models = [
  { id: 'asian-female', name: '亚洲女性', skin: '#f5d5c8' },
  { id: 'asian-male', name: '亚洲男性', skin: '#e8c4a8' },
  { id: 'western-female', name: '欧美女性', skin: '#f0c8a0' },
  { id: 'western-male', name: '欧美男性', skin: '#d8a878' },
  { id: 'african-female', name: '非洲女性', skin: '#8d5a3c' },
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
    
    // 模拟生成
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setResult('https://picsum.photos/600/800')
    setGenerating(false)
  }

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link href="/" className="logo">BingoTool</Link>
          <ul className="nav-links">
            <li><Link href="/dashboard">仪表盘</Link></li>
            <li><Link href="/generate/image">商品图</Link></li>
            <li><Link href="/generate/text">种草文案</Link></li>
            <li><Link href="/generate/model" style={{ color: '#6366f1' }}>虚拟模特</Link></li>
            <li><Link href="/generate/translate">翻译</Link></li>
          </ul>
        </div>
      </nav>

      <div className="container generate-page">
        <div className="generate-header">
          <h1>虚拟模特试穿</h1>
          <p>上传服装图片，AI生成模特上身效果图</p>
        </div>

        <div className="generate-container">
          {/* 输入面板 */}
          <div className="input-panel">
            <h3 className="panel-title">上传服装图片</h3>
            
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
                  <div className="icon">👗</div>
                  <p>点击或拖拽上传服装图片</p>
                  <p style={{ fontSize: '12px', color: '#999' }}>建议纯色背景，效果更佳</p>
                </>
              )}
            </div>

            <div className="form-group">
              <label>选择模特</label>
              <select className="select" value={model} onChange={(e) => setModel(e.target.value)}>
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>选择场景</label>
              <select className="select" value={scene} onChange={(e) => setScene(e.target.value)}>
                {scenes.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px' }}
              onClick={generate}
              disabled={!file || generating}
            >
              {generating ? '生成中...' : '生成试穿图'}
            </button>
          </div>

          {/* 输出面板 */}
          <div className="output-panel">
            <h3 className="panel-title">生成结果</h3>
            
            {generating ? (
              <div className="generating">
                <div className="spinner"></div>
                <span>AI模特试穿中，请稍候...</span>
              </div>
            ) : result ? (
              <div>
                <img src={result} alt="生成结果" className="output-image" style={{ width: '100%' }} />
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary">下载图片</button>
                  <button className="btn btn-secondary">重新生成</button>
                </div>
              </div>
            ) : (
              <div className="output-content" style={{ textAlign: 'center', color: '#999' }}>
                上传服装图片，点击生成按钮
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
