'use client'

import { useState } from 'react'
import Link from 'next/link'

const languages = [
  { id: 'en', name: '英语', flag: '🇺🇸' },
  { id: 'ja', name: '日语', flag: '🇯🇵' },
  { id: 'ko', name: '韩语', flag: '🇰🇷' },
  { id: 'es', name: '西班牙语', flag: '🇪🇸' },
  { id: 'fr', name: '法语', flag: '🇫🇷' },
  { id: 'de', name: '德语', flag: '🇩🇪' },
  { id: 'pt', name: '葡萄牙语', flag: '🇵🇹' },
  { id: 'ru', name: '俄语', flag: '🇷🇺' },
]

export default function TranslatePage() {
  const [text, setText] = useState('')
  const [targetLang, setTargetLang] = useState('en')
  const [translating, setTranslating] = useState(false)
  const [result, setResult] = useState('')

  const translate = async () => {
    if (!text) return
    
    setTranslating(true)
    
    // 模拟翻译API
    const lang = languages.find(l => l.id === targetLang)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setResult(`[${lang?.name}译本]\n\n${text}\n\n---\n翻译说明：\n· 已根据目标市场语言习惯进行调整\n· 关键词已优化，利于SEO\n· 可直接用于跨境电商平台`)
    
    setTranslating(false)
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
            <li><Link href="/generate/model">虚拟模特</Link></li>
            <li><Link href="/generate/translate" style={{ color: '#6366f1' }}>翻译</Link></li>
          </ul>
        </div>
      </nav>

      <div className="container generate-page">
        <div className="generate-header">
          <h1>多语言翻译</h1>
          <p>一键翻译商品内容，支持15+语种</p>
        </div>

        <div className="generate-container">
          {/* 输入面板 */}
          <div className="input-panel">
            <h3 className="panel-title">输入内容</h3>
            
            <div className="form-group">
              <label>源文本</label>
              <textarea
                className="textarea"
                placeholder="请输入需要翻译的内容..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>目标语言</label>
              <select 
                className="select" 
                value={targetLang} 
                onChange={(e) => setTargetLang(e.target.value)}
              >
                {languages.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px' }}
              onClick={translate}
              disabled={!text || translating}
            >
              {translating ? '翻译中...' : '开始翻译'}
            </button>
          </div>

          {/* 输出面板 */}
          <div className="output-panel">
            <h3 className="panel-title">翻译结果</h3>
            
            {translating ? (
              <div className="generating">
                <div className="spinner"></div>
                <span>正在翻译...</span>
              </div>
            ) : result ? (
              <div>
                <div className="output-content">{result}</div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(result)}>
                    复制结果
                  </button>
                  <button className="btn btn-secondary">重新翻译</button>
                </div>
              </div>
            ) : (
              <div className="output-content" style={{ textAlign: 'center', color: '#999' }}>
                输入内容，选择语言，点击翻译
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
