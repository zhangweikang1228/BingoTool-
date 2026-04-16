'use client'
import { useState, useRef } from 'react'
import './page.css'

const ANGLE_MAP = ['front','side','back','angle45','top','detail']
const ANGLE_LABELS = ['正面图','侧面图','背面图','45°视角','俯视图','细节图']

export default function AppPage() {
  const [tab, setTab] = useState<'photo'|'copy'|'video'>('photo')
  return (
    <div className="app">
      <header className="hdr">
        <div className="hdr-logo"><span>🛒</span> AI电商内容工坊</div>
        <div className="hdr-badge">MiniMax AI</div>
      </header>
      <div className="page">
        {tab === 'photo' && <PhotoModule />}
        {tab === 'copy'  && <CopyModule />}
        {tab === 'video' && <VideoModule />}
      </div>
      <div className="tabbar">
        <button className={`tab-btn ${tab==='photo'?'on':''}`} onClick={()=>setTab('photo')}><span className="tab-icon">📸</span><span className="tab-label">商品主图</span></button>
        <button className={`tab-btn ${tab==='copy'?'on':''}`}  onClick={()=>setTab('copy')}><span className="tab-icon">✍️</span><span className="tab-label">种草文案</span></button>
        <button className={`tab-btn ${tab==='video'?'on':''}`} onClick={()=>setTab('video')}><span className="tab-icon">🎬</span><span className="tab-label">视频脚本</span></button>
      </div>
    </div>
  )
}

function PhotoModule() {
  const [img, setImg] = useState<string|null>(null)
  const [imgUrl, setImgUrl] = useState<string|null>(null)
  const [sel, setSel] = useState([true,false,false,true,false,false])
  const [results, setResults] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'create'|'result'>('create')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    const reader = new FileReader()
    reader.onload = ev => { setImg(ev.target?.result as string); setResults({}); setView('create') }
    reader.readAsDataURL(f)
    const form = new FormData(); form.append('file', f)
    try {
      const res = await fetch('/api/upload', { method:'POST', body:form })
      const data = await res.json(); setImgUrl(data.url)
    } catch {}
  }

  const toggle = (i: number) => { const s=[...sel]; s[i]=!s[i]; setSel(s) }

  const generate = async () => {
    if (!imgUrl) { alert('图片上传中，请稍候'); return }
    setLoading(true)
    const out: Record<string,string> = {}
    for (const [i, id] of ANGLE_MAP.entries()) {
      if (!sel[i]) continue
      try {
        const res = await fetch('/api/ai/image', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ imageUrl: imgUrl, angle: id }) })
        const data = await res.json()
        out[id] = data.url || `https://picsum.photos/seed/${id}${Date.now()}/480/480`
      } catch { out[id] = `https://picsum.photos/seed/${id}${Date.now()}/480/480` }
    }
    setResults(out); setLoading(false); setView('result')
  }

  const reset = () => { setImg(null); setImgUrl(null); setResults({}); setSel([true,false,false,true,false,false]); fileRef.current && (fileRef.current.value='') }

  return (
    <div className="module">
      {view === 'create' ? (
        <div className="card">
          <div className="card-title">📸 商品多角度图 <span className="tag">MiniMax AI</span></div>
          <div className="upload-zone" onClick={()=>fileRef.current?.click()}>
            {img ? <img src={img} className="preview-img" alt="预览" /> : <div><div className="upload-icon">🖼️</div><div className="upload-t1">点击上传商品图片</div><div className="upload-t2">白底图效果最佳 · JPG/PNG</div></div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile} />
          {img && <button className="btn-ghost btn-sm" onClick={reset}>↺ 重新上传</button>}
          <div className="chip-label">选择生成视角（可多选）</div>
          <div className="chip-grid">
            {ANGLE_LABELS.map((l,i)=><div key={i} className={`chip ${sel[i]?'on':''}`} onClick={()=>toggle(i)}><span className="chip-dot">{sel[i]?'✓':''}</span>{l}</div>)}
          </div>
          <div className="info-row">已选 <b>{sel.filter(Boolean).length}</b> 个视角</div>
          <button className="btn-primary" onClick={generate} disabled={!img||loading}>{loading ? '⏳ AI 生成中...' : `🎯 生成 ${sel.filter(Boolean).length} 张多角度图`}</button>
        </div>
      ) : (
        <div className="card">
          <div className="flex-between" style={{marginBottom:12}}>
            <div className="muted-text">🖼️ 生成结果（点击查看大图）</div>
            <button className="btn-ghost btn-sm" onClick={()=>setView('create')}>← 继续生成</button>
          </div>
          <div className="result-grid">
            {Object.entries(results).map(([id,url])=>(
              <div key={id} className="rgrid-item">
                <a href={url} target="_blank" rel="noopener"><img src={url} className="rgrid-img" alt={ANGLE_LABELS[ANGLE_MAP.indexOf(id)]} /></a>
                <div className="rgrid-lbl">{ANGLE_LABELS[ANGLE_MAP.indexOf(id)]}</div>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={generate}>🔄 重新生成</button>
        </div>
      )}
    </div>
  )
}

function CopyModule() {
  const [style, setStyle] = useState<'xiaohongshu'|'douyin'|'weibo'>('xiaohongshu')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const styles = [{ id:'xiaohongshu' as const, label:'小红书', emoji:'📕' },{ id:'douyin' as const, label:'抖音', emoji:'🎵' },{ id:'weibo' as const, label:'微博', emoji:'🌟' }]

  const generate = async () => {
    if (!input.trim()) return
    setLoading(true); setShowResult(true); setOutput('')
    try {
      const res = await fetch('/api/ai/copy', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ product: input, platform: style }) })
      const data = await res.json(); setOutput(data.text || '生成失败')
    } catch { setOutput('网络错误，请重试') }
    setLoading(false)
  }

  return (
    <div className="module">
      <div className="card">
        <div className="card-title">✍️ AI 种草文案 <span className="tag">MiniMax LLM</span></div>
        <div className="style-tabs">{styles.map(s=><button key={s.id} className={`style-tab ${style===s.id?'on':''}`} onClick={()=>setStyle(s.id)}><span>{s.emoji}</span>{s.label}</button>)}</div>
        <textarea className="ta" rows={4} placeholder="描述你的商品，越详细越好~\n例如：韩系碎花连衣裙，夏季新款，透气轻薄，适合小个子..." value={input} onChange={e=>setInput(e.target.value)} />
        {!showResult && <button className="btn-primary" onClick={generate} disabled={!input.trim()||loading}>{loading ? '⏳ AI 撰写中...' : '🚀 一键生成种草文案'}</button>}
      </div>
      {showResult && (
        <div className="card">
          <div className="result-box">
            <div className="result-head">
              <span className="result-head-lbl">{styles.find(s=>s.id===style)?.emoji} {styles.find(s=>s.id===style)?.label}风格</span>
              <button className="btn-ghost btn-sm" onClick={()=>navigator.clipboard.writeText(output)}>📋 复制</button>
            </div>
            <div className="result-body">{loading ? <span className="dot-anim">● 生成中...</span> : output}</div>
          </div>
          <button className="btn-primary" onClick={generate} disabled={loading}>🔄 重新生成</button>
        </div>
      )}
      <div className="tip">💡 描述越详细，AI生成效果越好。可包含：商品特点 + 目标用户 + 使用场景 + 价格定位</div>
    </div>
  )
}

