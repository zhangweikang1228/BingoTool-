'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [text, setText] = useState('')
  const [targetLang, setTargetLang] = useState('en')
  const [translating, setTranslating] = useState(false)
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

  const translate = async () => {
    if (!text) return
    
    setTranslating(true)
    
    // 调用后端 API
    try {
      const res = await fetch('/api/generate/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang })
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
      console.error('[Translate] 错误:', error)
    } finally {
      setTranslating(false)
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
