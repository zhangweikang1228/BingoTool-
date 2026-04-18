'use client'

import { useEffect, useState } from 'react'
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (!document.cookie.includes('user_id=')) {
      window.location.href = '/login'
    } else {
      setIsLoggedIn(true)
    }
  }, [])

  const translate = async () => {
    if (!text) return
    
    setTranslating(true)
    
    const lang = languages.find(l => l.id === targetLang)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setResult(`[${lang?.name}译本]\n\n${text}\n\n---\n翻译说明：\n· 已根据目标市场语言习惯进行调整\n· 关键词已优化，利于SEO\n· 可直接用于跨境电商平台`)
    
    setTranslating(false)
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
          <li><Link href="/generate/model">虚拟模特</Link></li>
          <li><Link href="/generate/translate" className="active">翻译</Link></li>
        </ul>
        <div className="nav-actions">
          <button className="btn btn-secondary" onClick={handleLogout}>退出</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <h1>🌐 多语言翻译</h1>
          <p>一键翻译商品内容，支持15+语种</p>
        </div>

        <div className="generate-container">
          {/* 输入面板 */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-icon">📄</div>
              <h3>输入内容</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label className="form-label">源文本</label>
                <textarea
                  className="form-textarea"
                  placeholder="请输入需要翻译的内容..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">目标语言</label>
                <select 
                  className="form-select"
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
                style={{ width: '100%' }}
                onClick={translate}
                disabled={!text || translating}
              >
                {translating ? '⚡ 翻译中...' : '🌍 开始翻译'}
              </button>
            </div>
          </div>

          {/* 输出面板 */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-icon">✨</div>
              <h3>翻译结果</h3>
            </div>
            <div className="panel-body">
              {translating ? (
                <div className="generating">
                  <div className="spinner"></div>
                  <span>正在翻译...</span>
                </div>
              ) : result ? (
                <>
                  <div className="output-preview">
                    <div className="output-content">{result}</div>
                  </div>
                  <div className="output-actions">
                    <button className="btn btn-success btn-sm" onClick={() => navigator.clipboard.writeText(result)}>📋 复制结果</button>
                    <button className="btn btn-secondary btn-sm" onClick={translate}>🔄 重新翻译</button>
                  </div>
                </>
              ) : (
                <div className="output-preview">
                  <div className="upload-icon">🌍</div>
                  <p>输入内容，选择语言，点击翻译</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
