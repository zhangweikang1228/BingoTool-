'use client'

import { useState } from 'react'
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

  const generate = async () => {
    if (!productInfo) return
    
    setGenerating(true)
    
    // 模拟API调用
    const res = await fetch('/api/generate/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productInfo, platform, tone })
    })
    
    const data = await res.json()
    setResult(data.text || '这是一款非常实用的产品...\n\n【产品亮点】\n✨ 亮点1：设计精美\n✨ 亮点2：品质卓越\n✨ 亮点3：性价比高\n\n快来试试吧！')
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
            <li><Link href="/generate/text" style={{ color: '#6366f1' }}>种草文案</Link></li>
            <li><Link href="/generate/model">虚拟模特</Link></li>
            <li><Link href="/generate/translate">翻译</Link></li>
          </ul>
        </div>
      </nav>

      <div className="container generate-page">
        <div className="generate-header">
          <h1>种草文案生成</h1>
          <p>输入商品信息，AI生成种草文案</p>
        </div>

        <div className="generate-container">
          {/* 输入面板 */}
          <div className="input-panel">
            <h3 className="panel-title">输入商品信息</h3>
            
            <div className="form-group">
              <label>商品描述</label>
              <textarea
                className="textarea"
                placeholder="请输入商品名称、特点、卖点等信息...
例如：这款连衣裙采用优质雪纺面料，轻薄透气，适合夏季穿着。设计简约大方，显瘦遮肉，多色可选。"
                value={productInfo}
                onChange={(e) => setProductInfo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>发布平台</label>
              <select className="select" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {platforms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>文案风格</label>
              <select className="select" value={tone} onChange={(e) => setTone(e.target.value)}>
                {tones.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px' }}
              onClick={generate}
              disabled={!productInfo || generating}
            >
              {generating ? '生成中...' : '生成种草文案'}
            </button>
          </div>

          {/* 输出面板 */}
          <div className="output-panel">
            <h3 className="panel-title">生成结果</h3>
            
            {generating ? (
              <div className="generating">
                <div className="spinner"></div>
                <span>AI正在创作中...</span>
              </div>
            ) : result ? (
              <div>
                <div className="output-content">{result}</div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(result)}>
                    复制文案
                  </button>
                  <button className="btn btn-secondary" onClick={generate}>
                    重新生成
                  </button>
                </div>
              </div>
            ) : (
              <div className="output-content" style={{ textAlign: 'center', color: '#999' }}>
                输入商品信息，点击生成按钮
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