function VideoModule() {
  const [scene, setScene] = useState('unbox')
  const [input, setInput] = useState('')
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [showScript, setShowScript] = useState(false)
  const [img, setImg] = useState<string|null>(null)
  const [imgUrl, setImgUrl] = useState<string|null>(null)
  const [videoUrl, setVideoUrl] = useState<string|null>(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const scenes = [{id:'unbox',label:'开箱展示',icon:'📦'},{id:'style',label:'穿搭/摆放',icon:'👗'},{id:'detail',label:'细节特写',icon:'🔍'},{id:'scene',label:'场景带入',icon:'🏠'}]

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    const reader = new FileReader()
    reader.onload = ev => { setImg(ev.target?.result as string); setVideoUrl(null) }
    reader.readAsDataURL(f)
    const form = new FormData(); form.append('file', f)
    try { const res = await fetch('/api/upload', {method:'POST',body:form}); const data = await res.json(); setImgUrl(data.url) } catch {}
  }

  const genScript = async () => {
    if (!input.trim()) return
    setLoading(true); setScript(''); setShowScript(true)
    try {
      const res = await fetch('/api/ai/copy', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ product: input + '，场景类型：' + scenes.find(s=>s.id===scene)?.label, platform: 'douyin' }) })
      const data = await res.json(); setScript(data.text || '生成失败')
    } catch { setScript('网络错误') }
    setLoading(false)
  }

  const genVideo = async () => {
    if (!imgUrl) return
    setVideoLoading(true); setVideoUrl(null)
    try {
      const res = await fetch('/api/ai/video', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ imageUrl: imgUrl, duration: 6 }) })
      const data = await res.json(); setVideoUrl(data.url)
    } catch { setVideoUrl('https://picsum.photos/seed/vid'+Date.now()+'/640/360') }
    setVideoLoading(false)
  }

  return (
    <div className="module">
      <div className="card">
        <div className="card-title">🎬 AI 短视频脚本 <span className="tag">MiniMax AI</span></div>
        <div className="chip-label">选择视频场景</div>
        <div className="scene-grid">{scenes.map(s=><div key={s.id} className={`scene-card ${scene===s.id?'on':''}`} onClick={()=>setScene(s.id)}><span className="scene-icon">{s.icon}</span><span>{s.label}</span></div>)}</div>
        <textarea className="ta" rows={3} placeholder="描述你的商品，例如：韩系碎花连衣裙，夏季新款..." value={input} onChange={e=>setInput(e.target.value)} />
        <button className="btn-primary" onClick={genScript} disabled={!input.trim()||loading}>{loading ? '⏳ AI 生成脚本中...' : '🚀 生成短视频脚本'}</button>
      </div>
      {showScript && (
        <div className="card">
          <div className="result-box">
            <div className="result-head"><span className="result-head-lbl">🎬 视频脚本</span><button className="btn-ghost btn-sm" onClick={()=>navigator.clipboard.writeText(script)}>📋 复制</button></div>
            <pre className="result-body" style={{whiteSpace:'pre-wrap',fontSize:13}}>{loading?'正在生成...':script}</pre>
          </div>
          <button className="btn-primary" onClick={genScript} disabled={loading}>🔄 重新生成</button>
        </div>
      )}
      <div className="divider">— 进阶：AI 虚拟模特展示视频 —</div>
      <div className="card">
        <div className="upload-zone" onClick={()=>fileRef.current?.click()} style={img?{padding:'12px',borderStyle:'solid'}:{}}>
          {img ? <img src={img} className="preview-img" alt="预览" /> : <div><div className="upload-icon">👗</div><div className="upload-t1">上传商品图片</div><div className="upload-t2">生成 AI 虚拟模特展示视频</div></div>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile} />
        <button className="btn-primary" onClick={genVideo} disabled={!imgUrl||videoLoading}>{videoLoading ? '⏳ 视频生成中（需10-30秒）...' : '🎙️ 生成 AI 虚拟模特视频'}</button>
        {videoUrl && <video src={videoUrl} controls className="video-el" style={{marginTop:12}} />}
      </div>
    </div>
  )
}
