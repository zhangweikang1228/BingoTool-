'use client'
import { useState, useRef, useCallback } from 'react'
import './page.css'

// ─── 常量 ────────────────────────────────────────────────
const ANGLE_MAP  = ['front','side','back','angle45','top','detail']
const ANGLE_LABELS = ['正面图','侧面图','背面图','45°视角','俯视图','细节图']
const STYLE_OPTS = [
  { id:'xiaohongshu' as const, label:'小红书', emoji:'📕' },
  { id:'douyin'     as const, label:'抖音',   emoji:'🎵' },
  { id:'weibo'      as const, label:'微博',   emoji:'🌟' },
]
const SCENE_OPTS = [
  { id:'unbox',  label:'开箱展示', icon:'📦' },
  { id:'style',  label:'穿搭/摆放', icon:'👗' },
  { id:'detail', label:'细节特写', icon:'🔍' },
  { id:'scene',  label:'场景带入', icon:'🏠' },
]

// ─── 工具 ────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

function toast(msg: string, ms = 2000) {
  const el = document.getElementById('toast')
  if (!el) return
  el.textContent = msg
  el.style.display = 'block'
  setTimeout(() => { el.style.display = 'none' }, ms)
}

// ─── 主组件 ──────────────────────────────────────────────
export default function AppPage() {
  const [tab, setTab] = useState<'photo'|'copy'|'video'>('photo')
  return (
    <div className="app">
      <header className="hdr">
        <div className="hdr-logo"><span>🛒</span> AI电商内容工坊</div>
        <div className="hdr-badge">MiniMax AI</div>
      </header>
      <div className="page">
        {tab === 'photo' && <PhotoModule key="photo" />}
        {tab === 'copy'  && <CopyModule  key="copy" />}
        {tab === 'video' && <VideoModule key="video" />}
      </div>
      <div className="tabbar">
        {[
          { id:'photo' as const, icon:'📸', label:'商品主图' },
          { id:'copy'  as const, icon:'✍️', label:'种草文案' },
          { id:'video' as const, icon:'🎬', label:'视频脚本' },
        ].map(t => (
          <button key={t.id} className={`tab-btn ${tab===t.id?'on':''}`} onClick={()=>setTab(t.id)}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </div>
      <div id="toast" className="toast" style={{display:'none'}} />
    </div>
  )
}

// ─── 商品主图模块 ─────────────────────────────────────────
function PhotoModule() {
  const [img,       setImg]       = useState<string|null>(null)
  const [imgUrl,    setImgUrl]    = useState<string|null>(null)
  const [sel,       setSel]       = useState([true,false,false,true,false,false])
  const [results,   setResults]   = useState<Record<string,string>>({})
  const [errors,    setErrors]    = useState<Record<string,string>>({})
  const [loading,   setLoading]   = useState(false)
  const [view,      setView]      = useState<'create'|'result'>('create')
  const [progress,  setProgress]  = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const toggle = (i: number) => {
    const s = [...sel]; s[i]=!s[i]; setSel(s)
  }

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { toast('图片不能超过 10MB'); return }
    const reader = new FileReader()
    reader.onload = ev => { setImg(ev.target?.result as string); setResults({}); setErrors({}); setView('create') }
    reader.readAsDataURL(f)
    // 上传获取公开 URL
    const form = new FormData()
    form.append('file', f)
    try {
      const res = await fetch('/api/upload', { method:'POST', body:form })
      const data = await res.json()
      if (data.url) setImgUrl(data.url)
      else toast('图片上传失败，AI生成可能受影响')
    } catch { toast('上传服务暂不可用') }
  }, [])

  const generate = useCallback(async () => {
    if (!imgUrl && !img) { toast('请先上传商品图片'); return }
    setLoading(true)
    setProgress(0)
    setResults({})
    setErrors({})
    const selected = ANGLE_MAP.filter((_, i) => sel[i])
    const out: Record<string,string> = {}
    const errs: Record<string,string> = {}

    for (let idx = 0; idx < selected.length; idx++) {
      const id = selected[idx]
      setProgress(Math.round((idx / selected.length) * 100))
      try {
        const res = await fetch('/api/ai/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: imgUrl || img, angle: id }),
        })
        const data = await res.json()
        if (data.url) out[id] = data.url
        else errs[id] = data.error || '生成失败'
      } catch (e: unknown) {
        errs[id] = '网络错误，请检查网络'
      }
    }

    // demo 模式：无 API Key 时用占位图演示
    if (Object.keys(out).length === 0 && selected.length > 0) {
      for (const id of selected) {
        out[id] = `https://picsum.photos/seed/${id}${Date.now()}/480/480`
        await sleep(400)
      }
    }

    setResults(out)
    setErrors(errs)
    setProgress(100)
    setLoading(false)
    setView('result')
  }, [imgUrl, img, sel])

  const reset = () => {
    setImg(null); setImgUrl(null); setResults({}); setErrors({})
    setSel([true,false,false,true,false,false])
    if (fileRef.current) fileRef.current.value = ''
    setView('create')
  }

  return (
    <div className="module">
      {view === 'create' ? (
        <div className="card">
          <div className="card-title">
            📸 商品多角度图 <span className="tag">MiniMax AI</span>
          </div>

          <div className="upload-zone" onClick={()=>fileRef.current?.click()}>
            {img ? (
              <div className="img-preview-wrap">
                <img src={img} className="preview-img" alt="预览" />
                <div className="upload-overlay">点击更换图片</div>
              </div>
            ) : (
              <div>
                <div className="upload-icon">🖼️</div>
                <div className="upload-t1">点击上传商品图片</div>
                <div className="upload-t2">支持 JPG/PNG/WebP，建议白底图</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile} />

          {img && (
            <button className="btn-ghost btn-sm reset-btn" onClick={reset}>↺ 重新上传</button>
          )}

          <div className="chip-label">选择生成视角（可多选）</div>
          <div className="chip-grid">
            {ANGLE_LABELS.map((l, i) => (
              <div key={i} className={`chip ${sel[i]?'on':''}`} onClick={()=>toggle(i)}>
                <span className="chip-dot">{sel[i]?'✓':''}</span>{l}
              </div>
            ))}
          </div>
          <div className="info-row">已选 <b>{sel.filter(Boolean).length}</b> 个视角</div>

          {loading && (
            <div className="progress-wrap">
              <div className="progress-bar">
                <div className="progress-fill" style={{width:`${progress}%`}} />
              </div>
              <div className="progress-text">⏳ AI 正在生成中... {progress}%</div>
            </div>
          )}

          <button
            className={`btn-primary ${(!img || loading) ? 'disabled' : ''}`}
            onClick={generate}
            disabled={!img || loading}
          >
            {loading ? `⏳ 生成中 ${progress}%...` : `🎯 生成 ${sel.filter(Boolean).length} 张多角度图`}
          </button>

          <div className="api-tip">💡 配置 MINIMAX_API_KEY 后可生成真实 AI 商品图</div>
        </div>
      ) : (
        <div className="card">
          <div className="result-header">
            <div className="muted-text">🖼️ 生成结果（点击查看大图）</div>
            <button className="btn-ghost btn-sm" onClick={()=>setView('create')}>← 继续生成</button>
          </div>

          <div className="result-grid">
            {Object.entries(results).map(([id, url]) => {
              const label = ANGLE_LABELS[ANGLE_MAP.indexOf(id)]
              return (
                <div key={id} className="rgrid-item">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} className="rgrid-img" alt={label} loading="lazy" />
                  </a>
                  <div className="rgrid-lbl">{label}</div>
                </div>
              )
            })}
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="error-box">
              <div className="error-title">⚠️ 部分生成失败</div>
              {Object.entries(errors).map(([id, msg]) => (
                <div key={id} className="error-item">
                  {ANGLE_LABELS[ANGLE_MAP.indexOf(id)]}：{msg}
                  <button className="btn-ghost btn-sm" onClick={async () => {
                    const res = await fetch('/api/ai/image', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ imageUrl: imgUrl||img, angle:id }) })
                    const data = await res.json()
                    if (data.url) { setResults(prev=>({...prev,[id]:data.url})); setErrors(prev=>{const n={...prev};delete n[id];return n}) }
                  }}>重试</button>
                </div>
              ))}
            </div>
          )}

          <button className="btn-primary" onClick={generate} disabled={loading}>
            🔄 重新生成
          </button>
        </div>
      )}
    </div>
  )
}

// ─── 种草文案模块 ─────────────────────────────────────────
function CopyModule() {
  const [style, setStyle]     = useState<'xiaohongshu'|'douyin'|'weibo'>('xiaohongshu')
  const [input, setInput]     = useState('')
  const [output, setOutput]   = useState('')
  const [loading, setLoading]  = useState(false)
  const [error,   setError]   = useState('')
  const [copied, setCopied]  = useState(false)

  const generate = async () => {
    if (!input.trim()) { toast('请输入商品描述'); return }
    setLoading(true); setOutput(''); setError('')
    try {
      const res = await fetch('/api/ai/copy', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ product: input, platform: style }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setOutput(data.text || '')
    } catch { setError('网络错误，请检查网络连接') }
    setLoading(false)
  }

  const copy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      toast('已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="module">
      <div className="card">
        <div className="card-title">✍️ AI 种草文案 <span className="tag">MiniMax LLM</span></div>

        <div className="style-tabs">
          {STYLE_OPTS.map(s => (
            <button key={s.id} className={`style-tab ${style===s.id?'on':''}`} onClick={()=>setStyle(s.id)}>
              <span>{s.emoji}</span>{s.label}
            </button>
          ))}
        </div>

        <textarea
          className="ta"
          rows={4}
          placeholder={`描述你的商品，越详细效果越好~\n\n示例：${style==='xiaohongshu'?'韩系碎花连衣裙，夏季新款，透气轻薄，适合小个子女生，浅绿色' : style==='douyin'?'无线蓝牙耳机，主动降噪，续航30小时，游戏低延迟' : '人体工学办公椅，可调节腰靠，久坐不累'}`}
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter' && e.ctrlKey) generate() }}
        />

        {error && <div className="error-box" style={{marginBottom:12}}><span>❌ </span>{error}</div>}

        {loading ? (
          <div className="skeleton-box">
            <div className="skeleton-line" style={{width:'95%'}} />
            <div className="skeleton-line" style={{width:'88%'}} />
            <div className="skeleton-line" style={{width:'92%'}} />
            <div className="skeleton-line" style={{width:'70%'}} />
          </div>
        ) : output ? (
          <button className="btn-primary" onClick={generate}>🔄 重新生成</button>
        ) : (
          <button className="btn-primary" onClick={generate} disabled={!input.trim()||loading}>
            🚀 一键生成种草文案 {input.trim()&&' Ctrl+Enter'}
          </button>
        )}
      </div>

      {output && (
        <div className="card">
          <div className="result-box">
            <div className="result-head">
              <span className="result-head-lbl">{STYLE_OPTS.find(s=>s.id===style)?.emoji} {STYLE_OPTS.find(s=>s.id===style)?.label}风格</span>
              <button className={`btn-ghost btn-sm ${copied?'copied':''}`} onClick={copy}>
                {copied ? '✅ 已复制' : '📋 复制'}
              </button>
            </div>
            <div className="result-body copy-result">{loading ? '' : output}</div>
          </div>
        </div>
      )}

      <div className="tip">
        💡 <strong>小技巧：</strong>描述越详细（品类+特点+人群+场景），AI 生成效果越好。支持 Ctrl+Enter 快捷生成。
      </div>
    </div>
  )
}

// ─── 视频脚本模块 ─────────────────────────────────────────
function VideoModule() {
  const [scene,      setScene]      = useState('unbox')
  const [input,      setInput]      = useState('')
  const [script,     setScript]     = useState('')
  const [sLoading,  setSLoading]  = useState(false)
  const [sError,     setSError]    = useState('')
  const [img,        setImg]        = useState<string|null>(null)
  const [imgUrl,     setImgUrl]     = useState<string|null>(null)
  const [videoUrl,   setVideoUrl]   = useState<string|null>(null)
  const [vLoading,   setVLoading]  = useState(false)
  const [vError,     setVError]    = useState('')
  const [scriptCopied, setScriptCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { toast('图片不能超过 10MB'); return }
    const reader = new FileReader()
    reader.onload = ev => { setImg(ev.target?.result as string); setVideoUrl(null); setVError('') }
    reader.readAsDataURL(f)
    const form = new FormData(); form.append('file', f)
    try {
      const res = await fetch('/api/upload', { method:'POST', body:form })
      const data = await res.json()
      if (data.url) setImgUrl(data.url)
    } catch {}
  }, [])

  const genScript = async () => {
    if (!input.trim()) { toast('请输入商品描述'); return }
    setSLoading(true); setScript(''); setSError('')
    try {
      const res = await fetch('/api/ai/copy', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ product: input + `（视频场景：${SCENE_OPTS.find(s=>s.id===scene)?.label}）`, platform: 'douyin' }),
      })
      const data = await res.json()
      if (data.error) { setSError(data.error); return }
      setScript(data.text || '')
    } catch { setSError('网络错误') }
    setSLoading(false)
  }

  const genVideo = async () => {
    if (!imgUrl && !img) { toast('请先上传商品图片'); return }
    setVLoading(true); setVideoUrl(null); setVError('')
    toast('视频生成中，预计需要 10-30 秒...')
    try {
      const res = await fetch('/api/ai/video', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ imageUrl: imgUrl || img, duration: 6 }),
      })
      const data = await res.json()
      if (data.error) { setVError(data.error); return }
      setVideoUrl(data.url)
      toast('🎉 视频生成完成！')
    } catch { setVError('网络错误，请重试') }
    setVLoading(false)
  }

  return (
    <div className="module">
      <div className="card">
        <div className="card-title">🎬 AI 短视频脚本 <span className="tag">MiniMax AI</span></div>

        <div className="chip-label">选择视频场景</div>
        <div className="scene-grid">
          {SCENE_OPTS.map(s => (
            <div key={s.id} className={`scene-card ${scene===s.id?'on':''}`} onClick={()=>setScene(s.id)}>
              <span className="scene-icon">{s.icon}</span><span>{s.label}</span>
            </div>
          ))}
        </div>

        <textarea
          className="ta"
          rows={3}
          placeholder="描述你的商品，例如：韩系碎花连衣裙，夏季新款，透气轻薄，适合小个子..."
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter' && e.ctrlKey) genScript() }}
        />

        {sError && <div className="error-box" style={{marginBottom:12}}><span>❌ </span>{sError}</div>}

        {sLoading ? (
          <div className="skeleton-box">
            <div className="skeleton-line" style={{width:'90%'}} />
            <div className="skeleton-line" style={{width:'75%'}} />
            <div className="skeleton-line" style={{width:'85%'}} />
          </div>
        ) : script ? (
          <button className="btn-primary" onClick={genScript}>🔄 重新生成</button>
        ) : (
          <button className="btn-primary" onClick={genScript} disabled={!input.trim()||sLoading}>
            🚀 生成短视频脚本
          </button>
        )}
      </div>

      {script && (
        <div className="card">
          <div className="result-box">
            <div className="result-head">
              <span className="result-head-lbl">🎬 {SCENE_OPTS.find(s=>s.id===scene)?.label} · 脚本</span>
              <button className={`btn-ghost btn-sm ${scriptCopied?'copied':''}`}
                onClick={()=>{ navigator.clipboard.writeText(script); setScriptCopied(true); toast('已复制'); setTimeout(()=>setScriptCopied(false),2000) }}>
                {scriptCopied?'✅ 已复制':'📋 复制'}
              </button>
            </div>
            <pre className="result-body script-text">{script}</pre>
          </div>
        </div>
      )}

      <div className="divider">— 进阶：AI 虚拟模特展示视频 —</div>

      <div className="card">
        <div className="upload-zone" onClick={()=>fileRef.current?.click()}
          style={img?{padding:'12px',borderStyle:'solid'}:{}}>
          {img ? (
            <div className="img-preview-wrap">
              <img src={img} className="preview-img" alt="预览" style={{maxHeight:140}} />
              <div className="upload-overlay">点击更换图片</div>
            </div>
          ) : (
            <div><div className="upload-icon">👗</div><div className="upload-t1">上传商品图片</div><div className="upload-t2">生成 AI 虚拟模特展示视频</div></div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile} />

        {vError && <div className="error-box" style={{marginBottom:12}}><span>❌ </span>{vError}</div>}

        <button
          className={`btn-primary ${(!img || vLoading) ? '' : ''}`}
          onClick={genVideo}
          disabled={!img || vLoading}
        >
          {vLoading ? '⏳ AI 视频生成中（需 10-30 秒）...' : '🎙️ 生成 AI 虚拟模特视频'}
        </button>

        {videoUrl && (
          <div className="video-wrap">
            <video key={videoUrl} src={videoUrl} controls className="video-el" />
          </div>
        )}

        <div className="api-tip">💡 配置 MINIMAX_API_KEY 后可生成真实 AI 视频</div>
      </div>
    </div>
  )
}
